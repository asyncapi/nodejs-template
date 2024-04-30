/* eslint-disable indent */
import { docline } from '@asyncapi/generator-filters/src/customFilters';
import {
  convertOpertionIdToMiddlewareFn,
  convertToFilename,
} from '../../../../helpers/index';
import { File } from '@asyncapi/generator-react-sdk';

const OPTIONS_MESSAGE_HEADERS_STRING = 'options.message.headers';

function receiveHandler(operation) {
  if (!operation.isReceive()) {
    return '';
  }

  const operationId = operation.id();
  const message = operation.messages().all()[0];
  const lambdaChannel = operation.extensions().get('x-lambda');

  const exportedHandler = `
  /**
   * Registers a middleware function for the ${operationId} operation to be executed during request processing.
   *
   * Middleware functions have access to options object that you can use to access the message content and other helper functions
   *
   * @param {function} middlewareFn - The middleware function to be registered.
   * @throws {TypeError} If middlewareFn is not a function.
   */
  handler.${convertOpertionIdToMiddlewareFn(operationId)} = (middlewareFn) => {
    if (typeof middlewareFn !== 'function') {
      throw new TypeError('middlewareFn must be a function');
    }
    ${operationId}Middlewares.push(middlewareFn);
  }
  `;

  const privateHandlerLogic = `
  /**
   * ${operation.hasSummary() ? operation.summary() : ''}
   *
   * @param {object} options
   * @param {object} options.message
  ${
  message.headers()
    ? Object.entries(message.headers().properties())
        .map(([fieldName, field]) => {
          return docline(field, fieldName, OPTIONS_MESSAGE_HEADERS_STRING);
        })
        .join('\n')
    : ''
  }
  *
  ${
    message.payload()
      ? Object.entries(message.payload().properties())
          .map(([fieldName, field]) => {
            return docline(field, fieldName, OPTIONS_MESSAGE_HEADERS_STRING);
          })
          .join('\n')
      : ''
  }
  */
  handler._${operationId} = async ({message}) => {
    ${
      lambdaChannel
        ? `
    fetch('${lambdaChannel.url}}', {
      method: "${lambdaChannel.method || 'POST'}",
      body: JSON.stringify(${lambdaChannel.body}),
      ${lambdaChannel.headers ? `headers: ${lambdaChannel.headers}` : ''}
    })
      .then(res => res.json())
      .then(json => console.log(json))
      .catch(err => { throw err; });`
        : `for (const middleware of ${operationId}Middlewares) {
      await middleware(message);
    }`
    }
  };
  `;

  return `
  ${lambdaChannel ? 'const fetch = require("node-fetch");' : ''}
  
  const ${operationId}Middlewares = [];

  ${exportedHandler}

  ${privateHandlerLogic}
  `;
}

function sendHandler(operation) {
  if (!operation.isSend()) {
    return '';
  }

  const operationId = operation.id();
  const message = operation.messages().all()[0];

  const exportedHandler = `
  /**
   * Registers a middleware function for the ${operationId} operation to be executed during request processing.
   *
   * Middleware functions have access to options object that you can use to access the message content and other helper functions
   *
   * @param {function} middlewareFn - The middleware function to be registered.
   * @throws {TypeError} If middlewareFn is not a function.
   */
  handler.${convertOpertionIdToMiddlewareFn(operationId)} = (middlewareFn) => {
    if (typeof middlewareFn !== 'function') {
      throw new TypeError('middlewareFn must be a function');
    }
    ${operationId}Middlewares.push(middlewareFn);
  }
  `;

  const privateHandlerLogic = `
  /**
   * ${operation.hasSummary() ? operation.summary() : ''}
   *
   * @param {object} options
   * @param {object} options.message
  ${
    message.headers()
      ? Object.entries(message.headers().properties())
          .map(([fieldName, field]) => {
            return docline(field, fieldName, OPTIONS_MESSAGE_HEADERS_STRING);
          })
          .join('\n')
      : ''
  }
  *
  ${
    message.payload()
      ? Object.entries(message.payload().properties())
          .map(([fieldName, field]) => {
            return docline(field, fieldName, OPTIONS_MESSAGE_HEADERS_STRING);
          })
          .join('\n')
      : ''
  }
  */
  handler._${operationId} = async ({message}) => {
    for (const middleware of ${operationId}Middlewares) {
      await middleware(message);
    }
  };
  `;

  return `
  const ${operationId}Middlewares = [];

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
  
  return asyncapi.channels().all().map(channel => {
    const channelName = channel.id();
    
    let routeHandler = `
      ${general}
    `;
    
    for (const operation of channel.operations()) {
      if (operation.isSend()) {
        routeHandler += sendHandler(operation);
      }
      if (operation.isReceive()) {
        routeHandler += receiveHandler(operation);
      }
    }
    return <File name={`${convertToFilename(channelName)}.js`}>{routeHandler}</File>;
  });
}
