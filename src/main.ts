/**
 * © 2025 ArpitStack. Distributed under Apache-2.0 License.
 * See http://www.apache.org/licenses/LICENSE-2.0 for details.
 */

import { initializeStatusBar, disposeStatusBar } from './utils/statusBarUtils';
import { scanLocation } from './detectors/secretDetector';
import { watchGitCommit, setupGitIgnoreListeners } from './utils/gitUtils';
import { executeScan } from './utils/scanUtils';
import * as vscode from 'vscode';

/**
 * Activates the SecretStack extension.
 * This function is called when the extension is activated by the user.
 * It initializes necessary features such as Git commit watcher, status bar, and configuration watchers.
 * 
 * @param context - The extension context, used for managing subscriptions and extension lifecycle.
 */
export function activate(context: vscode.ExtensionContext) {

    // Set up Git commit watcher to prompt for secret scans whenever a commit is made
    watchGitCommit(context);

    // Set up Git ignore-related listeners
    setupGitIgnoreListeners(context);

    // Initialize the status bar with the scan action button
    initializeStatusBar(context);

    // Register a command that starts the scan, either for the entire workspace or a specific folder
    const scanCommand = vscode.commands.registerCommand('secret-stack.startScan', async () => {
        await executeScan(scanLocation, context);  // Execute the scan function with the provided context
    });

    // Add the scan command to the list of disposables to ensure proper cleanup
    context.subscriptions.push(scanCommand);
}

/**
 * Deactivates the SecretStack extension.
 * Cleans up resources and disposes of items like the status bar when the extension is deactivated.
 */
export function deactivate() {

    // Dispose the status bar item to free up resources and prevent memory leaks
    disposeStatusBar();
}
