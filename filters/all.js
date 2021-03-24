const filter = module.exports;
const { URL } = require('url');
const filenamify = require('filenamify');
const _ = require('lodash');

function queueName(title, version) {
  return _.kebabCase(`${title}-${version}`.toLowerCase()).split('-').join('.');
}
filter.queueName = queueName;

function toMqttTopic(topics, appendWildcard = false) {
  const toMqtt = (str, appendWildcard = false) => {
    let result = str;
    if (result === '/') return '#';
    if (result.startsWith('/')) result = result.substr(1);
    result = result.replace(/\{([^}]+)\}/g, '+');
    if (appendWildcard) result += '/#';
    return result;
  }

  if (typeof topics === 'string') return toMqtt(topics, appendWildcard);
  if (Array.isArray(topics)) return topics.map(toMqtt);
}
filter.toMqttTopic = toMqttTopic;

function toKafkaTopic(topics) {
  const toKafka = (str) => {
    let result = str;
    if (result.startsWith('/')) result = result.substr(1);
    result = result.replace(/\//g, '__');
    return result;
  }

  if (typeof topics === 'string') return toKafka(topics);
  if (Array.isArray(topics)) return topics.map(toKafka);
}
filter.toKafkaTopic = toKafkaTopic;

function toAmqpTopic(topics, appendWildcard = false) {
  const toAmqp = (str, appendWildcard = false) => {
    let result = str;
    if (result === '/') return '#';
    if (result.startsWith('/')) result = result.substr(1);
    result = result.replace(/\//g, '.').replace(/\{([^}]+)\}/g, '*');
    if (appendWildcard) result += '.#';
    return result;
  }

  if (typeof topics === 'string') return toAmqp(topics, appendWildcard);
  if (Array.isArray(topics)) return topics.map(toAmqp);
}
filter.toAmqpTopic = toAmqpTopic;

function toHermesTopic(str) {
  return str.replace(/\{([^}]+)\}/g, ':$1');
}
filter.toHermesTopic = toHermesTopic;

function commonChannel(asyncapi, removeTrailingParameters = false) {
  const channelNames = asyncapi.channelNames().sort().map(ch => ch.split('/'));
  if (!channelNames.length) return '';
  if (channelNames.length === 1) return asyncapi.channelNames()[0];

  let result = [];
  for (let i = 0; i < channelNames.length - 1; i++) {
    let ch1;
    if (i === 0) {
      ch1 = channelNames[0];
    } else {
      ch1 = result.concat(); // Makes a copy
      result = [];
    }
    const ch2 = channelNames[i + 1];
    let x = 0;
    let shouldContinue = true;
    while (shouldContinue) {
      if (x > Math.max(ch1.length, ch2.length) - 1 || ch1[x] !== ch2[x]) {
        shouldContinue = false;
      } else {
        result.push(ch1[x]);
        x++;
      }
    }
  }

  if (removeTrailingParameters) {
    for (let index = result.length - 1; index >= 0; index--) {
      const chunk = result[index];
      if (chunk.match(/^\{.+\}$/)) {
        result.pop();
      }
    }
  }

  return result.join('/');
}
filter.commonChannel = commonChannel;

function channelNamesWithPublish(asyncapi) {
  const result = [];
  asyncapi.channelNames().forEach(name => {
    if (asyncapi.channel(name).hasPublish()) result.push(name);
  });
  return result;
}
filter.channelNamesWithPublish = channelNamesWithPublish;

function host(url) {
  const u = new URL(url);
  return u.host;
}
filter.host = host;

function port(url, defaultPort) {
  const u = new URL(url);
  return u.port || defaultPort;
}
filter.port = port;

function stripProtocol(url) {
  if(!url.includes('://')){
    return url;
  }
  const u = new URL(url);
  return url.substr(u.protocol.length + 2);
}
filter.stripProtocol = stripProtocol;

function trimLastChar(string) {
  return string.substr(0, string.length - 1);
}
filter.trimLastChar = trimLastChar;

function toJS(objFromJSON, indent = 2) {
  if (typeof objFromJSON !== "object" || Array.isArray(objFromJSON)) {
    // not an object, stringify using native function
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
  }

  // Implements recursive object serialization according to JSON spec
  // but without quotes around the keys.
  let props = Object
    .keys(objFromJSON)
    .map(key => `${' '.repeat(indent)}${maybeQuote(key)}: ${toJS(objFromJSON[key])}`)
    .join(",\n");
  return `{\n${props}\n}`;
}
filter.toJS = toJS;

function convertToFilename(string, options) {
  return filenamify(string, options || { replacement: '-', maxLength: 255 });
}
filter.convertToFilename = convertToFilename;

/**
 * Replaces variables in the server url with its declared values. Default or first enum in case of default is not declared
 * Replace is performed only if there are variables in the URL and they are declared for a server
 * @private
 * @param {String} url The server url value.
 * @param {Object} serverVariables object containing server variables.
 * @return {String}
 */
function replaceVariablesWithValues(url, serverVariables) {
  const getVariablesNamesFromUrl = (url) => {
    let result = [],
      array;
    const regEx = /{([^}]+)}/g;

    while ((array = regEx.exec(url)) !== null) {
      result.push([array[0], array[1]]);
    }

    return result;
  }

  const getVariableValue = (object, variable) => {
    const keyValue = object[variable]._json;

    if (keyValue) return keyValue.default || (keyValue.enum && keyValue.enum[0]);
  }

  const urlVariables = getVariablesNamesFromUrl(url);
  const declaredVariables =
    urlVariables.filter(el => serverVariables.hasOwnProperty(el[1]))

  if (urlVariables.length !== 0 && declaredVariables.length !== 0) {
    let value;
    let newUrl = url;

    urlVariables.forEach(el => {
      value = getVariableValue(serverVariables, el[1]);

      if (value) {
        newUrl = newUrl.replace(el[0], value);
      }
    });
    return newUrl;
  }
  return url;
}
filter.replaceVariablesWithValues = replaceVariablesWithValues;
