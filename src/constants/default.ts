/**
 * © 2025 ArpitStack. Distributed under Apache-2.0 License.
 * See http://www.apache.org/licenses/LICENSE-2.0 for details.
 */

/**
 * The maximum number of log entries to store in memory.
 * Once this limit is reached, older log entries will be discarded.
 * 
 * This constant helps prevent memory bloat by setting an upper limit on
 * the number of log entries retained in memory. When the limit is reached,
 * older logs are automatically discarded to make space for new entries.
 */
export const MAX_LOG_CACHE = 100;

/**
 * The name of the log file used to store secrets scan results.
 * This file is used throughout the application for saving scan logs.
 * 
 * The log file stores the results of secret scans in the workspace,
 * helping to track and review secrets detected during the scan process.
 * The filename is used consistently across the application to maintain 
 * uniformity in log handling and to avoid hardcoding file names in 
 * multiple places.
 */
export const LOG_FILE_NAME = 'secret-stack-result';

/**
 * Charset used for Base64 encoding (standard + URL-safe).
 * Includes uppercase and lowercase letters, digits, and special characters 
 * such as '+' and '/' (standard Base64) or '-' and '_' (URL-safe Base64).
 * Padding character '=' is also included.
 */
export const BASE64_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
export const BASE64URL_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/**
 * The entropy threshold for detecting high-entropy Base64 strings.
 * This threshold is typically set around 2, which is a reasonable value 
 * for detecting Base64-encoded secrets that appear to be random.
 */
export const BASE64_ENTROPY_LIMIT = 3;  // Threshold for Base64 entropy

/**
 * Interface representing the metadata of a detected secret.
 * 
 * This interface is used to define the structure of secret metadata that
 * is captured during the secrets scan. It includes information about the
 * location and context of the detected secret, but **does not** include 
 * the secret value itself to avoid exposure of sensitive information.
 * 
 * Properties:
 * - `lineNumber`: The line number where the secret was detected.
 * - `patternName`: The name of the secret detection pattern that was matched.
 * - `filePath`: The file path where the secret was found.
 */
export interface Secret {
    lineNumber: number;   // The line number where the secret is detected
    patternName: string;  // The name of the detection pattern that identified the secret
    filePath: string;     // The path to the file containing the secret
}