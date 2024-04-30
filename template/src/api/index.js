import { File } from '@asyncapi/generator-react-sdk';
import { capitalize, getProtocol, getConfig, camelCase, convertToFilename, convertOpertionIdToMiddlewareFn } from '../../../helpers/index';

export default function indexEntrypointFile({asyncapi, params}) {
    const server = asyncapi.allServers().get(params.server);
    const protocol = server.protocol() === 'mqtts' ? 'mqtt' : server.protocol();
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

    const channelHandlerImports = asyncapi.channels().all().map(channel => {
        const channelName = channel.id();
        return `const ${camelCase(channelName)} = require('./routes/${convertToFilename(channelName)}.js');`;
    }).join('\n');

    const isSecurityEnabled = params.securityScheme && (server.protocol() === 'kafka' || server.protocol() === 'kafka-secure') && (asyncapi.components().securitySchemes().get(params.securityScheme).type() !== 'X509');
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

    const channelsMiddleware = asyncapi.channels().all().map(channel => {
        const channelName = channel.id();
        let channelLogic = '';
        if (channel.operations().filterByReceive().length > 0) {
            channelLogic += `console.log(cyan.bold.inverse(' SUB '), gray('Subscribed to'), yellow('${channelName}'));
            app.use(${camelCase(channelName)});`;
        }
        if (channel.operations().filterBySend().length > 0) {
            channelLogic += `console.log(yellow.bold.inverse(' PUB '), gray('Will eventually publish to'), yellow('${channelName}'));
            app.useOutbound(${camelCase(channelName)});`;
        }
        return channelLogic;
    }).join('\n');
    
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

    const handlers = asyncapi.channels().all().map(channel => {
        const channelName = channel.id();
        const x = channel.operations().all().map(operation => {
            let operationId = operation.id();
            return `${convertOpertionIdToMiddlewareFn(operationId)} : require('./handlers/${convertToFilename(channelName)}').${convertOpertionIdToMiddlewareFn(operationId)}`
        });
        return x;
    }).join(',');

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