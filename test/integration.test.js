const path = require('path');
const Generator = require('@asyncapi/generator');
const { readFile } = require('fs').promises;
const fetch = require('node-fetch');

const MAIN_TEST_RESULT_PATH = path.join('test', 'temp', 'integrationTestResult');

const generateFolderName = () => {
    // you always want to generate to new directory to make sure test runs in clear environment
    return path.resolve(MAIN_TEST_RESULT_PATH, Math.random().toString(36).substring(7));
};

describe('template integration tests for generated files using the generator and mqtt example', () => {

    jest.setTimeout(30000);

    it('should generate proper handlers and routes files', async() => {
        const outputDir = generateFolderName();
        const params = {
            server: 'production'
        };
        const basicExampleUrl = 'https://raw.githubusercontent.com/asyncapi/spec/v2.2.0/examples/streetlights-mqtt.yml';
        const asyncapiFile = await fetch(basicExampleUrl);

        const generator = new Generator(path.normalize('./'), outputDir, { forceWrite: true, templateParams: params });
        await generator.generateFromString(await asyncapiFile.text());

        const expectedFiles = [
            '/src/api/handlers/smartylighting-streetlights-1-0-action-{streetlightId}-dim.js',
            '/src/api/handlers/smartylighting-streetlights-1-0-action-{streetlightId}-turn-off.js',
            '/src/api/handlers/smartylighting-streetlights-1-0-action-{streetlightId}-turn-on.js',
            '/src/api/handlers/smartylighting-streetlights-1-0-event-{streetlightId}-lighting-measured.js',
            '/src/api/routes/smartylighting-streetlights-1-0-action-{streetlightId}-dim.js',
            '/src/api/routes/smartylighting-streetlights-1-0-action-{streetlightId}-turn-off.js',
            '/src/api/routes/smartylighting-streetlights-1-0-action-{streetlightId}-turn-on.js',
            '/src/api/routes/smartylighting-streetlights-1-0-event-{streetlightId}-lighting-measured.js'
        ];
        for (const index in expectedFiles) {
            const file = await readFile(path.join(outputDir, expectedFiles[index]), 'utf8');
            expect(file).toMatchSnapshot();
        }
    });
});

describe('template integration tests for generated files using the generator and kafka example', () => {

    jest.setTimeout(30000);

    const outputDir = generateFolderName();
    const params = {
        server: 'test',
        securityScheme: 'certs',
        certFilesDir: './mocks/kafka/dummyCerts'
    };
    const kafkaExamplePath = './mocks/kafka/asyncapi.yml';

    it('should generate proper config for X509 security', async() => {
        const expectedSecuritySetting = 'rejectUnauthorized: true';
        const expectedCofigFile = '/config/common.yml';

        const generator = new Generator(path.normalize('./'), outputDir, { forceWrite: true, templateParams: params });
        await generator.generateFromFile(path.resolve('test', kafkaExamplePath));

        const file = await readFile(path.join(outputDir, expectedCofigFile), 'utf8');
        expect(file.includes(expectedSecuritySetting)).toBeTruthy();
    });

    it('should generate proper variable that points to custom cert files location', async() => {
        const expectedVariable = "const certFilesDir = './mocks/kafka/dummyCerts';";
        const expectedFile = '/src/api/index.js';

        const generator = new Generator(path.normalize('./'), outputDir, { forceWrite: true, templateParams: params });
        await generator.generateFromFile(path.resolve('test', kafkaExamplePath));

        const file = await readFile(path.join(outputDir, expectedFile), 'utf8');
        expect(file.includes(expectedVariable)).toBeTruthy();
    });
});