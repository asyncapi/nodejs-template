import { File } from '@asyncapi/generator-react-sdk';

export default function readmeFile({asyncapi, params}) {
  return <File name={'README.md'}>
    {`# ${ asyncapi.info().title() }

${ asyncapi.info().description() || '' }

## Set up your template

1. Install dependencies
    \`\`\`sh
    npm i
    \`\`\`
${(params.securityScheme && (asyncapi.server(params.server).protocol() === 'kafka' || asyncapi.server(params.server).protocol() === 'kafka-secure') && asyncapi.components().securityScheme(params.securityScheme).type() === 'X509') ? '1. (Optional) For X509 security provide files with all data required to establish secure connection using certificates. Place files like `ca.pem`, `service.cert`, `service.key` in the root of the project or the location that you explicitly specified during generation.' : ''}

## Use the generated template by adding custom code / handlers

- use the \`client.register<OperationId>Middleware\` method as a bridge between the user-written handlers and the generated code. This can be used to register middlewares for specific methods on specific channels.

> The AsyncAPI file used for the example is [here](https://bit.ly/asyncapi)

\`\`\`js
// output refers to the generated template folder
// You require the generated server. Running this code starts the server
// App exposes API to send messages
const { client } = require("./output");

// to start the app
client.init();

// Generated handlers that we use to react on consumer / produced messages are attached to the client
// through which we can register middleware functions

/**
 * 
 * 
 * Example of how to process a message before it is sent to the broker
 * 
 * 
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
 * 
 * 
*/

(function myLoop (i) {
  setTimeout(() => {
    console.log('producing custom message');
    client.app.send({percentage: 1}, {}, 'smartylighting/streetlights/1/0/action/1/turn/on');
    if (--i) myLoop(i);
  }, 1000);
}(3));
\`\`\`

You can run the above code and test the working of the handlers by sending a message using the mqtt cli / mosquitto broker software to the \`smartylighting/streetlights/1/0/event/123/lighting/measured\` channel using this command
\`mosquitto_pub -h test.mosquitto.org -p 1883 -t "smartylighting/streetlights/1/0/event/101/lighting/measured" -m '{"lumens": 10, "sentAt": "2017-06-07T12:34:32.000Z"}'\`
or 
\`mqtt pub -t 'smartylighting/streetlights/1/0/event/123/lighting/measured' -h 'test.mosquitto.org' -m '{"id": 1, "lumens": 3, }'\` (if you are using the mqtt cli)
`}
  </File>;
}
