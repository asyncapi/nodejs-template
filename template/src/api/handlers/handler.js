import { docline } from "@asyncapi/generator-filters/src/customFilters";
import {
  convertOpertionIdToMiddlewareFn,
  convertToFilename,
} from "../../../../helpers/index";
import { File } from "@asyncapi/generator-react-sdk";

function publishHandler(channel) {
  if (!channel.hasPublish()) {
    return "";
  }

  const lambdaChannel = channel.publish().ext("x-lambda");
  const publishOperationId = channel.publish().id();
  const publishMessage = channel.publish().message(0);

  const exportedHandler = `
  /**
   * Registers a middleware function for the ${publishOperationId} operation to be executed during request processing.
   *
   * Middleware functions have access to options object that you can use to access the message content and other helper functions
   *
   * @param {function} middlewareFn - The middleware function to be registered.
   * @throws {TypeError} If middlewareFn is not a function.
   */
  handler.${convertOpertionIdToMiddlewareFn(
    channel.publish().id()
  )} = (middlewareFn) => {
    if (typeof middlewareFn !== 'function') {
      throw new TypeError('middlewareFn must be a function');
    }
    ${publishOperationId}Middlewares.push(middlewareFn);
  }
  `;

  const privateHandlerLogic = `
  /**
   * ${channel.publish().summary() || ""}
   *
   * @param {object} options
   * @param {object} options.message
  ${
    publishMessage.headers()
      ? Object.entries(publishMessage.headers().properties())
          .map(([fieldName, field]) => {
            return docline(field, fieldName, "options.message.headers");
          })
          .join("\n")
      : ""
  }
  *
  ${
    publishMessage.payload()
      ? Object.entries(publishMessage.payload().properties())
          .map(([fieldName, field]) => {
            return docline(field, fieldName, "options.message.headers");
          })
          .join("\n")
      : ""
  }
  */
  handler._${publishOperationId} = async ({message}) => {
    ${
      lambdaChannel
        ? `
    fetch('${lambdaChannel.url}}', {
      method: '${lambdaChannel.method || "POST"}',
      body: JSON.stringify(${lambda.body}),
      ${lambda.headers ? `headers: ${lambda.headers}` : ""}
    })
      .then(res => res.json())
      .then(json => console.log(json))
      .catch(err => { throw err; });`
        : `for (const middleware of ${publishOperationId}Middlewares) {
      await middleware(message);
    }`
    }
  };
  `;

  return `
  ${lambdaChannel ? "const fetch = require('node-fetch');" : ""}
  
  const ${publishOperationId}Middlewares = [];

  ${exportedHandler}

  ${privateHandlerLogic}
  `;
}

function subscribeHandler(channel) {
  if (!channel.hasSubscribe()) {
    return "";
  }

  const subscribeOperationId = channel.subscribe().id();
  const subscribeMessage = channel.subscribe().message(0);

  const exportedHandler = `
  /**
   * Registers a middleware function for the ${subscribeOperationId} operation to be executed during request processing.
   *
   * Middleware functions have access to options object that you can use to access the message content and other helper functions
   *
   * @param {function} middlewareFn - The middleware function to be registered.
   * @throws {TypeError} If middlewareFn is not a function.
   */
  handler.${convertOpertionIdToMiddlewareFn(
    channel.subscribe().id()
  )} = (middlewareFn) => {
    if (typeof middlewareFn !== 'function') {
      throw new TypeError('middlewareFn must be a function');
    }
    ${subscribeOperationId}Middlewares.push(middlewareFn);
  }
  `;

  const privateHandlerLogic = `
  /**
   * ${channel.subscribe().summary() || ""}
   *
   * @param {object} options
   * @param {object} options.message
  ${
    subscribeMessage.headers()
      ? Object.entries(subscribeMessage.headers().properties())
          .map(([fieldName, field]) => {
            return docline(field, fieldName, "options.message.headers");
          })
          .join("\n")
      : ""
  }
  *
  ${
    subscribeMessage.payload()
      ? Object.entries(subscribeMessage.payload().properties())
          .map(([fieldName, field]) => {
            return docline(field, fieldName, "options.message.headers");
          })
          .join("\n")
      : ""
  }
  */
  handler._${subscribeOperationId} = async ({message}) => {
    for (const middleware of ${subscribeOperationId}Middlewares) {
      await middleware(message);
    }
  };
  `;

  return `
  const ${subscribeOperationId}Middlewares = [];

  ${exportedHandler}
  
  ${privateHandlerLogic}
  `;
}

export default function handlerRender({
  asyncapi,
}) {
  const general = `
  const handler = module.exports = {};
  `;

  const channels = asyncapi.channels();
  
  return Object.entries(channels).map(([channelName, channel]) => {
    let hasPublish = channel.publish();
    let hasSubscribe = channel.hasSubscribe();

    return (
      <File name={`${convertToFilename(channelName)}.js`}>
        {`
        ${general}
        ${hasPublish ? publishHandler(channel) : ""}
        ${hasSubscribe ? subscribeHandler(channel) : ""}
        `}
      </File>
    );
  });
}
