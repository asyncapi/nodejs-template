const {
  waitForMessage,
  setupSubscribe,
  publishMessage, client
} = require('./index');

// Mocking the console.debug function to prevent console output during testing
jest.spyOn(global.console, 'debug').mockImplementation(() => {
  return;
});
const consoleDebugSpy = jest.spyOn(global.console, 'debug');

describe('MQTT Connection Setup and Data Reception', () => {
  jest.setTimeout(10000);

  beforeAll(async () => {
    await client.init();
  });
  test('Recieves and Validates data', async () => {
    // Setting up subscription
    await setupSubscribe();

    // Publishing a message
    publishMessage();

    // Waiting for the expected message
    await waitForMessage();

    // Asserting that the debug message was called with the expected content
    expect(consoleDebugSpy).toHaveBeenCalledWith('Got message {"lumens":10} on parameter streetlight 101');
  });
});
