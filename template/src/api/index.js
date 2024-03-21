import { File } from '@asyncapi/generator-react-sdk';
import { capitalize, getProtocol, getConfig, camelCase, convertToFilename, convertOpertionIdToMiddlewareFn } from '../../../helpers/index';

export default function indexEntrypointFile({asyncapi, params}) {
    const protocol = asyncapi.server(params.server).protocol() === 'mqtts' ? 'mqtt' : asyncapi.server(params.server).protocol();
    const capitalizedProtocol = capitalize(getProtocol(protocol));

    const standardImports = `
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
    const serverConfig = ${getConfig(protocol)};
    const ${capitalizedProtocol}Adapter = require('hermesjs-${protocol}');
    `;

    const channelHandlerImports = Object.entries(asyncapi.channels()).map(([channelName, channel]) => {
        return `const ${camelCase(channelName)} = require('./routes/${convertToFilename(channelName)}.js');`;
    }).join('\n');

    const isSecurityEnabled = params.securityScheme && (asyncapi.server(params.server).protocol() === 'kafka' || asyncapi.server(params.server).protocol() === 'kafka-secure') && (asyncapi.components().securityScheme(params.securityScheme).type() === 'X509');
    let securitySchemeImports = isSecurityEnabled ? `
    const fs = require('fs')
    const certFilesDir = '${params.certFilesDir}';

    try {
    serverConfig.ssl.ca = fs.readFileSync(path.join(process.cwd(), certFilesDir, 'ca.pem'));
    serverConfig.ssl.key = fs.readFileSync(path.join(process.cwd(), certFilesDir,'service.key'));
    serverConfig.ssl.cert = fs.readFileSync(path.join(process.cwd(), certFilesDir,'service.cert'));
    } catch (error) {
    throw new Error(\`Unable to set cert files in the config: \${error}\`);
    }` : '';
    
    const imports = `
    ${standardImports}
    ${channelHandlerImports}
    ${securitySchemeImports}
    `

    const channelsMiddleware = `
    ${Object.entries(asyncapi.channels()).map(([channelName, channel]) => {
        let channelLogic = '';
        if (channel.hasPublish()) {
            channelLogic += `console.log(cyan.bold.inverse(' SUB '), gray('Subscribed to'), yellow('${channelName}'));
            app.use(${camelCase(channelName)});`;
        }
        if (channel.hasSubscribe()) {
            channelLogic += `console.log(yellow.bold.inverse(' PUB '), gray('Will eventually publish to'), yellow('${channelName}'));
            app.useOutbound(${camelCase(channelName)});`;
        }
        return channelLogic;
    }).join('\n')}`;
    
    const middlewares = `
    app.addAdapter(${capitalizedProtocol}Adapter, serverConfig);

    app.use(buffer2string);
    app.use(string2json);
    app.use(logger);
    
    // Channels
    ${channelsMiddleware}
    
    app.use(errorLogger);
    app.useOutbound(errorLogger);
    app.useOutbound(logger);
    app.useOutbound(json2string);
    `

    const initFunction = `
    function init() {
        app
            .listen()
            .then((adapters) => {
            console.log(cyan.underline(\`\${config.app.name} \${config.app.version}\`), gray('is ready!'), '\\n');
            adapters.forEach(adapter => {
                console.log('🔗 ', adapter.name(), gray('is connected!'));
            });
            })
            .catch(console.error);
    }
    `;

    const handlers = Object.entries(asyncapi.channels()).map(([channelName, channel]) => {
        let handler = '';
        if (channel.hasPublish()) {
            handler += `${convertOpertionIdToMiddlewareFn(channel.publish().id())} : require('./handlers/${convertToFilename(channelName)}').${convertOpertionIdToMiddlewareFn(channel.publish().id())},`;
        }
        if (channel.hasSubscribe()) {
            handler += `${convertOpertionIdToMiddlewareFn(channel.subscribe().id())} : require('./handlers/${convertToFilename(channelName)}').${convertOpertionIdToMiddlewareFn(channel.subscribe().id())},`;
        }
        return handler;
    }).join('\n');

    return <File name={'index.js'}>
        {`
${imports}

${middlewares}

${initFunction}

const handlers = {
    ${handlers}
}

const client = {
  app,
  init,
  ...handlers
};
  
module.exports = {
  client
};
`}
    </File>
}