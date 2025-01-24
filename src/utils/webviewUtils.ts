/**
 * © 2025 ArpitStack. Distributed under Apache-2.0 License.
 * See http://www.apache.org/licenses/LICENSE-2.0 for details.
 */

import * as vscode from 'vscode';
import { Secret } from '../constants/default';

/**
 * Displays the detected secrets in a WebView panel within VS Code.
 * 
 * This WebView allows the user to interact with detected secrets by ignoring them or continuing the scan process.
 * 
 * @param secrets - Array of detected secrets to display in the WebView.
 * @param context - The VS Code extension context to store the global state and subscriptions.
 * @returns A promise that resolves when the WebView is closed or the user interacts with it.
 */
export function showDetectedSecretsInWebView(
    secrets: Secret[],
    context: vscode.ExtensionContext
): Promise<void> {
    return new Promise((resolve) => {
        // Create the WebView panel for displaying secrets
        const panel = vscode.window.createWebviewPanel(
            'secretsView',
            'Potentially Exposed Secrets',
            vscode.ViewColumn.One,
            { enableScripts: true, retainContextWhenHidden: true }
        );

        // Set initial HTML content for the WebView
        panel.webview.html = generateSecretsTableHtml(secrets);

        // Listen for messages from the WebView (e.g., user actions)
        panel.webview.onDidReceiveMessage(
            (message) => {
                switch (message.command) {
                    case 'ignoreSecret':
                        handleIgnoreSecret(message.secret, context, panel);
                        break;
                    case 'continueSecrets':
                        handleContinueSecrets(context, panel, resolve);
                        break;
                    case 'openSecret':
                        openFileAtLine(message.secret);
                        break;
                    case 'closeView':
                        resolve(); // Resolve promise when user explicitly closes the WebView
                        break;
                }
            },
            undefined,
            context.subscriptions // Register the message listener as part of the context's subscriptions
        );

        // Resolve when the panel is disposed (i.e., when it is closed by the user)
        panel.onDidDispose(() => resolve());
    });
}

/**
 * Generates the HTML content for the WebView to display the secrets in a table.
 * 
 * This HTML includes a table where each row represents a detected secret, with a button to ignore the secret.
 * 
 * @param secrets - Array of secrets to generate the HTML table for.
 * @returns The HTML string to be used in the WebView.
 */
