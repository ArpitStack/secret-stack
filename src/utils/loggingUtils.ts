/**
 * © 2025 ArpitStack. Distributed under Apache-2.0 License.
 * See http://www.apache.org/licenses/LICENSE-2.0 for details.
 */

import { getFilePath, isDuplicate, withFileLock } from './fileUtils';
import * as fs from 'fs';
import * as path from 'path';
import { LOG_FILE_NAME } from '../constants/default';

/**
 * Logs a message to a file with a timestamp and log level.
 * If the log file exceeds 1MB, it is rotated by renaming it with a timestamp.
 * Duplicate messages (based on hash) are prevented from being logged.
 * 
 * @param message - The message to log, either as a string or an object with details (line number, pattern name, and file path).
 * @param level - The log level (e.g., "info", "warning", "error").
 */
export function logMessage(message: string | { lineNumber: number, patternName: string, filePath: string }, level: string): void {
    // Get the full path for the log file
    const logFilePath = getFilePath(LOG_FILE_NAME, 'log');
    if (!logFilePath) return;

    // Format the message based on the type (object or string)
    const formattedMessage = typeof message === 'object' && 'lineNumber' in message
        ? `Pattern: ${message.patternName}, Line: ${message.lineNumber}, File: ${message.filePath}`
        : message as string;

    // Create a timestamp for the log entry
    const timestamp = new Date().toISOString();
    const finalMessage = `[${timestamp}] [${level.toUpperCase()}] ${formattedMessage}\n`;

    try {
        // Check the size of the log file, and rotate it if it exceeds 1MB
        const maxLogSize = 1 * 1024 * 1024; // 1MB
        const stats = fs.existsSync(logFilePath) ? fs.statSync(logFilePath) : { size: 0 };
        if (stats.size > maxLogSize) {
            // Archive the current log file by renaming it with the current timestamp
            const timestamp = new Date().toISOString().replace(/:/g, '-');
            const archivedLogFilePath = path.join(path.dirname(logFilePath), `secrets-${timestamp}.log`);
            try {
                fs.renameSync(logFilePath, archivedLogFilePath); // Rotate the log file
            } catch (error) {
                logMessage('Error rotating log file', 'error');
            }
        }

        // Prevent duplicate log entries using the hash of the message
        if (!isDuplicate(finalMessage)) {
            // Ensure exclusive access to the log file with a file lock before writing
            withFileLock(logFilePath, () => {
                fs.appendFileSync(logFilePath, finalMessage); // Append the log message to the file
            });
        }
    } catch (error) {
        logMessage('Error handling log file:', 'error');
    }
}

/**
 * Creates a separator log line with a customizable length, useful for dividing log sections.
 * 
 * @param message - The message to display in the separator line.
 * @param separatorLength - The total length of the separator line (default is 80 characters).
 * @returns A string representing the separator line with the message centered.
 */
export function createSeparatorLogLine(message: string, separatorLength: number = 80): string {
    const messageLength = message.length;
    const padding = separatorLength - messageLength - 2;

    // If the padding is too small, return a full separator line
    if (padding < 0) return '-'.repeat(separatorLength);

    // Calculate the padding on the left and right sides of the message
    const leftPadding = Math.floor(padding / 2);
    const rightPadding = padding - leftPadding;

    return `${'-'.repeat(leftPadding)} ${message} ${'-'.repeat(rightPadding)}`; // Return the separator with message centered
}
