{%- if channel.hasPublish() and channel.publish().ext('x-lambda') %}const fetch = require('node-fetch');{%- endif %}
const handler = module.exports = {};

const middlewares = [];

/**
 * Registers a middleware function to be executed during request processing.
 *
 * Middleware functions have access to options object that you can use to access the message content and other helper functions
 *
 * @param {function} middlewareFn - The middleware function to be registered.
 * @throws {TypeError} If middlewareFn is not a function.
 */
handler.registerMiddleware = (middlewareFn) => {
  if (typeof middlewareFn !== 'function') {
    throw new TypeError('middlewareFn must be a function');
  }
  middlewares.push(middlewareFn);
}

{% if channel.hasPublish() %}
/**
 * {{ channel.publish().summary() }}
 *
 * @param {object} options
 * @param {object} options.message
{%- if channel.publish().message(0).headers() %}
{%- for fieldName, field in channel.publish().message(0).headers().properties() %}
{{ field | docline(fieldName, 'options.message.headers') }}
{%- endfor %}
{%- endif %}
{%- if channel.publish().message(0).payload() %}
{%- for fieldName, field in channel.publish().message(0).payload().properties() %}
{{ field | docline(fieldName, 'options.message.payload') }}
{%- endfor %}
{%- endif %}
 */
handler.{{ channel.publish().id() }} = async ({message}) => {
  {%- if channel.publish().ext('x-lambda') %}
  {%- set lambda = channel.publish().ext('x-lambda') %}
  fetch('{{ lambda.url }}', {
    method: '{% if lambda.method %}{{ lambda.method }}{% else %}POST{% endif %}',
    body: JSON.stringify({{ lambda.body | toJS | indent(4) | trimLastChar | safe }}),
    {%- if lambda.headers %}
    headers: {{ lambda.headers | toJS | indent(4) | trimLastChar | safe }}
    {%- endif %}
  })
    .then(res => res.json())
    .then(json => console.log(json))
    .catch(err => { throw err; });
  {%-  else %}
  for (const middleware of middlewares) {
    await middleware(message);
  }
  {%- endif %}
};

{%- endif %}

{%- if channel.hasSubscribe() %}
/**
 * {{ channel.subscribe().summary() }}
 *
 * @param {object} options
 * @param {object} options.message
 {%- if channel.subscribe().message(0).headers() %}
 {%- for fieldName, field in channel.subscribe().message(0).headers().properties() %}
 {{ field | docline(fieldName, 'options.message.headers') }}
 {%- endfor %}
 {%- endif %}
 {%- if channel.subscribe().message(0).payload() %}
 {%- for fieldName, field in channel.subscribe().message(0).payload().properties() %}
 {{ field | docline(fieldName, 'options.message.payload') }}
 {%- endfor %}
 {%- endif %}
 */
handler.{{ channel.subscribe().id() }} = async ({message}) => {
  for (const middleware of middlewares) {
    await middleware(message);
  }
};

{%- endif %}
