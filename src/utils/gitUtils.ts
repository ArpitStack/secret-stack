/**
 * © 2025 ArpitStack. Distributed under Apache-2.0 License.
 * See http://www.apache.org/licenses/LICENSE-2.0 for details.
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import path from 'path';
import { getConfig, updateConfig } from '../constants/config';
import { logMessage } from './loggingUtils';

/**
 * Determines if the secret scan prompt should be shown based on configuration and last prompt time.
 * 
 * @param context - The VS Code extension context for accessing global state.
 * @returns Boolean indicating whether the prompt should be displayed.
 */
function shouldShowPrompt(context: vscode.ExtensionContext): boolean {
    const updatedConfig = getConfig(); // Get the latest configuration avoiding cache
    const promptSetting = updatedConfig.get<string>('promptToScanBeforePush', 'always'); // Default to 'always'

    // Validate promptSetting and log unexpected values
    if (!['always', '30days', 'disabled'].includes(promptSetting)) {
        logMessage(`Unexpected prompt setting: ${promptSetting}`, 'error');
        return false; // Return false to avoid showing the prompt for invalid settings
    }

    // Disabled via configuration
    if (promptSetting === 'disabled') return false;

    // 30-day frequency check
    if (promptSetting === '30days') {
        const lastPromptTime = context.globalState.get<number>('lastSecretScanPromptTime', 0);
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        return lastPromptTime < thirtyDaysAgo; // Return true if 30 days have passed
    }

    // Default to always showing
    return promptSetting === 'always';
}

/**
 * Prompts the user to run a secret scan before pushing committed changes.
 * Respects user configuration for prompt frequency.
 * 
 * @param context - The VS Code extension context used for executing the scan.
 */
function promptForSecretScan(context: vscode.ExtensionContext): void {
    if (!shouldShowPrompt(context)) return; // If the prompt should not be shown, return early

    vscode.window
        .showInformationMessage(
            'You have committed changes. Would you like to run a scan for secrets before pushing?',
            'Yes',
            'No',
            'Remind me in 30 days',
            'Disable'
        )
        .then((selection) => {
            switch (selection) {
                case 'Yes':
                    vscode.commands.executeCommand('secret-stack.startScan', context);
                    updateConfig('lastSecretScanPromptTime', Date.now());
                    break;
                case 'Remind me in 30 days':
                    updateConfig('lastSecretScanPromptTime', Date.now());
                    vscode.window.showInformationMessage(
                        'Secret scan prompts will be suppressed for 30 days.'
                    );
                    updateConfig('promptToScanBeforePush', '30days'); // Update the prompt setting
                    break;
                case 'Disable':
                    updateConfig('promptToScanBeforePush', 'disabled');
                    vscode.window.showInformationMessage(
                        'Secret scan prompts have been disabled in settings.'
                    );
                    break;
            }
        });
}

/**
 * Watches the `.git/logs/HEAD` file for commit events in all relevant root folders and prompts the user to scan for secrets.
 * Registers file system watchers to detect changes to commit logs in each root folder and triggers the scan prompt.
 * 
 * @param context - The VS Code extension context for managing subscriptions.
 */
export function watchGitCommit(context: vscode.ExtensionContext): void {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
        return; // Exit if no workspace is open
    }

    // Iterate over all root folders in the workspace
    workspaceFolders.forEach((folder) => {
        try {
            const gitLogsPath = path.join(folder.uri.fsPath, '.git', 'logs', 'HEAD');

            // Create a file system watcher for the `.git/logs/HEAD` file in each root folder
            const gitWatcher = vscode.workspace.createFileSystemWatcher(gitLogsPath);
            gitWatcher.onDidChange(() => promptForSecretScan(context)); // Trigger scan prompt on commit

            context.subscriptions.push(gitWatcher); // Ensure watcher is disposed properly
        } catch (error) {
            logMessage('Error initializing Git commit watcher.', 'error');
        }
    });
}

/**
 * Ensures the `.secret-stack` folder is added to `.gitignore` to prevent Git from tracking scan reports.
 * Prompts the user once before modifying the `.gitignore` files for all root folders and appends `.secret-stack` if it’s not already listed.
 */