function generateSecretsTableHtml(secrets: Secret[]): string {
    const rows = secrets.map(secret => `
        <tr data-lineNumber="${secret.lineNumber}" 
            data-filePath="${secret.filePath}" 
            data-patternName="${secret.patternName}">
            <td>${secret.patternName}</td>
            <td class="centered-number">
                <a href="#" class="line-number-link">${secret.lineNumber}</a>
            </td>
            <td>${secret.filePath}</td>
            <td><button class="ignoreBtn">Ignore</button></td>
        </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Potentially Exposed Secrets</title>
        <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 10px; border: 1px solid #ddd; }
            button { background-color: #007acc; color: white; padding: 5px 10px; cursor: pointer; }
            .ignoreBtn { width: 100%; height: 100%; }
            .centered-number { text-align: center; }
            .line-number-link {
                color: white;
                font-weight: bold;
                text-decoration: none;
                cursor: pointer;
            }
            .line-number-link:hover {
                color: #ffcc00;
            }
            #continueBtn {
                position: absolute;
                top: 10px;
                right: 20px;
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                background-color: #f44336;
                color: white;
            }
        </style>
    </head>
    <body>
        <h2>Potentially Exposed Secrets</h2>
        <button id="continueBtn">CONTINUE</button>
        <table>
            <thead>
                <tr>
                    <th>Pattern Name</th>
                    <th>Line Number</th>
                    <th>File Path</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
        <script>
            const vscode = acquireVsCodeApi();

            // Add event listeners for ignore buttons
            document.querySelectorAll('.ignoreBtn').forEach(button => {
                button.addEventListener('click', () => {
                    const row = button.closest('tr');
                    const secret = {
                        lineNumber: Number(row.getAttribute('data-lineNumber')),
                        filePath: row.getAttribute('data-filePath'),
                        patternName: row.getAttribute('data-patternName')
                    };
                    vscode.postMessage({ command: 'ignoreSecret', secret: secret });
                    row.remove(); // Immediately remove the row after ignoring the secret
                });
            });

            // Add event listeners for line number links
            document.querySelectorAll('.line-number-link').forEach(link => {
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    const row = link.closest('tr');
                    const secret = {
                        lineNumber: Number(row.getAttribute('data-lineNumber')),
                        filePath: row.getAttribute('data-filePath'),
                        patternName: row.getAttribute('data-patternName')
                    };
                    vscode.postMessage({ command: 'openSecret', secret: secret });
                });
            });

            // Add event listener for CONTINUE button
            document.getElementById('continueBtn').addEventListener('click', () => {
                vscode.postMessage({ command: 'continueSecrets' });
            });
        </script>
    </body>
    </html>
    `;
}

/**
 * Opens the file at the specified line number.
 * 
 * @param secret - The secret containing the file path and line number to open.
 * @param panel - The WebView panel (not used in this function, but required for the handler).
 */
function openFileAtLine(secret: Secret) {
    const uri = vscode.Uri.file(secret.filePath);
    vscode.workspace.openTextDocument(uri).then((document) => {
        vscode.window.showTextDocument(document, { selection: new vscode.Range(secret.lineNumber - 1, 0, secret.lineNumber - 1, 0) });
    });
}

/**
 * Handles ignoring a detected secret by adding it to the ignored secrets list in the global state.
 * 
 * @param secret - The secret to be ignored.
 * @param context - The VS Code extension context, used to update global state.
 * @param panel - The WebView panel, which will be updated after the secret is ignored.
 */
function handleIgnoreSecret(secret: Secret, context: vscode.ExtensionContext, panel: vscode.WebviewPanel) {
    // Retrieve ignored secrets from global state
    let ignoredSecrets: Secret[] = context.globalState.get('ignoredSecrets', []);

    // Check if the secret is already ignored
    const isIgnored = ignoredSecrets.some(existingSecret =>
        existingSecret.lineNumber === secret.lineNumber &&
        existingSecret.patternName === secret.patternName &&
        existingSecret.filePath === secret.filePath
    );

    if (!isIgnored) {
        // Add the secret to the ignored list if not already ignored
        ignoredSecrets.push(secret);
        context.globalState.update('ignoredSecrets', ignoredSecrets);
        vscode.window.showInformationMessage('Secret has been ignored.');
    } else {
        vscode.window.showInformationMessage('This secret is already ignored.');
    }

    // Re-render the WebView with the updated secrets list
    updateWebViewWithFilteredSecrets(panel, context);
}

/**
 * Updates the WebView with the remaining secrets after filtering out the ignored ones.
 * 
 * @param panel - The WebView panel to update with the filtered secrets.
 * @param context - The extension context used to retrieve the ignored secrets and current secrets.
 */
function updateWebViewWithFilteredSecrets(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    const ignoredSecrets: Secret[] = context.globalState.get('ignoredSecrets', []);
    const currentSecrets: Secret[] = context.globalState.get('currentSecrets', []);

    // Filter out ignored secrets
    const filteredSecrets = currentSecrets.filter(secret =>
        !ignoredSecrets.some(ignored =>
            ignored.lineNumber === secret.lineNumber && ignored.filePath === secret.filePath
        )
    );

    // If no secrets remain, display a message indicating all secrets were ignored
    if (filteredSecrets.length === 0) {
        panel.webview.html = `
            <h2>All Secrets Ignored</h2>
            <p>There are no remaining secrets to display.</p>
        `;
    } else {
        panel.webview.html = generateSecretsTableHtml(filteredSecrets);
    }
}

/**
 * Handles the action of continuing the scan and closing the WebView panel.
 * 
 * This function clears the current secrets and closes the WebView.
 * 
 * @param context - The extension context used to clear the current secrets from global state.
 * @param panel - The WebView panel to dispose of.
 * @param resolve - The resolve function from the Promise to indicate completion.
 */
function handleContinueSecrets(context: vscode.ExtensionContext, panel: vscode.WebviewPanel, resolve: () => void) {
    // Clear the current secrets
    context.globalState.update('currentSecrets', []);

    // Dispose of the WebView panel and resolve the promise
    panel.dispose();
    resolve();
}