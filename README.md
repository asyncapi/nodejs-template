[![AsyncAPI logo](./assets/github-repobanner-nodetemp.png)](https://www.asyncapi.com)  
\
![npm](https://img.shields.io/npm/v/@asyncapi/nodejs-template?style=for-the-badge) ![npm](https://img.shields.io/npm/dt/@asyncapi/nodejs-template?style=for-the-badge)

<!-- toc is generated with GitHub Actions do not remove toc markers -->

<!-- toc -->

- [Overview](#overview)
- [Technical requirements](#technical-requirements)
- [Specification requirements](#specification-requirements)
- [Supported protocols](#supported-protocols)
- [How to use the template](#how-to-use-the-template)
  - [CLI](#cli)
  - [Adding custom code / handlers](#adding-custom-code--handlers)
- [Template configuration](#template-configuration)
- [Development](#development)
- [Contributors](#contributors)

<!-- tocstop -->

## Overview

This template generates a Node.js application with any of the [supported protocols](#supported-protocols) endpoint, based on [Hermesjs](https://github.com/hitchhq/hermes).

Other files are for the setup of developer environment, like `.editorconfig` or `.eslint`.

## Technical requirements

- 0.50.0 =< [Generator](https://github.com/asyncapi/generator/) < 2.0.0,
- Generator specific [requirements](https://github.com/asyncapi/generator/#requirements)


## Specification requirements

Property name | Reason | Fallback | Default
---|---|---|---
`operationId` | Operation ID must be set for every operation to generate proper functions as there is no fallback in place | - | -


## Supported protocols

* [AMQP](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)
* [MQTT and MQTTS](https://en.wikipedia.org/wiki/MQTT)
* [Kafka](https://en.wikipedia.org/wiki/Apache_Kafka)
* [WebSocket](https://en.wikipedia.org/wiki/WebSocket)

## How to use the template

This template must be used with the AsyncAPI Generator. You can find all available options [here](https://github.com/asyncapi/generator/).

In case you use X509 security and need to provide certificates, either place them in the root of the generated server with the following names: `ca.pem`, `service.cert`, `service.key`. You can provide a custom directory where cert files are located using `certFilesDir` parameter like `-p certFilesDir=../not/in/my/app/dir`.

Since you can have multiple different security schemes, to use the one of X509 type, you need to pass the name of the scheme like this: `-p securityScheme=SCHEME_NAME`.

> You can find a complete tutorial on AsyncAPI Generator using this template [here](https://www.asyncapi.com/docs/tutorials/streetlights). 

### CLI

```bash
# Install the AsyncAPI Generator
$ npm install -g @asyncapi/generator

# Run generation
# To use the template
$ ag https://bit.ly/asyncapi @asyncapi/nodejs-template -o output -p server=production

# OR

# To test your local changes
$ ag https://bit.ly/asyncapi ./ -o output -p server=production

##
## Start the server 
##

# Go to the generated server
$ cd output

# Build generated application
$ npm i

# Start server
# To enable production settings start the server with "NODE_ENV=production npm start"
$ npm start

##
## Start the client 
##

#for testing your server you can use mqtt client. open a new terminal and install it using:
$ npm install mqtt -g

#publish an invalid message.
$ mqtt pub -t 'smartylighting/streetlights/1/0/event/123/lighting/measured' -h 'test.mosquitto.org' -m '{"id": 1, "lumens": "3", "sentAt": "2017-06-07T12:34:32.000Z"}'

#publish a valid message
$ mqtt pub -t 'smartylighting/streetlights/1/0/event/123/lighting/measured' -h 'test.mosquitto.org' -m '{"id": 1, "lumens": 3, "sentAt": "2017-06-07T12:34:32.000Z"}'

#You should see the sent message in the logs of the previously started server.
#Notice that the server automatically validates incoming messages and logs out validation errors
```

### Adding custom code / handlers

It's highly recommended to treat the generated template as a library or API for initializing the server and integrating user-written handlers. Instead of directly modifying the template, leveraging it in this manner ensures that its regenerative capability is preserved. Any modifications made directly to the template would be overwritten upon regeneration.

Consider a scenario where you intend to introduce a new channel or section to the AsyncAPI file, followed by a template regeneration. In this case, any modifications applied within the generated code would be overwritten.

To avoid this, user code remains external to the generated code, functioning as an independent entity that consumes the generated code as a library. By adopting this approach, the user code remains unaffected during template regenerations.

Facilitating this separation involves creating handlers and associating them with their respective routes. These handlers can then be seamlessly integrated into the template's workflow by importing the appropriate methods to register the handlers. In doing so, the template's `client.register<operationId>Middleware` method becomes the bridge between the user-written handlers and the generated code. This can be used to register middlewares for specific methods on specific channels.

> The AsyncAPI file used for the example is [here](https://bit.ly/asyncapi)

```js
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
    // For example `client.app.send` sends a message to some channel using and before it is sent, you want to perform some other actions
    // in such a case, you can register middlewares like below
    client.registerTurnOnMiddleware((message) => { // `turnOn` is the respective operationId
        console.log("hitting the middleware before publishing the message");
        console.log(
            `sending turn on message to streetlight ${message.params.streetlightId}`,
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

    client.registerReceiveLightMeasurementMiddleware((message) => { // `recieveLightMeasurement` is the respective operationId
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
```

You can run the above code and test the working of the handlers by sending a message using the mqtt cli / mosquitto broker software to the `smartylighting/streetlights/1/0/event/123/lighting/measured` channel using this command
`mosquitto_pub -h test.mosquitto.org -p 1883 -t "smartylighting/streetlights/1/0/event/101/lighting/measured" -m '{"lumens": 10, "sentAt": "2017-06-07T12:34:32.000Z"}'`
or 
`mqtt pub -t 'smartylighting/streetlights/1/0/event/123/lighting/measured' -h 'test.mosquitto.org' -m '{"id": 1, "lumens": 3, }'` (if you are using the mqtt cli)

## Template configuration

You can configure this template by passing different parameters in the Generator CLI: `-p PARAM1_NAME=PARAM1_VALUE -p PARAM2_NAME=PARAM2_VALUE`

|Name|Description|Required|Example|
|---|---|---|---|
|server|The server you want to use in the code.|Yes|`production`|
|securityScheme|Name of the security scheme. Only scheme with X509 and Kafka protocol is supported for now.|No|'mySchemeName'|
|certFilesDir|Directory where application certificates are located. This parameter is needed when you use X509 security scheme and your cert files are not located in the root of your application.|No|`../not/in/my/app/dir`|

## Development

The most straightforward command to use this template is:
```bash
$ ag https://bit.ly/asyncapi @asyncapi/nodejs-template -o output -p server=production
```

**Setup locally**

```bash
# Run following commands in terminal:
$ git clone https://github.com/{username}/nodejs-template
$ cd nodejs-template
$ npm install
$ ag https://bit.ly/asyncapi ./ -o output -p server=production
```

For local development, you need different variations of this command. First of all, you need to know about three important CLI flags:
- `--debug` enables the debug mode in React rendering engine what makes filters debugging simpler.
- `--watch-template` enables a watcher of changes that you make in the template. It regenerates your template whenever it detects a change.
- `--install` enforces reinstallation of the template.


There are two ways you can work on template development:
- Use global Generator and template from your local sources:
  ```bash
  # assumption is that you run this command from the root of your template
  $ ag https://bit.ly/asyncapi ./ -o output -p server=production
  ```
- Use Generator from sources and template also from local sources. This approach enables more debugging options with awesome `console.log` in the Generator sources or even the Parser located in `node_modules` of the Generator:
  ```bash
  # assumption is that you run this command from the root of your template
  # assumption is that generator sources are cloned on the same level as the template
  $ ../generator/cli.js https://bit.ly/asyncapi ./ -o output -p server=production
  ```


## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://www.fmvilas.com/"><img src="https://avatars.githubusercontent.com/u/242119?v=4?s=100" width="100px;" alt="Fran Méndez"/><br /><sub><b>Fran Méndez</b></sub></a><br /><a href="https://github.com/asyncapi/nodejs-template/commits?author=fmvilas" title="Code">💻</a> <a href="#ideas-fmvilas" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://dev.to/derberg"><img src="https://avatars.githubusercontent.com/u/6995927?v=4?s=100" width="100px;" alt="Lukasz Gornicki"/><br /><sub><b>Lukasz Gornicki</b></sub></a><br /><a href="#infra-derberg" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/asyncapi/nodejs-template/commits?author=derberg" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/KhudaDad414"><img src="https://avatars.githubusercontent.com/u/32505158?v=4?s=100" width="100px;" alt="Khuda Dad Nomani"/><br /><sub><b>Khuda Dad Nomani</b></sub></a><br /><a href="https://github.com/asyncapi/nodejs-template/commits?author=KhudaDad414" title="Documentation">📖</a> <a href="https://github.com/asyncapi/nodejs-template/commits?author=KhudaDad414" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://samridhi-98.github.io/Portfolio"><img src="https://avatars.githubusercontent.com/u/54466041?v=4?s=100" width="100px;" alt="Samriddhi"/><br /><sub><b>Samriddhi</b></sub></a><br /><a href="https://github.com/asyncapi/nodejs-template/commits?author=Samridhi-98" title="Code">💻</a> <a href="https://github.com/asyncapi/nodejs-template/commits?author=Samridhi-98" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/wandertaker"><img src="https://avatars.githubusercontent.com/u/23746861?v=4?s=100" width="100px;" alt="Julius Jann"/><br /><sub><b>Julius Jann</b></sub></a><br /><a href="https://github.com/asyncapi/nodejs-template/commits?author=wandertaker" title="Code">💻</a> <a href="https://github.com/asyncapi/nodejs-template/commits?author=wandertaker" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://rishikaushik.com"><img src="https://avatars.githubusercontent.com/u/52498617?v=4?s=100" width="100px;" alt="Rishi"/><br /><sub><b>Rishi</b></sub></a><br /><a href="https://github.com/asyncapi/nodejs-template/commits?author=kaushik-rishi" title="Code">💻</a> <a href="https://github.com/asyncapi/nodejs-template/commits?author=kaushik-rishi" title="Documentation">📖</a> <a href="https://github.com/asyncapi/nodejs-template/commits?author=kaushik-rishi" title="Tests">⚠️</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