export async function addToGitIgnore(): Promise<void> {
    const updatedConfig = getConfig(); // Get the latest configuration avoiding cache
    const gitIgnoreBoolean = updatedConfig.get<boolean>('addToGitIgnore', true); // Default to true

    if (!gitIgnoreBoolean) return; // Exit if setting is disabled

    // Get all root folders (supporting multi-root workspaces)
    const workspaceFolders = vscode.workspace.workspaceFolders || [];
    if (workspaceFolders.length === 0) return; // No workspace is open

    // Track which folders need `.secret-stack` added
    const foldersNeedingUpdate: { gitignorePath: string; folderName: string }[] = [];

    // Check all root folders for `.gitignore` status
    for (const folder of workspaceFolders) {
        const gitFolderPath = path.join(folder.uri.fsPath, '.git');
        const gitignorePath = path.join(folder.uri.fsPath, '.gitignore');

        // Ensure .git directory exists and check if .gitignore needs modification
        if (fs.existsSync(gitFolderPath) && fs.statSync(gitFolderPath).isDirectory()) {
            let gitignoreContent = '';
            try {
                gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8'); // Read existing .gitignore
            } catch {
                fs.writeFileSync(gitignorePath, ''); // Create .gitignore if it doesn't exist
            }

            // Add to list if `.secret-stack` is not already in `.gitignore`
            if (!gitignoreContent.includes('.secret-stack')) {
                foldersNeedingUpdate.push({ gitignorePath, folderName: folder.name });
            }
        }
    }

    // If no folders need updates, exit early
    if (foldersNeedingUpdate.length === 0) return;

    // Prompt user once
    const response = await vscode.window.showInformationMessage(
        'The .secret-stack folder stores scan reports. Add it to .gitignore to avoid Git tracking?',
        'Yes',
        'No'
    );

    if (response === 'Yes') {
        const updatedFolders: string[] = [];

        // Apply updates to all applicable folders
        for (const { gitignorePath, folderName } of foldersNeedingUpdate) {
            try {
                fs.appendFileSync(gitignorePath, '\n# Ignore .secret-stack folder\n.secret-stack\n');
                updatedFolders.push(folderName); // Track successfully updated folders
            } catch (error) {
                logMessage(`Failed to modify .gitignore in ${folderName}.`, 'error');
            }
        }

        if (updatedFolders.length > 0) {
            vscode.window.showInformationMessage(
                `.secret-stack folder added to .gitignore in ${updatedFolders.join(', ')}.`
            );
        } else {
            vscode.window.showInformationMessage('Failed to add .secret-stack folder to .gitignore.');
        }
    }
}

/**
 * Checks the `secret-stack.addToGitIgnore` setting and calls `addToGitIgnore` if enabled.
 */
export function checkAndAddToGitIgnore(): void {
    const updatedConfig = getConfig(); // Get the latest configuration avoiding cache
    const gitIgnoreBoolean = updatedConfig.get<boolean>('addToGitIgnore', true);

    if (gitIgnoreBoolean) {
        addToGitIgnore(); // Add .secret-stack to .gitignore if setting is enabled
    }
}

/**
 * Sets up listeners for workspace folder changes and configuration changes.
 * Ensures `.gitignore` is updated dynamically as the workspace or settings change.
 * 
 * @param context - The VS Code extension context for managing subscriptions.
 */
export function setupGitIgnoreListeners(context: vscode.ExtensionContext): void {
    // Initial check on activation
    checkAndAddToGitIgnore();

    // Listen for workspace folder changes
    const folderChangeListener = vscode.workspace.onDidChangeWorkspaceFolders(() => {
        checkAndAddToGitIgnore();
    });

    // Watch for configuration changes
    const configChangeListener = vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('secret-stack.addToGitIgnore')) {
            checkAndAddToGitIgnore();
        }
    });

    // Add listeners to context.subscriptions to ensure they are cleaned up on deactivation
    context.subscriptions.push(folderChangeListener, configChangeListener);
}
