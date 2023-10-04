
const handler = module.exports = {};


const dimLightMiddlewares = [];

/**
 * Registers a middleware function for the dimLight operation to be executed during request processing.
 *
 * Middleware functions have access to options object that you can use to access the message content and other helper functions
 *
 * @param {function} middlewareFn - The middleware function to be registered.
 * @throws {TypeError} If middlewareFn is not a function.
 */
handler.registerDimLightMiddleware = (middlewareFn) => {
  if (typeof middlewareFn !== 'function') {
    throw new TypeError('middlewareFn must be a function');
  }
  dimLightMiddlewares.push(middlewareFn);
}

/**
 * 
 *
 * @param {object} options
 * @param {object} options.message
  * @param {integer} options.message.headers.my-app-header
  * @param {integer} options.message.payload.percentage - Percentage to which the light should be dimmed to.
  * @param {string} options.message.payload.sentAt - Date and time when the message was sent.
 */
handler._dimLight = async ({message}) => {
  for (const middleware of dimLightMiddlewares) {
    await middleware(message);
  }
};
