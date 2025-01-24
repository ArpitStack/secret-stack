/**
 * © 2025 ArpitStack. Distributed under Apache-2.0 License.
 * See http://www.apache.org/licenses/LICENSE-2.0 for details.
 */

import * as vscode from 'vscode';

/**
 * Fetch the workspace configuration for the 'secret-stack' extension.
 * The configuration contains user-defined custom patterns for secret scanning.
 */
export function getConfig() {
    return vscode.workspace.getConfiguration('secret-stack');
}

/**
 * Update the configuration for the 'secret-stack' extension.
 * It checks if a workspace is available and updates the configuration accordingly:
 * - If a workspace is open, the setting is updated in the workspace settings.
 * - If no workspace is open, the setting is updated in the global user settings.
 * 
 * @param key - The configuration key to update.
 * @param value - The new value for the configuration key.
 */
export function updateConfig(key: string, value: any) {
    const config = vscode.workspace.getConfiguration('secret-stack');
    const target = vscode.workspace.workspaceFolders ? vscode.ConfigurationTarget.Workspace : vscode.ConfigurationTarget.Global;
    config.update(key, value, target);
}
