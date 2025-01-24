/**
 * © 2025 ArpitStack. Distributed under Apache-2.0 License.
 * See http://www.apache.org/licenses/LICENSE-2.0 for details.
 */

import { secretPatterns } from '../detectors/secretPatterns';

/**
 * Checks if a line is inside a comment or string.
 * @param content - The full content of the file.
 * @param lineNumber - The line number to check.
 * @returns `true` if the line is in a comment or string, `false` otherwise.
 */
export function isInCommentOrString(content: string, lineNumber: number): boolean {
    const line = content.split('\n')[lineNumber - 1]?.trim();
    return !!line && (
        line.startsWith('//') ||  // single-line comment in languages like JavaScript, C++
        line.startsWith('#') ||   // single-line comment in Python, Shell scripts, etc.
        line.includes('/*') || line.includes('*/') || // block comments in many languages
        line.includes('"""') || line.includes("'''") // multi-line strings (Python)
    );
}

/**
 * Scans a file's content for secrets based on predefined patterns.
 * @param content - The content of the file.
 * @param filePath - The path of the file.
 * @returns A list of detected secrets with details.
 */
export async function scanFileContent(
    content: string,
    filePath: string
): Promise<{ secret: string; lineNumber: number; patternName: string; filePath: string }[]> {

    const detectedSecrets: { secret: string; lineNumber: number; patternName: string; filePath: string }[] = [];
    const lines = content.split('\n');
    const uniqueSecrets = new Set<string>();

    for (const { name, regex } of secretPatterns) {
        lines.forEach((line, index) => {
            // Clean up the line by removing carriage return characters and trimming
            const cleanLine = line.replace(/\r/g, '').trim();

            // Skip lines in comments or strings
            if (isInCommentOrString(content, index + 1)) return;

            // Match potential secrets using the cleaned line
            if (!regex.test(cleanLine)) return;

            // If a match is found, proceed with extracting secrets
            const matches = cleanLine.match(regex);

            if (!matches) return;

            matches.forEach(match => {
                if (!match || match.length <= 5) return; // Skip empty or too short matches

                const uniqueKey = `${name}_${match}_${index + 1}_${filePath}`;
                if (uniqueSecrets.has(uniqueKey)) return; // Avoid duplicate matches

                uniqueSecrets.add(uniqueKey);

                // Try splitting the match on `=` or `:` to isolate the secret value
                const secret = match.split(/[=:]/)[1]?.trim() || match.trim();

                if (secret && secret.length > 0) {
                    detectedSecrets.push({
                        secret,
                        lineNumber: index + 1,
                        patternName: name,
                        filePath
                    });
                }
            });
        });
    }
    return detectedSecrets;
}
