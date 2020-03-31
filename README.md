# Node.js template for the AsyncAPI Generator

## Usage

```
ag asyncapi.yaml @asyncapi/nodejs-template -o output -p server=production
```

If you don't have the AsyncAPI Generator installed, you can install it like this:

```
npm install -g @asyncapi/generator
```

## Supported parameters

|Name|Description|Required|Example|
|---|---|---|---|
|server|The server you want to use in the code.|Yes|`production`|

## Supported protocols

* AMQP
* MQTT
* Kafka
* WebSockets
