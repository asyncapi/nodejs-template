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
- [Technical requirements](#technical-requirements)
- [Specification requirements](#specification-requirements)
- [Supported protocols](#supported-protocols)
- [How to use the template](#how-to-use-the-template)
  * [CLI](#cli)
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
* [MQTT](https://en.wikipedia.org/wiki/MQTT)
* [Kafka](https://en.wikipedia.org/wiki/Apache_Kafka)
* [WebSocket](https://en.wikipedia.org/wiki/WebSocket)



## How to use the template

This template must be used with the AsyncAPI Generator. You can find all available options [here](https://github.com/asyncapi/generator/).

> You can find a complete tutorial on AsyncAPI Generator using this template [here](https://www.asyncapi.com/docs/tutorials/streetlights). 
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

#publish an invalid message.
mqtt pub -t 'smartylighting/streetlights/1/0/event/123/lighting/measured' -h 'test.mosquitto.org' -m '{"id": 1, "lumens": "3", "sentAt": "2017-06-07T12:34:32.000Z"}'

#publish a valid message
mqtt pub -t 'smartylighting/streetlights/1/0/event/123/lighting/measured' -h 'test.mosquitto.org' -m '{"id": 1, "lumens": 3, "sentAt": "2017-06-07T12:34:32.000Z"}'

#You should see the sent message in the logs of the previously started server.
#Notice that the server automatically validates incoming messages and logs out validation errors
```



## Template configuration

You can configure this template by passing different parameters in the Generator CLI: `-p PARAM1_NAME=PARAM1_VALUE -p PARAM2_NAME=PARAM2_VALUE`

|Name|Description|Required|Example|
|---|---|---|---|
|server|The server you want to use in the code.|Yes|`production`|


## Development

The most straightforward command to use this template is:
```bash
ag https://bit.ly/asyncapi @asyncapi/nodejs-template -o output -p server=production
```

For local development, you need different variations of this command. First of all, you need to know about three important CLI flags:
- `--debug` enables the debug mode in Nunjucks engine what makes filters debugging simpler.
- `--watch-template` enables a watcher of changes that you make in the template. It regenerates your template whenever it detects a change.
- `--install` enforces reinstallation of the template.


There are two ways you can work on template development:
- Use global Generator and template from your local sources:
  ```bash
  # assumption is that you run this command from the root of your template
  ag https://bit.ly/asyncapi ./ -o output
  ```
- Use Generator from sources and template also from local sources. This approach enables more debugging options with awesome `console.log` in the Generator sources or even the Parser located in `node_modules` of the Generator:
  ```bash
  # assumption is that you run this command from the root of your template
  # assumption is that generator sources are cloned on the same level as the template
  ../generator/cli.js https://bit.ly/asyncapi ./ -o output
  ```


## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://www.fmvilas.com/"><img src="https://avatars.githubusercontent.com/u/242119?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Fran Méndez</b></sub></a><br /><a href="https://github.com/asyncapi/nodejs-template/commits?author=fmvilas" title="Code">💻</a> <a href="#ideas-fmvilas" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://dev.to/derberg"><img src="https://avatars.githubusercontent.com/u/6995927?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Lukasz Gornicki</b></sub></a><br /><a href="#infra-derberg" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/asyncapi/nodejs-template/commits?author=derberg" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/KhudaDad414"><img src="https://avatars.githubusercontent.com/u/32505158?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Khuda Dad Nomani</b></sub></a><br /><a href="https://github.com/asyncapi/nodejs-template/commits?author=KhudaDad414" title="Documentation">📖</a> <a href="https://github.com/asyncapi/nodejs-template/commits?author=KhudaDad414" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
