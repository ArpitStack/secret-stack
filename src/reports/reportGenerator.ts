/**
 * © 2025 ArpitStack. Distributed under Apache-2.0 License.
 * See http://www.apache.org/licenses/LICENSE-2.0 for details.
 */

import { ExtensionContext } from 'vscode';
import * as fs from 'fs';
import { getSeverityDetails } from '../utils/riskSeverityUtils';
import { generateFileSummary, generateFileDetails, generateHtmlReport } from './reportHelper';

/**
 * Generates an HTML report summarizing the secrets found during a scan.
 * The report includes an overview of files scanned, their associated secrets, 
 * severity breakdown, and a detailed listing of secrets found in each file.
 * 
 * @param secrets - Array of secrets found, each containing line number, pattern name, and file path.
 * @param reportPath - The file path where the generated report will be saved.
 * @param totalFilesScanned - The total number of files scanned during the process.
 * @param context - The VS Code extension context, used to retrieve the absolute path of assets.
 * @param secretPatterns - Array of secret patterns with associated severity.
 * @param secretOccurrences - A record that tracks the occurrence of secret patterns across files.
 * 
 * The function performs the following tasks:
 * 1. Groups secrets by file path.
 * 2. Adds severity, risk score, and color metadata to each secret.
 * 3. Generates summaries for each file (number of secrets, severity breakdown).
 * 4. Generates detailed information about the secrets found in each file.
 * 5. Combines the generated content into an HTML structure.
 * 6. Writes the generated HTML report to the specified path.
 */
export function generateReport(
    secrets: { lineNumber: number, patternName: string, filePath: string }[], // Secrets array to process
    reportPath: string,  // Path where the report will be saved
    totalFilesScanned: number,  // Total number of files scanned
    context: ExtensionContext,  // VS Code extension context for asset path retrieval
    secretPatterns: { name: string, severity: string }[], // Secret patterns with severity
    secretOccurrences: Record<string, { count: number, files: Set<string> }> // Secret occurrences data
): void {
    // Exit early if no secrets are detected to avoid unnecessary processing
    if (secrets.length === 0) {
        return;
    }

    // Group secrets by file path and add metadata (severity, risk score, color)
    const secretsByFile = secrets.reduce((acc, secret) => {
        const { severity, riskScore, color } = getSeverityDetails(secret.patternName, secretPatterns, secretOccurrences);
        const enrichedSecret = { ...secret, severity, riskScore, color };  // Enhance the secret with metadata

        if (!acc[secret.filePath]) acc[secret.filePath] = [];
        acc[secret.filePath].push(enrichedSecret);

        return acc;
    }, {} as Record<string, { lineNumber: number; patternName: string; filePath: string; severity: string; riskScore: number; color: string }[]>);

    // Generate the summary for each file, ordered alphabetically by file path
    const fileSummaries = Object.entries(secretsByFile)
        .sort(([filePathA], [filePathB]) => filePathA.localeCompare(filePathB))  // Sorting file paths alphabetically
        .map(([_, fileSecrets]) => generateFileSummary(fileSecrets))  // Generate file summary
        .join('');  // Combine all file summaries into a single HTML string

    // Generate detailed information for each file, ordered alphabetically by file path
    const fileDetails = Object.entries(secretsByFile)
        .sort(([filePathA], [filePathB]) => filePathA.localeCompare(filePathB))  // Sorting file paths alphabetically
        .map(([_, fileSecrets]) => generateFileDetails(fileSecrets))  // Generate file details
        .join('');  // Combine all file details into a single HTML string

    // Generate the full HTML content for the report
    const htmlContent = generateHtmlReport(fileSummaries, fileDetails, totalFilesScanned, secrets.length, context);

    // Write the generated HTML content to the specified report file path
    fs.writeFileSync(reportPath, htmlContent);
}
