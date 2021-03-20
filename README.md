<h5 align="center">
  <br>
  <a href="https://www.asyncapi.org"><img src="https://github.com/asyncapi/parser-nodejs/raw/master/assets/logo.png" alt="AsyncAPI logo" width="200"></a>
  <br>
  AsyncAPI Node.js Template
</h5>

![npm](https://img.shields.io/npm/v/@asyncapi/nodejs-template?style=for-the-badge) ![npm](https://img.shields.io/npm/dt/@asyncapi/nodejs-template?style=for-the-badge)

- [Overview](#overview)
- [Supported protocols](#supported-protocols)
- [How to use the template](#how-to-use-the-template)
    * [CLI](#cli)
- [Specification requirements](#specification-requirements)
- [Template configuration](#template-configuration)
- [Custom hooks that you can disable](#custom-hooks-that-you-can-disable)


## Overview

This template generates a Node.js application with any of the [supported protocols](#supported-protocols) endpoint, based on [Hermesjs](https://github.com/hitchhq/hermes).

Other files are for the setup of developer environment, like `.editorconfig` or `.eslint`.

## Supported protocols

* [AMQP](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)
* [MQTT](https://en.wikipedia.org/wiki/MQTT)
* [Kafka](https://en.wikipedia.org/wiki/Apache_Kafka)
* [WebSocket](https://en.wikipedia.org/wiki/WebSocket)



## How to use the template

This template must be used with the AsyncAPI Generator. You can find all available options [here](https://github.com/asyncapi/generator/).

### CLI

```bash
# Install the AsyncAPI Generator
npm install -g @asyncapi/generator

# copy your asyncapi.yaml file to the current directory or create a new file.

# Run generation
ag asyncapi.yaml @asyncapi/nodejs-template -o output -p server=production
##
## Start the server 
##

# Go to the generated server
cd output

# Build generated application
npm i

# Start server
npm start
```

## Specification requirements

Property name | Reason | Fallback | Default
---|---|---|---
`operationId` | Operation ID must be set for every operation to generate proper functions as there is no fallback in place | - | -


## Template configuration

You can configure this template by passing different parameters in the Generator CLI: `-p PARAM1_NAME=PARAM1_VALUE -p PARAM2_NAME=PARAM2_VALUE`

|Name|Description|Required|Example|
|---|---|---|---|
|server|The server you want to use in the code.|Yes|`production`|

## Custom hooks that you can disable

The functionality of this template is extended with different hooks that you can disable like this in the Generator CLI: `-d HOOK_TYPE1=HOOK_NAME1,HOOK_NAME2 -d HOOK_TYPE2`

Type | Name | Description
---|---|---
generate:after | createAsyncapiFile | It creates AsyncAPI file with content of the spec file passed to the generator


