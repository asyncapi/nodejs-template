import { URL } from 'url';
import filenamify from 'filenamify';
import _ from 'lodash';

export function queueName(title, version) {
  return _.kebabCase(`${title}-${version}`.toLowerCase()).split('-').join('.');
}

export function toMqttTopic(topics, shouldAppendWildcard = false) {
  const toMqtt = (str, appendWildcard = false) => {
    let result = str;
    if (result === '/') return '#';
    if (result.startsWith('/')) result = result.substr(1);
    result = result.replace(/\{([^}]+)\}/g, '+');
    if (appendWildcard) result += '/#';
    return result;
  };

  if (typeof topics === 'string') return toMqtt(topics, shouldAppendWildcard);
  if (Array.isArray(topics)) return topics.map(toMqtt);
}

export function toKafkaTopic(topics) {
  const toKafka = (str) => {
    let result = str;
    if (result.startsWith('/')) result = result.substr(1);
    result = result.replace(/\//g, '__');
    return result;
  };

  if (typeof topics === 'string') return toKafka(topics);
  if (Array.isArray(topics)) return topics.map(toKafka);
}

export function toAmqpTopic(topics, shouldAppendWildcard = false) {
  const toAmqp = (str, appendWildcard = false) => {
    let result = str;
    if (result === '/') return '#';
    if (result.startsWith('/')) result = result.substr(1);
    result = result.replace(/\//g, '.').replace(/\{([^}]+)\}/g, '*');
    if (appendWildcard) result += '.#';
    return result;
  };

  if (typeof topics === 'string') return toAmqp(topics, shouldAppendWildcard);
  if (Array.isArray(topics)) return topics.map(toAmqp);
}

export function toHermesTopic(str) {
  return str.replace(/\{([^}]+)\}/g, ':$1');
}

export function channelNamesWithReceive(asyncapi) {
  const result = asyncapi.channels().filterByReceive().map(channel => channel.id());
  return result;
}

export function host(url) {
  const u = new URL(url);
  return u.host;
}

export function port(url, defaultPort) {
  const u = new URL(url);
  return u.port || defaultPort;
}

export function stripProtocol(url) {
  console.log(url);
  if (!url.includes('://')) {
    return url;
  }
  const u = new URL(url);
  return url.substr(u.protocol.length + 2);
}

export function trimLastChar(string) {
  return string.substr(0, string.length - 1);
}

export function convertOpertionIdToMiddlewareFn(operationId) {
  const capitalizedOperationId =
    operationId.charAt(0).toUpperCase() + operationId.slice(1);
  return `register${capitalizedOperationId}Middleware`;
}

export function toJS(objFromJSON, indent = 2) {
  if (typeof objFromJSON !== 'object' || Array.isArray(objFromJSON)) {
    // not an object, stringify using native export function
    if (typeof objFromJSON === 'string') {
      const templateVars = objFromJSON.match(/\$\{[\w\d\.]+\}/g);
      if (templateVars) return `\`${objFromJSON}\``;
      return `'${objFromJSON}'`;
    }
    return JSON.stringify(objFromJSON);
  }

  const maybeQuote = (str) => {
    if (str.match(/^[\w\d\_\$]+$/g)) return str;
    return `'${str}'`;
  };

  // Implements recursive object serialization according to JSON spec
  // but without quotes around the keys.
  const props = Object.keys(objFromJSON)
    .map(
      (key) =>
        `${' '.repeat(indent)}${maybeQuote(key)}: ${toJS(objFromJSON[key])}`
    )
    .join(',\n');
  return `{\n${props}\n}`;
}

export function convertToFilename(string, options) {
  return filenamify(string, options || { replacement: '-', maxLength: 255 });
}

/**
 * Replaces variables in the server url with its declared values. Default or first enum in case of default is not declared
 * Replace is performed only if there are variables in the URL and they are declared for a server
 * @private
 * @param {String} serverUrl The server url value.
 * @param {Object} serverVariables object containing server variables.
 * @return {String}
 */

export function getConfig(p) {
  let protocol = p;
  let configName = 'broker';

  if (p === 'ws') {
    configName = 'ws';
    return `config.${configName}`;
  }

  if (p === 'kafka-secure') protocol = 'kafka';

  return `config.${configName}.${protocol}`;
}

export function getProtocol(p) {
  let protocol = p;

  if (p === 'kafka-secure') protocol = 'kafka';

  return protocol;
}

// https://mozilla.github.io/nunjucks/templating.html#dump
export function dump(obj) {
  return JSON.stringify(obj);
}
