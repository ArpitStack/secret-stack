/**
 * © 2025 ArpitStack. Distributed under Apache-2.0 License.
 * See http://www.apache.org/licenses/LICENSE-2.0 for details.
 */

import { BASE64_CHARSET, BASE64URL_CHARSET } from "../constants/default";

/**
 * Calculate Shannon entropy for a given string based on a specific charset.
 * This function computes the entropy by measuring the unpredictability of characters in the string,
 * considering only characters present in the provided charset (e.g., Base64 charset).
 * 
 * @param data - The string for which to calculate entropy. The string should not be empty.
 * @param charset - The charset to consider when calculating entropy (e.g., Base64 or Base64url).
 * @returns The Shannon entropy value for the string. A higher value indicates more randomness.
 *          Returns 0 if the string is empty or contains no valid characters from the charset.
 */
export function calculateShannonEntropy(data: string, charset: string): number {
    if (!data) return 0; // Return 0 entropy if data is empty

    const frequencyMap = new Map<string, number>();

    // Count the frequency of each character in the data, considering only characters from the charset
    for (let i = 0; i < data.length; i++) {
        const char = data[i];
        if (charset.includes(char)) {
            frequencyMap.set(char, (frequencyMap.get(char) || 0) + 1);
        }
    }

    let entropy = 0.0;
    const dataLength = data.length;

    // Calculate the entropy using Shannon's formula, considering only the valid characters from the charset
    frequencyMap.forEach((count) => {
        const p_x = count / dataLength; // Frequency of the character in the data
        if (p_x > 0) {
            entropy += -p_x * Math.log2(p_x); // Shannon entropy calculation
        }
    });

    return entropy;
}

/**
 * Detects the charset of a secret string.
 * This function determines whether the secret is Base64 or Base64url encoded, 
 * based on the presence of specific characters in the secret string.
 * 
 * @param secret - The secret string whose charset is to be detected.
 * @returns 'base64' if it's Base64 encoded, 'base64url' if it's Base64url encoded, and 'unknown' if neither.
 */
export function detectCharset(secret: string): string {
    // Check if the secret contains Base64url-specific characters: "-" or "_"
    if (secret.includes('-') || secret.includes('_')) {
        return 'base64url'; // Return 'base64url' for secrets with URL-safe Base64 characters
    }

    // Otherwise, if it contains Base64-specific characters: "+" or "/"
    if (secret.includes('+') || secret.includes('/')) {
        return 'base64'; // Return 'base64' for secrets with standard Base64 characters
    }

    // Return 'unknown' if neither Base64 nor Base64url characters are found
    return 'unknown'; // Return 'unknown' for secrets that do not match Base64/Base64url patterns
}

/**
 * Filters secrets based on their entropy values for a specific charset (Base64 or Base64url).
 * This function iterates through the secrets and calculates their entropy using the appropriate charset.
 * If the entropy of a secret exceeds the provided entropy limit, it is considered high-entropy and included in the result.
 * 
 * @param secrets - A Set of detected secrets, each containing secret content, line number, pattern name, and file path.
 * @param entropyLimit - The entropy threshold above which a secret is considered high-entropy.
 * @returns A Set of high-entropy secrets, where entropy exceeds the given limit.
 *          Only Base64 or Base64url encoded secrets are considered for entropy calculation.
 */
export function filterHighEntropySecrets(
    secrets: Set<{ secret: string; lineNumber: number; patternName: string; filePath: string }>,
    entropyLimit: number
): Set<{ secret: string; lineNumber: number; patternName: string; filePath: string }> {
    const highEntropySecrets = new Set<{ secret: string; lineNumber: number; patternName: string; filePath: string }>();

    secrets.forEach(({ secret, lineNumber, patternName, filePath }) => {
        // Detect the charset for each secret
        const charset = detectCharset(secret);

        // Only process secrets with known charsets (Base64 or Base64url)
        let charsetToUse = '';
        if (charset === 'base64') {
            charsetToUse = BASE64_CHARSET;
        } else if (charset === 'base64url') {
            charsetToUse = BASE64URL_CHARSET;
        } else {
            return; // Skip secrets with unknown charsets
        }

        // Calculate entropy with the selected charset
        const entropy = calculateShannonEntropy(secret, charsetToUse);

        // Add to the set of high entropy secrets if it exceeds the provided entropy limit
        if (entropy > entropyLimit) {
            highEntropySecrets.add({ secret, lineNumber, patternName, filePath });
        }
    });

    return highEntropySecrets; // Return the set of high-entropy secrets
}
