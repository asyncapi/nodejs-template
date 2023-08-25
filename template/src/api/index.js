const Hermes = require('hermesjs');
const app = new Hermes();
const path = require('path');
const { yellow, gray, cyan } = require('chalk');
const buffer2string = require('./middlewares/buffer2string');
const string2json = require('./middlewares/string2json');
const json2string = require('./middlewares/json2string');
const logger = require('./middlewares/logger');
const errorLogger = require('./middlewares/error-logger');
const config = require('../lib/config');
{%- set protocol = asyncapi.server(params.server).protocol() %}
{%- if protocol === 'mqtts' %}
  {%- set protocol = 'mqtt' %}
{%- endif %}
const serverConfig = {{ protocol | getConfig }};
const {{ protocol | getProtocol | capitalize }}Adapter = require('hermesjs-{{ protocol | getProtocol }}');
{%- for channelName, channel in asyncapi.channels() %}
const {{ channelName | camelCase }} = require('./routes/{{ channelName | convertToFilename }}.js');
{%- endfor %}

{%- if params.securityScheme and (asyncapi.server(params.server).protocol() === 'kafka' or asyncapi.server(params.server).protocol() === 'kafka-secure') and asyncapi.components().securityScheme(params.securityScheme).type() === 'X509' %}
const fs = require('fs')
const certFilesDir = '{{ params.certFilesDir }}';

try {
  serverConfig.ssl.ca = fs.readFileSync(path.join(process.cwd(), certFilesDir, 'ca.pem'));
  serverConfig.ssl.key = fs.readFileSync(path.join(process.cwd(), certFilesDir,'service.key'));
  serverConfig.ssl.cert = fs.readFileSync(path.join(process.cwd(), certFilesDir,'service.cert'));
} catch (error) {
  throw new Error(`Unable to set cert files in the config: ${error}`);
}

{%- endif %}

app.addAdapter({{ protocol | getProtocol | capitalize }}Adapter, serverConfig);

app.use(buffer2string);
app.use(string2json);
app.use(logger);

// Channels
{% for channelName, channel in asyncapi.channels() -%}
{% if channel.hasPublish() -%}
console.log(cyan.bold.inverse(' SUB '), gray('Subscribed to'), yellow('{{channelName}}'));
app.use({{ channelName | camelCase }});
{% endif -%}
{% if channel.hasSubscribe() -%}
console.log(yellow.bold.inverse(' PUB '), gray('Will eventually publish to'), yellow('{{channelName}}'));
app.useOutbound({{ channelName | camelCase }});
{% endif -%}
{% endfor %}
app.use(errorLogger);
app.useOutbound(errorLogger);
app.useOutbound(logger);
app.useOutbound(json2string);

app
  .listen()
  .then((adapters) => {
    console.log(cyan.underline(`${config.app.name} ${config.app.version}`), gray('is ready!'), '\n');
    adapters.forEach(adapter => {
      console.log('🔗 ', adapter.name(), gray('is connected!'));
    });
  })
  .catch(console.error);

module.exports = app;
