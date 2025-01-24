/**
 * © 2025 ArpitStack. Distributed under Apache-2.0 License.
 * See http://www.apache.org/licenses/LICENSE-2.0 for details.
 */

import { getConfig } from "../constants/config";

/**
 * Retrieve user-defined custom patterns for secret scanning from the workspace configuration.
 * Each pattern consists of a 'name', 'regex' (regular expression), and an optional 'severity' level ('Low', 'Medium', 'High').
 * If no custom patterns are defined, default to an empty array.
 */
const updatedConfig = getConfig(); // Get the latest configuration avoiding cache
const userPatterns = updatedConfig.get<{ name: string; regex: string, severity?: 'Low' | 'Medium' | 'High' }[]>('customPatterns') || [];

/**
 * Predefined set of secret patterns that are commonly found in source code or configuration files.
 * These patterns are used to detect sensitive information, such as API keys, tokens, and credentials.
 * The severity for each pattern indicates the importance or potential risk level (e.g., 'High' for critical secrets).
 */
export const secretPatterns = [

    // Artifactory Password
    { name: "Artifactory Password", regex: /(?:\s|=|:|"|^)AP[\dA-F][a-zA-Z0-9]{8,}(?:\s|"|$)/i, severity: 'Medium' },

    // Artifactory Token
    { name: "Artifactory Token", regex: /(?:\s|=|:|"|^)AKC[a-zA-Z0-9]{10,}(?:\s|"|$)/i, severity: 'Medium' },

    // Azure Account Key
    { name: "Azure Account Key", regex: /(?:".*?"=)?[A-Za-z0-9+/=]{88}/i, severity: 'High' },

    // Basic Auth Credentials
    { name: "Basic Auth Credentials", regex: /(?:".*?"=)?https?:\/\/[^\s:@]+:[^\s:@]+@[^\s]+/i, severity: 'High' },

    // Discord Token
    { name: "Discord Token", regex: /[MNO][a-zA-Z\d_-]{23,25}\.[a-zA-Z\d_-]{6}\.[a-zA-Z\d_-]{27}/i, severity: 'High' },

    // Firebase URL (looks for any URL with firebaseio.com in it)
    { name: "Firebase URL", regex: /firebaseio\.com/i, severity: 'Low' },

    // GitHub Token
    { name: "GitHub Token", regex: /(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36}/i, severity: 'High' },

    // GitLab Agent Token
    { name: "GitLab Agent Token", regex: /glagent-[A-Za-z0-9_-]{50,1024}(?!\w)/i, severity: 'High' },

    // GitLab CI/CD Token
    { name: "GitLab CI/CD Token", regex: /glcbt-([0-9a-fA-F]{2}_)?[A-Za-z0-9_-]{20,50}(?!\w)/i, severity: 'High' },

    // GitLab Incoming Mail Token
    { name: "GitLab Incoming Mail Token", regex: /glimt-[A-Za-z0-9_-]{25}(?!\w)/i, severity: 'Medium' },

    // GitLab OAuth Application Secret
    { name: "GitLab OAuth Application Secret", regex: /gloas-[A-Za-z0-9_-]{64}(?!\w)/i, severity: 'High' },

    // GitLab Personal Access Token (handles various prefix formats like glpat, gldt, etc.)
    { name: "GitLab Personal Access Token", regex: /(glpat|gldt|glft|glsoat|glrt)-[A-Za-z0-9_-]{20,50}(?!\w)/i, severity: 'High' },

    // GitLab Runner Token
    { name: "GitLab Runner Token", regex: /GR1348941[A-Za-z0-9_-]{20,50}(?!\w)/i, severity: 'High' },

    // GitLab Trigger Token
    { name: "GitLab Trigger Token", regex: /glptt-[A-Za-z0-9_-]{40}(?!\w)/i, severity: 'Medium' },

    // IBM Cloud IAM API Key
    { name: "IBM Cloud IAM Key", regex: /(?:ibm(?:_|-)?cloud(?:_|-)?iam|cloud(?:_|-)?iam|ibm(?:_|-)?cloud|ibm(?:_|-)?iam|ibm|iam|cloud)(?:_|-)?(?:api)?(?:_|-)?(?:key|pwd|password|pass|token)[A-Za-z0-9_-]{44}/i, severity: 'High' },

    // IBM COS HMAC Credentials
    { name: "IBM COS HMAC Credentials", regex: /(?:(?:ibm)?[-_]?cos[-_]?(?:hmac)?|)(?:secret[-_]?(?:access)?[-_]?key)[a-f0-9]{48}(?![a-f0-9])/i, severity: 'High' },

    // IPv4 Address (Excluding Certain Ranges)
    { name: "IPv4 Address", regex: /(?<![\w.])((?!192\.168\.|127\.|10\.|169\.254\.|172\.(?:1[6-9]|2[0-9]|3[01]))(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])(?:\:\d{1,5})?)(?![\w.])/i, severity: 'High' },

    // JWT Token (base64url encoded)
    { name: "JWT Token", regex: /^(?!npm_).*?\beyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*?\b/i, severity: 'Medium' },

    // MailChimp API Key (valid Mailchimp API Key format)
    { name: "MailChimp API Key", regex: /(?:".*?"=)?[0-9a-z]{32}-us\d{1,2}/i, severity: 'Medium' },

    // Mailgun API Key
    { name: "Mailgun API Key", regex: /key-[0-9a-zA-Z]{32}/i, severity: 'High' },

    // NPM UUID
    { name: "NPM UUID", regex: /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i, severity: 'Medium' },

    // NPM Token
    { name: "NPM Token", regex: /^(?!eyJ_).*?\bnpm_(?!eyJ)[A-Za-z0-9-_]+\b/i, severity: 'Medium' },

    // OpenAI Token
    { name: "OpenAI Token", regex: /sk-[A-Za-z0-9-_]*[A-Za-z0-9]{20}T3BlbkFJ[A-Za-z0-9]{20}/i, severity: 'High' },

    // PayPal Braintree Access Token (matches the Braintree access token format)
    { name: "PayPal Braintree Access Token", regex: /access_token\$production\$[0-9a-z]{16}\$[0-9a-f]{32}/i, severity: 'High' },

    // PGP Private Key Block
    { name: "PGP Private Key Block", regex: /-----BEGIN PGP PRIVATE KEY BLOCK-----/i, severity: 'High' },

    // Private Key (multiple variations for different key types)
    { name: "Private Key Block", regex: /-----BEGIN (DSA|EC|OPENSSH|PGP|PRIVATE|RSA|SSH2 ENCRYPTED) PRIVATE KEY-----/i, severity: 'High' },

    // PyPI token (format used for PyPI API tokens)
    { name: "PyPI Token", regex: /pypi-AgEIcHlwaS5vcmc[A-Za-z0-9-_]{70,}/i, severity: 'High' },

    // SendGrid API Key (matches SendGrid API key format)
    { name: "SendGrid API Key", regex: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/i, severity: 'High' },

    // Slack Token (matches Slack token format)
    { name: "Slack Token", regex: /xox(?:a|b|p|o|s|r)-(?:\d+-)+[a-z0-9]+/i, severity: 'High' },

    // Slack Webhook
    { name: "Slack Webhook", regex: /https:\/\/hooks\.slack\.com\/services\/T[a-zA-Z0-9_]+\/B[a-zA-Z0-9_]+\/[a-zA-Z0-9_]+/i, severity: 'Medium' },

    // Square OAuth Secret
    { name: "Square OAuth Secret", regex: /sq0csp-[0-9A-Za-z\\\-_]{43}/i, severity: 'Medium' },

    // Stripe Public API Key
    { name: "Stripe Public API Key", regex: /pk_(test|live)_[0-9a-zA-Z]{24}/i, severity: 'High' },

    // Stripe Secret API Key
    { name: "Stripe Secret API Key", regex: /sk_(test|live)_[0-9a-zA-Z]{24}/i, severity: 'High' },

    // Stripe Restricted API Key
    { name: "Stripe Restricted API Key", regex: /rk_(test|live)_[0-9a-zA-Z]{24}/i, severity: 'High' },

    // Telegram Bot Token
    { name: "Telegram Bot Token", regex: /(?:".*?"=)?\d{8,10}:[0-9A-Za-z_-]{35}/i, severity: 'Medium' },

    // Twilio API Key
    { name: "Twilio API Key", regex: /(AC[a-z0-9]{32}|SK[a-z0-9]{32})/i, severity: 'High' },

    // Dynamically add user-defined patterns from the configuration
    ...userPatterns.map(({ name, regex, severity }) => ({
        name,
        regex: new RegExp(regex, 'i'),
        severity: severity || 'Medium'
    }))
];
