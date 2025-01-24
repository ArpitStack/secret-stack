/**
 * © 2025 ArpitStack. Distributed under Apache-2.0 License.
 * See http://www.apache.org/licenses/LICENSE-2.0 for details.
 */

import { secretPatterns } from "../src/detectors/secretPatterns";

describe('Secret Patterns', () => {
    secretPatterns.forEach(({ name, regex }) => {
        describe(`${name}`, () => {
            // Define a set of valid strings that should match the regex
            const validExamples: string[] = getValidExamples(name);

            // Define a set of invalid strings that should NOT match the regex
            const invalidExamples: string[] = getInvalidExamples(name);

            // Test valid examples
            validExamples.forEach((example) => {
                it(`should match valid example: "${example}"`, () => {
                    expect(regex.test(example)).toBe(true);
                });
            });

            // Test invalid examples
            invalidExamples.forEach((example) => {
                it(`should not match invalid example: "${example}"`, () => {
                    expect(regex.test(example)).toBe(false);
                });
            });
        });
    });
});

// Function to retrieve valid examples for each pattern
function getValidExamples(patternName: string): string[] {
    const examples: { [key: string]: string[] } = {
        "Azure Account Key": [
            "ynJfQPL3eXzQ7GHmLk4m0t6H8viuhijklmnopqrstkRJx9y3Zj5+/pLWEkM8p9NkL8IoMOP/8gkH5yB6stP0Ag==",
        ],
        "Artifactory Password": [
            "AP1abcd1234efghijklmnopqrst",
        ],
        "Artifactory Token": [
            "AKCabcdefghij1234567890",
        ],
        "Basic Auth Credentials": [
            "https://user:password@host.com",
        ],
        "Discord Token": [
            "MNOabcdefg12347890abcdEFGHIJ.abcdef.1234567890abcdefA1234567890",
        ],
        "Firebase URL": [
            "https://myproject.firebaseio.com",
        ],
        "GitHub Token": [
            "ghp_abcdefghijklm1234567890123456789012345",
        ],
        "GitLab Personal Access Token": [
            "glpat-abcdefghijklm1234567890ABCDEFGHIJKLM1234",
        ],
        "GitLab Runner Token": [
            "GR1348941abcdefg1234567890xyz",
        ],
        "GitLab CI/CD Token": [
            "glcbt-1234567890abcdefglcbt1234_abcdefg",
        ],
        "GitLab Incoming Mail Token": [
            "glimt-1234567890abcdefglimt1234",
        ],
        "GitLab Trigger Token": [
            "glptt-abcdef1234567890abcdef1234567890abcdef12",
        ],
        "GitLab Agent Token": [
            "glagent-abcdef1234567890abcdef1234567890abcdef1234abcdefgh",
        ],
        "GitLab OAuth Application Secret": [
            "gloas-abcdef1234567890abcdef1234567890abcdef1234567890abcdefghijklm123",
        ],
        "IBM Cloud IAM Key": [
            "ibm-cloud-iam-api-key_abcdefgh1234567890abcdef12345678901234567890",
        ],
        "JWT Token": [
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SyH1mXa7zABtQ96Q7Oox5wwQXaC6DMyXUVfGVd5Bh04",
        ],
        "MailChimp API Key": [
            "9a6f39b82164a6bcf6dbf28d324d6eab-us12",
        ],
        "Mailgun API Key": [
            "key-4f41d2bc6db5452da4db14e4fd5a3cb1",
        ],
        "NPM UUID": [
            "f74d3c9b-237c-400a-9b9f-7fc21b2adf58",
        ],
        "NPM Token": [
            "npm_hbGciOiJIUzI1NiIsInR5cCInpm6IkpXVCJ9.npm_eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SyH1mXa7zABtQ96Q7Oox5wwQXaC6DMyXUVfGVd5Bh04",
        ],
        "PayPal Braintree Access Token": [
            "access_token$production$0123456789abcdyz$0123456789abcdef0123456789abcdef",
        ],
        "PGP Private Key Block": [
            "-----BEGIN PGP PRIVATE KEY BLOCK-----",
        ],
        "Private Key Block": [
            "-----BEGIN RSA PRIVATE KEY-----",
        ],
        "PyPI Token": [
            "pypi-AgEIcHlwaS5vcmcAABEXAMPLEmcAABEXAMPLEmcAABEXAMPLEmcAABEXAMPLEmcAABEXAMPLEmcAABEXAMPLE",
        ],
        "SendGrid API Key": [
            "SG.abcdefghijklmNOPQRSTUV.12345abcdef67890ABCDEFGH_ageA-67890ABCDEF5a",
        ],
        "Slack Token": [
            "xoxb-123456789012-abcdefgHJKLmnopQRSTuv12345",
        ],
        "Slack Webhook": [
            "https://hooks.slack.com/services/T123456/B123456/abcdefg1234567",
        ],
        "Square OAuth Secret": [
            "sq0csp-abcdef1234567890abcdef1234567890abcdef1234567",
        ],
        "Stripe Public API Key": [
            "pk_test_4eC39HqLyjWDarjtT1zdp7dc",
            "pk_live_4eC39HqLyjWDarjtT1zdp7dc"
        ],
        "Stripe Secret API Key": [
            "sk_test_4eC39HqLyjWDarjtT1zdp7dc",
            "sk_live_4eC39HqLyjWDarjtT1zdp7dc"
        ],
        "Stripe Restricted API Key": [
            "rk_test_4eC39HqLyjWDarjtT1zdp7dc",
            "rk_live_4eC39HqLyjWDarjtT1zdp7dc"
        ],
        "Telegram Bot Token": [
            "1234567890:abcdefgABCDEF_123456789-01234567890",
        ],
        "Twilio API Key": [
            "SKabcdef1234567890abcdef1234567890",
        ],
        "IBM COS HMAC Credentials": [
            "cos-hmac-secret-access-keyabcdef1234567890abcdef1234567890abcdef1234567890",
        ],
        "IPv4 Address": [
            "8.8.8.8",
            "123.45.67.89",
            "203.0.113.195:8080",
        ],
        "OpenAI Token": [
            "sk-abcdefghijklmnopqrstuv123456T3BlbkFJabcdefghijklmno567890",
            "sk-abcdefgHIJKLM1234567890T3BlbkFJ0987654321abcde12345",
        ]
    };

    return examples[patternName] || [];
}

