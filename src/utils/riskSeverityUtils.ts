/**
 * © 2025 ArpitStack. Distributed under Apache-2.0 License.
 * See http://www.apache.org/licenses/LICENSE-2.0 for details.
 */

/**
 * Helper function for determining the risk details based on the severity.
 * This function calculates the risk score and color associated with a given severity level.
 * 
 * @param severity - The severity level (e.g., 'High', 'Medium', 'Low').
 * @param occurrenceCount - The count of occurrences for the secret pattern.
 * @returns An object containing the severity level, corresponding risk score, and color.
 */
export const getRiskDetails = (severity: string, occurrenceCount: number) => {
    let baseRiskScore: number;

    // Assign base risk score based on severity
    if (severity === 'High') {
        baseRiskScore = 80;  // Starting risk score for high severity
    } else if (severity === 'Medium') {
        baseRiskScore = 50;  // Starting risk score for medium severity
    } else {
        baseRiskScore = 20;  // Starting risk score for low severity
    }

    // Adjust risk score based on the number of occurrences
    let riskScore = baseRiskScore + (occurrenceCount * 5);

    // Ensure the risk score doesn't exceed 100
    riskScore = Math.min(riskScore, 100);

    const severityColors: Record<string, string> = {
        High: 'red',
        Medium: 'orange',
        Low: 'green',
        Unknown: 'gray',
    };

    return {
        severity,
        riskScore,
        color: severityColors[severity] || 'gray',
    };
};

/**
 * Retrieves severity details based on the secret pattern name.
 * This function looks up the severity level for a given secret pattern based on its occurrence and returns its corresponding risk details.
 * If the pattern is not found, it returns default values indicating an unknown severity.
 * 
 * @param patternName - The name of the secret pattern.
 * @param secretPatterns - An array of objects containing secret pattern names and their associated severity levels.
 * @param secretOccurrences - A record of secret occurrences with count and files.
 * @returns An object containing the severity level, risk score, and color corresponding to the secret pattern.
 */
export const getSeverityDetails = (patternName: string, secretPatterns: { name: string, severity: string }[], secretOccurrences: Record<string, { count: number, files: Set<string> }>) => {
    // Search for the pattern in the provided secret patterns array
    const pattern = secretPatterns.find(p => p.name === patternName);

    if (pattern) {
        // If pattern is found, return the risk details based on the severity
        return getRiskDetails(pattern.severity, secretOccurrences[patternName]?.count || 0);
    }

    // Return default values for unknown patterns
    return { severity: 'Unknown', riskScore: 0, color: 'gray' };
};