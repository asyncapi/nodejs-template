/* eslint-disable indent */
import { File } from '@asyncapi/generator-react-sdk';
import { camelCase, convertToFilename, toHermesTopic } from '../../../../helpers/index';

function receiveHandler(operation, channelName, channelAddress, isSpecV3) {
  if (!operation.isReceive()) {
    return '';
  }

  const operationId = operation.id();
  const message = operation.messages().all()[0];
  const messageValidationLogic = (operation.messages().length > 1) ? `
  /*
  * TODO: If https://github.com/asyncapi/parser-js/issues/372 is addressed, simplify this
  * code to just validate the message against the combined message schema which will
  * include the \`oneOf\` in the JSON schema - let the JSON schema validator handle the
  * oneOf semantics (rather than each generator having to emit conditional code)
  */
  let nValidated = 0;
  // For oneOf, only one message schema should match.
  // Validate payload against each message and count those which validate

  ${
    operation.messages().all().map(message => `try {
      nValidated = await validateMessage(message.payload,'${ channelAddress }','${ message.name() }','publish', nValidated);
    } catch { };`).join('\n')
  }

  if (nValidated === 1) {
    await ${camelCase(channelName)}Handler._${operationId}({message});
    next()
  } else {
    throw new Error(\`\${nValidated} of ${ operation.messages().length } message schemas matched when exactly 1 should match\`);
  }` : `await validateMessage(message.payload,'${ channelAddress }','${ message.name() }','publish');`;

  return `
  ${operation.hasSummary()  ? `
  /**
   * ${ operation.summary() }
   */
  `: ''}
  router.use('${toHermesTopic(channelAddress)}', async (message, next) => {
    try {
      ${isSpecV3 ? '' : messageValidationLogic}
      await ${camelCase(channelName)}Handler._${ operationId }({message});
      next();
    } catch (e) {
      next(e);
    }
  });
  `;
}

function sendHandler(operation, channelName, channelAddress, isSpecV3) {
  if (!operation.isSend()) {
    return '';
  }

  const operationId = operation.id();
  const message = operation.messages().all()[0];
  const messageValidationLogic = (operation.messages().length > 1) ? `
  let nValidated = 0;
  // For oneOf, only one message schema should match.
  // Validate payload against each message and count those which validate

  ${
    operation.messages().all().map(message => `try {
      nValidated = await validateMessage(message.payload,'${ channelAddress }','${ message.name() }','subscribe', nValidated);
    } catch { };`).join('\n')
  }

  if (nValidated === 1) {
    await ${camelCase(channelName)}Handler._${operationId}({message});
    next()
  } else {
    throw new Error(\`\${nValidated} of ${ operation.messages().length } message schemas matched when exactly 1 should match\`);
  }` : `await validateMessage(message.payload,'${ channelAddress }','${ message.name() }','subscribe');`;
  
  return `
  ${operation.hasSummary()  ? `
  /**
   * ${ operation.summary() }
   */
  `: ''}
  router.useOutbound('${toHermesTopic(channelAddress)}', async (message, next) => {
    try {
      ${isSpecV3 ? '' : messageValidationLogic}
      await ${camelCase(channelName)}Handler._${ operationId }({message});
      next();
    } catch (e) {
      next(e);
    }
  });
  `;
}

function routeCode(channel, isSpecV3) {
  const channelName = channel.id();
  const generalImport = `
  const Router = require('hermesjs/lib/router');
  ${isSpecV3 ? '': 'const { validateMessage } = require(\'../../lib/message-validator\');'}
  const router = new Router();
  const ${ camelCase(channelName) }Handler = require('../handlers/${convertToFilename(channelName)}');
  module.exports = router;
  `;
  
  let routeHandler = `
    ${generalImport}
  `;

  for (const operation of channel.operations()) {
    if (operation.isSend()) {
      routeHandler += sendHandler(operation, channel.id(), channel.address(), isSpecV3);
    }
    if (operation.isReceive()) {
      routeHandler += receiveHandler(operation, channel.id(), channel.address(), isSpecV3);
    }
  }

  return <File name={`${convertToFilename(channelName)}.js`}>{routeHandler}</File>;
}

export default function routeRender({asyncapi}) {
  const majorSpecVersion = parseInt(asyncapi.version().split('.')[0], 10);
  const isSpecV3 = (majorSpecVersion === 3);
  return asyncapi.channels().all().map(channel => {
    return routeCode(channel, isSpecV3);
  });
}