// Function to retrieve invalid examples for each pattern
function getInvalidExamples(patternName: string): string[] {
    const examples: { [key: string]: string[] } = {
        "Azure Account Key": [
            "AccountKey=invalidkey12345",
            "AccountKey=1234567890",
        ],
        "Artifactory Password": [
            "AP123",
            "password123",
        ],
        "Artifactory Token": [
            "AKCINVALID",
            "AKCabcdef",
        ],
        "Basic Auth Credentials": [
            "https://user@host.com",
            "ftp://username:password@domain.com",
        ],
        "Discord Token": [
            "INVALID_TOKEN",
            "MNinvalidtoken.abcd1234.efgh5678",
        ],
        "Firebase URL": [
            "http://example.com/firebaseio",
            "https://myproject.firebaseio",
        ],
        "GitHub Token": [
            "ghp_invalid_token_123",
        ],
        "GitLab Personal Access Token": [
            "invalid-glpat-token",
        ],
        "GitLab Runner Token": [
            "GRINVALIDRUN",
        ],
        "GitLab CI/CD Token": [
            "invalid-glcbt-token",
        ],
        "GitLab Incoming Mail Token": [
            "glimt-invalidtoken",
        ],
        "GitLab Trigger Token": [
            "glptt-invalidtoken",
        ],
        "GitLab Agent Token": [
            "glagent-invalidtoken",
        ],
        "GitLab OAuth Application Secret": [
            "gloas-invalid-token",
        ],
        "IBM Cloud IAM Key": [
            "ibm-cloud-iam-invalidkey",
        ],
        "JWT Token": [
            "invalidJWTtoken",
        ],
        "MailChimp API Key": [
            "invalid-us12-key",
        ],
        "Mailgun API Key": [
            "invalidkey",
        ],
        "NPM UUID": [
            "npm_invalid_uuid",
        ],
        "NPM Token": [
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SyH1mXa7zABtQ96Q7Oox5wwQXaC6DMyXUVfGVd5Bh04",
        ],
        "PayPal Braintree Access Token": [
            "invalid-access_token",
        ],
        "PGP Private Key Block": [
            "-----END PGP PRIVATE KEY BLOCK-----",
        ],
        "Private Key Block": [
            "-----BEGIN PUBLIC KEY-----",
        ],
        "PyPI Token": [
            "invalid_pypi_token",
        ],
        "SendGrid API Key": [
            "invalid-sendgrid-api-key",
        ],
        "Slack Token": [
            "invalid-xoxb-token",
        ],
        "Slack Webhook": [
            "invalid-slack-webhook-url",
        ],
        "Square OAuth Secret": [
            "sq0csp-invalidtoken",
        ],
        "Stripe Public API Key": [
            "pk_4eC39HqLyjWDarjtT1zdp7dc",
            "pk_test_4eC39HqLyjWDarjtT1zdp7d",
            "pks_live_4eC39HqLyjWDarjtT1zdp7dc"
        ],
        "Stripe Secret API Key": [
            "sk_4eC39HqLyjWDarjtT1zdp7dc",
            "sk_test_4eC39HqLyjWDarjtT1zdp7d",
            "ks_live_4eC39HqLyjWDarjtT1zdp7dc"
        ],
        "Stripe Restricted API Key": [
            "rk_4eC39HqLyjWDarjtT1zdp7dc",
            "rk_test_4eC39HqLyjWDarjtT1zdp7d",
            "rk_live_4eC39HqLyjWDarjtT1zdp7d",
            "rks_live_4eC39HqLyjWDarjtT1zdp7dc"
        ],
        "Telegram Bot Token": [
            "invalid-token-12345",
        ],
        "Twilio API Key": [
            "SK_INVALID_API_KEY",
        ],
        "IBM COS HMAC Credentials": [
            "cos-hmac-12345",
            "secret-access-key123",
        ],
        "IPv4 Address": [
            "192.168.1.1",
            "127.0.0.1",
            "999.999.999.999",
        ],
        "OpenAI Token": [
            "sk-invalid-token",
            "sk-1234567890-T3BlbkFJ123456",
        ],
    };

    return examples[patternName] || [];
}
