import { File } from '@asyncapi/generator-react-sdk';
import { camelCase, channelNamesWithPublish, dump, host, port, queueName, stripProtocol, toAmqpTopic, toKafkaTopic, toMqttTopic } from '../../helpers/index';
import { replaceServerVariablesWithValues } from '@asyncapi/generator-filters/src/customFilters';

export default function CommonConfigYAMLRender({ asyncapi, params }) {
  const serverProtocol = asyncapi.server(params.server).protocol();
  const serverVariables = asyncapi.server(params.server).variables();
  const resolvedBrokerUrlWithReplacedVariables = replaceServerVariablesWithValues(asyncapi.server(params.server).url(), serverVariables);

  return (
    <File name={'common.yml'}>
      {`default:
  app:
    name: ${asyncapi.info().title()}
    version: ${asyncapi.info().version()}
${serverProtocol === 'ws' ? wsBlock(resolvedBrokerUrlWithReplacedVariables) : ''}
${serverProtocol !== 'ws' ? `  broker:
` : ''}
${serverProtocol === 'amqp' ? amqpBlock(resolvedBrokerUrlWithReplacedVariables, asyncapi) : ''}
${serverProtocol === 'mqtt' || serverProtocol === 'mqtts' ? mqttBlock(resolvedBrokerUrlWithReplacedVariables, asyncapi, params) : ''}
${serverProtocol === 'kafka' || serverProtocol === 'kafka-secure' ? kafkaBlock(resolvedBrokerUrlWithReplacedVariables, asyncapi) : ''}
development:

test:

staging:

production:
${serverProtocol === 'kafka' || serverProtocol === 'kafka-secure' ? kafkaProductionBlock(params, asyncapi) : ''}
`}
    </File>
  );
}

function wsBlock(url) {
  return `  ws:
  port: ${port(url, 80)}
  path: /ws
  topicSeparator: '__'
`;
}

function amqpBlock(url, asyncapi) {
  return `    amqp:
      exchange:
      username:
      password:
      host: ${host(url)}
      port:
      topics: ${dump(toAmqpTopic(channelNamesWithPublish(asyncapi)))}
      queue: ${queueName(asyncapi.info().title(), asyncapi.info().version())}
      queueOptions:
        exclusive: false
        durable: true
        autoDelete: true
`;
}

function mqttBlock(url, asyncapi, params) {
  return `    mqtt:
      url: ${asyncapi.server(params.server).protocol()}://${stripProtocol(url)}
      topics: ${dump(toMqttTopic(channelNamesWithPublish(asyncapi)))}
      qos:
      protocol: mqtt
      retain:
      subscribe: true
`;
}

function kafkaBlock(url, asyncapi) {
  return `    kafka:
      clientId: ${camelCase(asyncapi.info().title())}
      brokers:
        - ${stripProtocol(url)}
      consumerOptions:
        groupId: ${camelCase(asyncapi.info().title())}
      topics:
      ${channelNamesWithPublish(asyncapi).map(topic => `- ${toKafkaTopic(topic)}`).join('\n')}
      topicSeparator: '__'
      topicPrefix:
`;
}

function kafkaProductionBlock(params, asyncapi) {
  let productionBlock = `  broker:
    kafka:
      ssl:
        rejectUnauthorized: true
`;
  if (params.securityScheme && asyncapi.components().securityScheme(params.securityScheme).type() !== 'X509') {
    productionBlock += `      sasl:
        mechanism: 'plain'
        username:
        password:
`;
  }
  return productionBlock;
}
