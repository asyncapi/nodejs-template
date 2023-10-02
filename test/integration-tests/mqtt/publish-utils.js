const { client } = require('./nodejs-client');

const BROKER_URL = 'mqtt://localhost:1883';
const TURN_ON_TOPIC = 'smartylighting/streetlights/1/0/action/101/turn/on';

let enteredMiddleware = false;
/**
 * Waits asynchronously until the `enteredMiddleware` flag becomes true.
 * This is typically used to prevent the test from ending before certain asynchronous operations complete.
 */
async function waitForMessage() {
  const poll = resolve => {
    if (enteredMiddleware === true) resolve();
    else setTimeout(_ => {
      poll(resolve);
    }, 100);
  };
  return new Promise(poll);
}

/**
 * Establishes a connection to the MQTT broker at the provided URL and subscribes to the topic being tested
 * Resolves with the first message received on the subscribed topic and closes the client connection.
 * Used for testing purposes (alternative to manually testing using `mosquitto_sub`)
 * @returns {Promise<string>} The message received on the subscribed topic.
 */
async function setupSubscribe() {
  const mqtt = require('mqtt');
  const client = mqtt.connect(BROKER_URL);

  return new Promise((resolve, reject) => {
    const topic = TURN_ON_TOPIC;
    client.subscribe(topic, (error) => {
      if (error) {
        reject(error);
      }
    });

    client.on('message', (receivedTopic, message) => {
      resolve(message.toString());
      client.end();
    });
  });
}

/**
 * Registers a middleware function for the `turnOnOffHandler` that logs the sent message
 */
function setupPublishMiddleware() {
  client.registerTurnOnMiddleware((message) => {
    console.debug(`Sending message ${JSON.stringify(message.payload)} on parameter streetlight ${message.params.streetlightId}`);
    enteredMiddleware = true;
  });
}

/**
 * Sends a message with the specified payload to the 'smartylighting/streetlights/1/0/action/101/turn/on' topic using the hermes app.
 */
function setupPublish() {
  client.app.send({'command': 'on'}, {}, TURN_ON_TOPIC);
}

module.exports = {
  setupSubscribe,
  setupPublishMiddleware,
  setupPublish,
  waitForMessage,
  client
};
