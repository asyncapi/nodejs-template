import { File } from "@asyncapi/generator-react-sdk";
import { camelCase, convertToFilename, toHermesTopic } from "../../../../utils/index";

function publishHandler(channel, channelName) {
  if (!channel.hasPublish()) {
    return "";
  }

  const lambdaChannel = channel.publish().ext('x-lambda');
  const publishOperationId = channel.publish().id();
  const publishMessage = channel.publish().message(0);

  return `
  ${channel.publish().summary()  ? `
  /**
   * ${ channel.publish().summary() }
   */
  `: ""}
  router.use('${toHermesTopic(channelName)}', async (message, next) => {
    try {
      ${channel.publish().hasMultipleMessages() 
        ? `
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
        Array.from(Array(channel.publish().messages().length).keys()).map(i => `try {
          nValidated = await validateMessage(message.payload,'${ channelName }','${ channel.publish().message(i).name() }','publish', nValidated);
        } catch { };`).join('\n')
      }

      if (nValidated === 1) {
        await ${camelCase(channelName)}Handler._${publishOperationId}({message});
        next()
      } else {
        throw new Error(\`\${nValidated} of ${ channel.publish().messages().length } message schemas matched when exactly 1 should match\`);
      }
        `
        : `
      await validateMessage(message.payload,'${ channelName }','${ publishMessage.name() }','publish');
      await ${camelCase(channelName)}Handler._${ publishOperationId }({message});
      next();
        `
      }
    } catch (e) {
      next(e);
    }
  });
  `
}

function subscribeHandler(channel, channelName) {
  if (!channel.hasSubscribe()) {
    return "";
  }

  const subscribeOperationId = channel.subscribe().id();
  const subscribeMessage = channel.subscribe().message(0);
  
  return `
  ${channel.subscribe().summary()  ? `
  /**
   * ${ channel.subscribe().summary() }
   */
  `: ""}
  router.use('${toHermesTopic(channelName)}', async (message, next) => {
    try {
      ${channel.subscribe().hasMultipleMessages() 
        ? `
      let nValidated = 0;
      // For oneOf, only one message schema should match.
      // Validate payload against each message and count those which validate

      ${
        Array.from(Array(channel.subscribe().messages().length).keys()).map(i => `try {
          nValidated = await validateMessage(message.payload,'${ channelName }','${ channel.subscribe().message(i).name() }','subscribe', nValidated);
        } catch { };`).join('\n')
      }

      if (nValidated === 1) {
        await ${camelCase(channelName)}Handler._${subscribeOperationId}({message});
        next()
      } else {
        throw new Error(\`\${nValidated} of ${ channel.subscribe().messages().length } message schemas matched when exactly 1 should match\`);
      }
        `
        : `
      await validateMessage(message.payload,'${ channelName }','${ subscribeMessage.name() }','subscribe');
      await ${camelCase(channelName)}Handler._${ subscribeOperationId }({message});
      next();
        `
      }
    } catch (e) {
      next(e);
    }
  });
  `;
}

export default function routeRender({channel, channelName, params}) {
  let hasPublish = channel.publish();
  let hasSubscribe = channel.hasSubscribe();
  
  const generalImport = `
  const Router = require('hermesjs/lib/router');
  const { validateMessage } = require('../../lib/message-validator');
  const router = new Router();
  const ${ camelCase(channelName) }Handler = require('../handlers/${convertToFilename(channelName)}');
  module.exports = router;
  `;
  
  return <File>
    {`
    ${generalImport}
    ${hasPublish ? publishHandler(channel, channelName): ""}
    ${hasSubscribe ? subscribeHandler(channel, channelName): ""}
    `}
  </File>;
}