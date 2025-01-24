/**
 * © 2025 ArpitStack. Distributed under Apache-2.0 License.
 * See http://www.apache.org/licenses/LICENSE-2.0 for details.
 */

import { ExtensionContext } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generates the file summary for the overview section in the HTML report.
 * This includes a summary table that shows the total number of secrets and their severities (High, Medium, Low) for each file.
 * 
 * @param secrets - Array of secrets found in a specific file, containing line number, pattern name, file path, and severity.
 * @returns A string representing an HTML table row with file path, total secrets, and the count of secrets by severity level.
 */
export function generateFileSummary(secrets: { lineNumber: number; patternName: string; filePath: string; severity: string }[]): string {
    // Initialize severity counts for the file
    const severityCounts = { High: 0, Medium: 0, Low: 0 };

    // Count the occurrences of each severity level in the file
    secrets.forEach(secret => severityCounts[secret.severity as keyof typeof severityCounts]++);

    // Generate an HTML table row summarizing the file's secrets and severity counts
    return `
    <tr>
        <td><a href="file://${secrets[0].filePath}" target="_blank">${secrets[0].filePath}</a></td>
        <td>${secrets.length}</td>
        <td>${severityCounts['High']}</td>
        <td>${severityCounts['Medium']}</td>
        <td>${severityCounts['Low']}</td>
    </tr>
    `;
}

/**
 * Generates the detailed information for each file's secrets.
 * This includes a table listing each secret with its pattern name, line number, severity, and risk score.
 * 
 * @param secrets - Array of secrets found in a specific file, each containing pattern name, line number, severity, risk score, and color.
 * @param filePath - The path of the file, to display it as a heading.
 * @returns A string representing an HTML table body for displaying the detailed information of secrets.
 */
export function generateFileDetails(secrets: { lineNumber: number; patternName: string; filePath: string; severity: string; riskScore: number; color: string }[]): string {
    // Ensure that the details are wrapped in a table structure, with headers and rows for each secret
    const filePath = secrets[0].filePath; // Get the file path from the first secret in the array
    return `
    <div class="file-section">
        <h3 class="small-heading">Secrets in: <a href="file://${filePath}" target="_blank">${filePath}</a></h3>
        <table>
            <thead>
                <tr>
                    <th>Pattern Name</th>
                    <th>Line Number</th>
                    <th>Severity</th>
                    <th>Risk Score</th>
                </tr>
            </thead>
            <tbody>
                ${secrets.map(secret => `
                <tr>
                    <td>${secret.patternName}</td>
                    <td>${secret.lineNumber}</td>
                    <td style="color:${secret.color}">${secret.severity}</td>
                    <td>${secret.riskScore}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    `;
}

/**
 * Reads a file and returns its contents as a Base64 string
 * @param filePath - Path to the file (can be a CSS or image file)
 * @returns Base64-encoded string of the file content
 */
function readFileAsBase64(filePath: string): string {
    const fileBuffer = fs.readFileSync(filePath); // Read the file as a Buffer
    return fileBuffer.toString('base64'); // Convert it to Base64 string
}

/**
 * Generates the full HTML content for the report, embedding CSS and logo.
 * This includes the report's structure such as header, overview section, and the list of potentially exposed secrets.
 * 
 * @param fileSummaries - The HTML for the file summaries section, generated using the `generateFileSummary` function.
 * @param fileDetails - The HTML for the detailed secrets information, generated using the `generateFileDetails` function.
 * @param totalFilesScanned - The total number of files that were scanned.
 * @param secretsLength - The total number of secrets found during the scan.
 * @param context - The VS Code extension context used to retrieve the absolute path for assets.
 * @returns The full HTML report as a string.
 */
export function generateHtmlReport(fileSummaries: string, fileDetails: string, totalFilesScanned: number, secretsLength: number, context: ExtensionContext): string {
    // Paths to the assets
    const cssPath = path.join(context.extensionPath, 'src', 'assets', 'style', 'styles.css');
    const logoPath = path.join(context.extensionPath, 'src', 'assets', 'img', 'secret-stack-logo512.png');

    // Read the CSS and Logo as Base64
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    const logoBase64 = readFileAsBase64(logoPath);

    // Generate the HTML report with embedded CSS and Logo
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SecretStack Secrets Report</title>
        <style>
            ${cssContent}
        </style>
    </head>
    <body>
        <header>
            <img src="data:image/png;base64,${logoBase64}" alt="SecretStack Logo">
            <h1>SecretStack Secrets Report</h1>
        </header>
        <main>
            <!-- Overview section of the report -->
            <div class="boxed-section">
                <div class="center-heading">
                    <h2>Scan Overview</h2>
                </div>
                <p><strong>Total Files Scanned:</strong> ${totalFilesScanned}</p>
                <p><strong>Total Secrets Found:</strong> ${secretsLength}</p>
                <table>
                    <thead>
                        <tr>
                            <th>File Path</th>
                            <th>Total Secrets</th>
                            <th>High Severity</th>
                            <th>Medium Severity</th>
                            <th>Low Severity</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${fileSummaries} <!-- Insert file summaries -->
                    </tbody>
                </table>
                <div class="note">
                    <strong>Note:</strong> 
                    For security reasons, exposed secrets are not listed in the report; instead, users can identify them via metadata like 
                    line number, secret pattern, and file path to ensure confidentiality.
                </div>
            </div>
            <div class="boxed-section">
                <div class="center-heading">
                    <h2>Potentially Exposed Secrets</h2>
                </div>
                ${fileDetails} <!-- Insert detailed secrets information -->
            </div>            
        </main>
        <footer>
            <p>&copy; <span id="current-year"></span> SecretStack. All rights reserved.</p>
            <script>
                document.getElementById('current-year').textContent = new Date().getFullYear();  // Set the current year dynamically
            </script>
        </footer>
    </body>
    </html>
    `;
}