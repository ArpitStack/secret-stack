/**
 * © 2025 ArpitStack. Distributed under Apache-2.0 License.
 * See http://www.apache.org/licenses/LICENSE-2.0 for details.
 */

import * as vscode from 'vscode';
import { logMessage, createSeparatorLogLine } from './loggingUtils';
import { setTargetPath } from './fileUtils';

let isScanning = false;

/**
 * Executes a scan based on the user's location choice (entire workspace or specific folder).
 * Prevents multiple scans from running simultaneously and logs scan results.
 * 
 * @param scanFunction - The function responsible for performing the scan (e.g., scanning for secrets).
 * @param context - The VS Code extension context for managing the scan.
 */
export async function executeScan(
    scanFunction: (context: vscode.ExtensionContext, locationPath: string) => Promise<boolean>,
    context: vscode.ExtensionContext
) {
    if (isScanning) {
        vscode.window.showInformationMessage('Scan already in progress. Please wait...');
        return; // Prevent scanning if a scan is already in progress
    }

    const options = ['Entire Workspace', 'Specific Folder']; // Choices for scan location
    const choice = await vscode.window.showInformationMessage(
        'Choose where to scan for exposed secrets:',
        ...options
    );

    if (!choice) return;  // User canceled the selection

    let targetPath: string | undefined;
    let locationType: string = 'Workspace';  // Default location type

    // Check if workspace is open, and exit if it's not
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showWarningMessage('No workspace is open. Please open a workspace first.');
        return; // Exit if no workspace is open
    }

    // Set targetPath based on user choice
    if (choice === 'Entire Workspace') {
        if (workspaceFolders.length > 1) {
            vscode.window.showWarningMessage('Multi-root workspace detected. Please select a specific folder to scan.');
            return; // Exit if multi-root workspace is detected
        }
        targetPath = workspaceFolders[0].uri.fsPath;  // Use the first workspace folder path
        locationType = 'Workspace';
    } else if (choice === 'Specific Folder') {
        // Prompt user to select a folder within the workspace
        const folderUri = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: 'Select a Folder to Scan',
            defaultUri: workspaceFolders[0].uri,  // Start from the first workspace folder
        });

        if (folderUri && folderUri[0]) {
            const selectedFolderPath = folderUri[0].fsPath;
            const isValidPath = workspaceFolders.some((folder) => selectedFolderPath.startsWith(folder.uri.fsPath));

            if (isValidPath) {
                targetPath = selectedFolderPath;
                locationType = 'Folder';
            } else {
                vscode.window.showWarningMessage('The selected folder is not within the current workspace.');
                return; // Exit if folder is not within the workspace
            }
        } else {
            return;  // User canceled folder selection
        }
    }

    // Set the target path globally
    setTargetPath(targetPath);

    isScanning = true;
    logMessage(createSeparatorLogLine(`${locationType} Scan started`), 'info');

    try {
        // Execute the scan function with the selected path
        const hasSecrets = await scanFunction(context, targetPath || "");  // Pass an empty string if targetPath is undefined
        const scanResultMessage = hasSecrets
            ? `${locationType} Scan completed: Exposed secrets found`
            : `${locationType} Scan completed: No secrets detected`;

        logMessage(createSeparatorLogLine(scanResultMessage), 'info');
    } catch (error) {
        // Log error if scan fails
        logMessage(
            `Error during ${locationType.toLowerCase()} scan: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'error'
        );
    } finally {
        isScanning = false; // Reset scanning flag
    }
}