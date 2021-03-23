<h5 align="center">
  <br>
  <a href="https://www.asyncapi.org"><img src="https://github.com/asyncapi/parser-nodejs/raw/master/assets/logo.png" alt="AsyncAPI logo" width="200"></a>
  <br>
  AsyncAPI Node.js Template
</h5>

![npm](https://img.shields.io/npm/v/@asyncapi/nodejs-template?style=for-the-badge) ![npm](https://img.shields.io/npm/dt/@asyncapi/nodejs-template?style=for-the-badge)

<!-- toc is generated with GitHub Actions do not remove toc markers -->

<!-- toc -->

- [Overview](#overview)
- [Specification requirements](#specification-requirements)
- [Supported protocols](#supported-protocols)
- [How to use the template](#how-to-use-the-template)
  * [CLI](#cli)
- [Template configuration](#template-configuration)
- [Custom hooks that you can disable](#custom-hooks-that-you-can-disable)
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
* [MQTT](https://en.wikipedia.org/wiki/MQTT)
* [Kafka](https://en.wikipedia.org/wiki/Apache_Kafka)
* [WebSocket](https://en.wikipedia.org/wiki/WebSocket)



## How to use the template

This template must be used with the AsyncAPI Generator. You can find all available options [here](https://github.com/asyncapi/generator/).

Note: You can find a complete tutorial on AsyncAPI generator using this template [here](https://www.asyncapi.com/docs/tutorials/streetlights). 
### CLI

```bash
# Install the AsyncAPI Generator
npm install -g @asyncapi/generator

# Run generation
ag https://bit.ly/asyncapi @asyncapi/nodejs-template -o output -p server=production

##
## Start the server 
##

# Go to the generated server
cd output

# Build generated application
npm i

# Start server
npm start

##
## Start the client 
##

#for testing your server you can use mqtt client. open a new terminal and install it using:
npm install mqtt -g

#publish your message.
mqtt pub -t 'smartylighting/streetlights/1/0/event/{streetlightId}/lighting/measured' -h 'test.mosquitto.org' -m '{"id": 1, "lumens": 3, "sentAt": "2017-06-07T12:34:32.000Z"}'

# You should see the sent message in the logs of the previously started server.
```



## Template configuration

You can configure this template by passing different parameters in the Generator CLI: `-p PARAM1_NAME=PARAM1_VALUE -p PARAM2_NAME=PARAM2_VALUE`

|Name|Description|Required|Example|
|---|---|---|---|
|server|The server you want to use in the code.|Yes|`production`|

## Custom hooks that you can disable

The functionality of this template is extended with different hooks that you can disable like this in the Generator CLI: `-d HOOK_TYPE=HOOK_NAME`

* AMQP
* MQTT
* Kafka
* WebSockets
