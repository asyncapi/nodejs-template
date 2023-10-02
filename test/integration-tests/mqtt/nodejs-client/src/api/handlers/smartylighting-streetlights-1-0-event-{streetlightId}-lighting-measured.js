
const handler = module.exports = {};


const receiveLightMeasurementMiddlewares = [];

/**
 * Registers a middleware function for the receiveLightMeasurement operation to be executed during request processing.
 *
 * Middleware functions have access to options object that you can use to access the message content and other helper functions
 *
 * @param {function} middlewareFn - The middleware function to be registered.
 * @throws {TypeError} If middlewareFn is not a function.
 */
handler.registerReceiveLightMeasurementMiddleware = (middlewareFn) => {
  console.log("registering middleware");
  if (typeof middlewareFn !== 'function') {
    throw new TypeError('middlewareFn must be a function');
  }
  receiveLightMeasurementMiddlewares.push(middlewareFn);
}

/**
 * Inform about environmental lighting conditions of a particular streetlight.
 *
 * @param {object} options
 * @param {object} options.message
 * @param {integer} options.message.headers.my-app-header
 * @param {integer} options.message.payload.lumens - Light intensity measured in lumens.
 * @param {string} options.message.payload.sentAt - Date and time when the message was sent.
 */
handler._receiveLightMeasurement = async ({message}) => {
  for (const middleware of receiveLightMeasurementMiddlewares) {
    await middleware(message);
  }
};
