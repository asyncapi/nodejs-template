const {
  client,
  waitForMessage,
  setupSubscribe,
  setupPublishMiddleware,
  setupPublish,
} = require('./index');

// Mocking the console.debug function to prevent console output during testing
jest.spyOn(global.console, 'debug').mockImplementation(() => {
  return;
});
const consoleDebugSpy = jest.spyOn(global.console, 'debug');

describe('MQTT Connection Setup and Message Processing', () => {
  jest.setTimeout(10000);

  beforeAll(() => {
    client.init();
  });

  test('Middleware Processes Message Before Sending', async () => {
    setupPublishMiddleware();
    setupPublish();
    await waitForMessage();

    // Asserting that the debug message was called with the expected content from the middleware function
    expect(consoleDebugSpy).toHaveBeenCalledWith(
      'Sending message {"command":"on"} on parameter streetlight 101'
    );
  });

  test('Message is Properly Published and Received', async () => {
    // Delaying the client.app.send by 1000ms, so that by then the subscriber can be setup
    setTimeout(() => {
      setupPublish();
    }, 1000);

    // Setting up subscription and waiting for a message
    const message = await setupSubscribe();

    // Parsing and comparing the received JSON payload
    const jsonMessage = JSON.stringify(JSON.parse(message));

    expect(jsonMessage).toBe('{"command":"on"}');
  });
});
