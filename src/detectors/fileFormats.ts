/**
 * © 2025 ArpitStack. Distributed under Apache-2.0 License.
 * See http://www.apache.org/licenses/LICENSE-2.0 for details.
 */

import { getConfig } from '../constants/config';
import { logMessage } from '../utils/loggingUtils';

// Default file formats configuration: includes common file types and directories to exclude
const defaultFileFormatsConfig = {
    include: [
        "js", "ts", "jsx", "tsx", "py", "java", "rb", "php", "c", "cpp", "h", "cs", "go",
        "swift", "kt", "R", "scala", "sh", "bash", "json", "yml", "yaml", "toml", "xml", "ini",
        "properties", "env", "md", "rst", "log", "txt", "sql", "csv", "html", "bak", "swp", "tmp",
        "zip", "tar.gz", "tar", "rar", "Dockerfile", "gitlab-ci.yml", "circleci.yml", "tf"
    ],
    exclude: [
        "**/node_modules", "**/dist", "**/*.min.js", "**/package-lock.json", ".git", ".vscode", ".secret-stack"  // Default exclusions
    ]
};

/**
 * Loads user-defined exclusions from the VS Code workspace configuration.
 * This function allows users to customize the exclusions via their settings.
 * 
 * @returns An array of user-defined exclusion patterns.
 */
const loadUserExclude = (): string[] => {
    try {
        const updatedConfig = getConfig(); // Get the latest configuration avoiding cache
        const userExclude = updatedConfig.get<string[]>("excludeFiles", []); // Fetch user-defined exclusions

        // Ensure that userExclude is an array, and return an empty array if not defined correctly
        return Array.isArray(userExclude) ? userExclude : [];
    } catch (error) {
        // Log any potential errors loading configuration and return a safe default (empty array)
        logMessage("Error loading user-defined exclusions:", "error");
        return [];
    }
};

/**
 * Function that dynamically generates the file formats configuration.
 * 
 * @returns The dynamically generated configuration.
 */
export function fileFormatsConfig() {
    const userExclude = loadUserExclude();  // Get the user-defined exclusions

    // Dynamically build the config object
    return {
        include: defaultFileFormatsConfig.include,  // Always include the default file formats
        exclude: [
            ...defaultFileFormatsConfig.exclude,    // Add default exclusions
            ...userExclude                            // Merge user-defined exclusions (if any)
        ]
    };
}