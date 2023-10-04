
const handler = module.exports = {};


const turnOffMiddlewares = [];

/**
 * Registers a middleware function for the turnOff operation to be executed during request processing.
 *
 * Middleware functions have access to options object that you can use to access the message content and other helper functions
 *
 * @param {function} middlewareFn - The middleware function to be registered.
 * @throws {TypeError} If middlewareFn is not a function.
 */
handler.registerTurnOffMiddleware = (middlewareFn) => {
  if (typeof middlewareFn !== 'function') {
    throw new TypeError('middlewareFn must be a function');
  }
  turnOffMiddlewares.push(middlewareFn);
}

/**
 * 
 *
 * @param {object} options
 * @param {object} options.message
  * @param {integer} options.message.headers.my-app-header
  * @param {string} options.message.payload.command - Whether to turn on or off the light.
  * @param {string} options.message.payload.sentAt - Date and time when the message was sent.
 */
handler._turnOff = async ({message}) => {
  for (const middleware of turnOffMiddlewares) {
    await middleware(message);
  }
};
