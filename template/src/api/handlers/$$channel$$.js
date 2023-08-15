{%- if channel.hasPublish() and channel.publish().ext('x-lambda') %}const fetch = require('node-fetch');{%- endif %}
const handler = module.exports = {};

const middlewares = [];

handler.registerMiddleware = (middlewareFn) => {
  middlewares.push(middlewareFn);
}

{% if channel.hasPublish() %}
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
handler.{{ channel.subscribe().id() }} = async ({message}) => {
  for (const middleware of middlewares) {
    await middleware(message);
  }
};

{%- endif %}
