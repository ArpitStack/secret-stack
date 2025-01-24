/**
 * © 2025 ArpitStack. Distributed under Apache-2.0 License.
 * See http://www.apache.org/licenses/LICENSE-2.0 for details.
 */

import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;

/**
 * Initializes the status bar item in VS Code.
 * Creates and configures a status bar item that allows the user to trigger a secret scan.
 * This item is displayed on the right side of the VS Code window with a command to start scanning for exposed secrets.
 * 
 * @param context - The extension context, used for managing subscriptions and lifecycle.
 */
export function initializeStatusBar(context: vscode.ExtensionContext) {
    // Create a status bar item aligned to the right with priority 10
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 10);

    // Set the text displayed in the status bar with a search icon and label
    statusBarItem.text = '$(search) Find Exposed Secrets';

    // Assign the command that will be triggered when the status bar item is clicked
    statusBarItem.command = 'secret-stack.startScan';

    // Set the tooltip message to provide more information when hovering over the status bar item
    statusBarItem.tooltip = 'Click to start scanning for exposed secrets';

    // Make the status bar item visible in the editor
    statusBarItem.show();

    // Register the status bar item to be disposed of automatically when the extension is deactivated
    context.subscriptions.push(statusBarItem);
}

/**
 * Disposes of the status bar item when it is no longer needed.
 * Ensures that the status bar item is removed and cleaned up when the extension is deactivated,
 * freeing up resources and preventing memory leaks.
 */
export function disposeStatusBar() {
    // Dispose of the status bar item to free up resources when it's no longer needed
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}

/**
 * Updates the message displayed in the status bar.
 * This function allows the status bar text to be changed dynamically, such as showing the current scanning status.
 * 
 * @param message - The new message to display in the status bar.
 */
export function updateStatusBarMessage(message: string) {
    // Update the status bar text if the status bar item exists
    if (statusBarItem) {
        statusBarItem.text = message;
    }
}