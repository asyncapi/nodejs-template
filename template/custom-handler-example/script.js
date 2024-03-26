import { File } from '@asyncapi/generator-react-sdk';

export default function exampleCustomHandlerRegistrationScript() {
  return <File name='script.js'>
    {`// output refers to the generated template folder
// You require the generated server. Running this code starts the server
// App exposes API to send messages
const { client } = require("../"); // library is in the current directory

client.init(); // starts the app

// Generated handlers that we use to react on consumer / produced messages are attached to the client
// through which we can register middleware functions

/**
 * 
 * 
 * Example of how to process a message before it is sent to the broker
 * 
 * Modify the following in the function \`testPublish\` according to your usecase
 * 1. channel / topic name
 * 2. tool used to publish message according to the procotol used (amqp/mqtt/etc ...)
 * 3. name of the invocated middleware function (based on operation Id)
 */
function testPublish() {
    // mosquitto_sub -h test.mosquitto.org -p 1883 -t "smartylighting/streetlights/1/0/action/12/turn/on"

    // Registering your custom logic in a channel-specific handler
    // the passed handler function is called once the app sends a message to the channel
    // For example \`client.app.send\` sends a message to some channel using and before it is sent, you want to perform some other actions
    // in such a case, you can register middlewares like below
    client.registerTurnOnMiddleware((message) => { // \`turnOn\` is the respective operationId
        console.log("hitting the middleware before publishing the message");
        console.log(
            \`sending turn on message to streetlight \${message.params.streetlightId}\`,
            message.payload
        );
    });

    client.app.send(
        { command: "off" },
        {},
        "smartylighting/streetlights/1/0/action/12/turn/on"
    );
}


/**
 *
 * 
 * Example of how to work with generated code as a consumer
 * 
 * Modify the following in the function \`testSubscribe\` according to your usecase
 * 1. channel / topic name
 * 2. tool used to publish message according to the procotol used (amqp/mqtt/etc ...)
 * 3. name of the invocated middleware function (based on operation Id)
 * 
*/
function testSubscribe() {
    // mosquitto_pub -h test.mosquitto.org -p 1883 -t "smartylighting/streetlights/1/0/event/101/lighting/measured" -m '{"lumens": 10}'

    // Writing your custom logic that should be triggered when your app receives as message from a given channel
    // Registering your custom logic in a channel-specific handler
    // the passed handler functions are called once the app gets message sent to the channel

    client.registerReceiveLightMeasurementMiddleware((message) => { // \`recieveLightMeasurement\` is the respective operationId
        console.log("recieved in middleware 1", message.payload);
    });

    client.registerReceiveLightMeasurementMiddleware((message) => {
        console.log("recieved in middleware 2", message.payload);
    });
}

testPublish();
testSubscribe();

/**
 * 
 * 
 * Example of how to produce a message using API of generated app independently from the handlers
 * Again, will have to modify the below according to your usecase:
 * 1. payload
 * 2. channel / topic name
 * 
*/

(function myLoop (i) {
  setTimeout(() => {
    console.log('producing custom message');
    client.app.send({percentage: 1}, {}, 'smartylighting/streetlights/1/0/action/1/turn/on');
    if (--i) myLoop(i);
  }, 1000);
}(3));`}
  </File>;
}