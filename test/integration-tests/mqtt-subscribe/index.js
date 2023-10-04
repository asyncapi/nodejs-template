const {client} = require("./nodejs-client")

const LIGHTING_MEASURED_TOPIC = 'smartylighting/streetlights/1/0/event/101/lighting/measured';
const BROKER_URL = "mqtt://localhost:1883";
const MESSAGE_PUBLISHED = {lumens: 10};

let recievedMessage = false;

/**
 * Waits asynchronously until the `recievedMessage` flag becomes true.
 * This is typically used to prevent the test from ending before certain asynchronous operations complete.
 */
async function waitForMessage() {
  const poll = resolve => {
    if (recievedMessage === true) resolve();
    else setTimeout(_ => poll(resolve), 100);
  };
  return new Promise(poll);
}

/**
 * Establishes a connection to the MQTT broker at the provided URL and publishes a message to the specified topic
 * Used for testing purposes (alternative to manually testing using `mosquitto_pub`)
 */
async function publishMessage() {
  const mqtt = require('mqtt');
  const client = mqtt.connect(BROKER_URL);

  await new Promise((resolve) => {
    client.on('connect', () => {
      resolve();
    });
  });

  try {
    const topic = LIGHTING_MEASURED_TOPIC;
    const message = JSON.stringify(MESSAGE_PUBLISHED);

    await new Promise((resolve, reject) => {
      client.publish(topic, message, (error) => {
        if (error) {
          reject(error);
        } else {
          console.log('Message published successfully.');
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('Error publishing:', error);
  } finally {
    client.end();
  }
}

/**
 * Registers a middleware function for the `streetLightMeasuredHandler` that logs the sent message
 */
async function setupSubscribe() {
  client.registerReceiveLightMeasurementMiddleware(async (message) => {
    console.debug(`Got message ${JSON.stringify(message.payload)} on parameter streetlight ${message.params.streetlightId}`);
    recievedMessage = true;
  });
}

module.exports = {
  setupSubscribe,
  waitForMessage,
  publishMessage,
  client
};
