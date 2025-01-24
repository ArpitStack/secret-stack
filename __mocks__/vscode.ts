module.exports = {
    workspace: {
        getConfiguration: jest.fn().mockReturnValue({
            get: jest.fn().mockReturnValue([]), // Mock returning empty array for customPatterns
        }),
    },
    commands: {
        registerCommand: jest.fn(),
    },
    window: {
        showInformationMessage: jest.fn(),
    },
};