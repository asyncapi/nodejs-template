import { kebabCase, oneLine } from '../helpers/index';
import { File } from '@asyncapi/generator-react-sdk';

export default function packageFile({ asyncapi, params }) {
  const dependencies = {
    chalk: '4.1.2',
    dotenv: '8.1.0',
    hermesjs: '2.x',
    'hermesjs-router': '1.x',
    'asyncapi-validator': '3.0.0',
    'node-fetch': '2.6.0',
    'node-yaml-config': '0.0.4',
  };

  const serverProtocol = asyncapi.allServers().get(params.server).protocol();
  if (serverProtocol === 'mqtt' || serverProtocol === 'mqtts') {
    dependencies['hermesjs-mqtt'] = '2.x';
  } else if (serverProtocol === 'kafka' || serverProtocol === 'kafka-secure') {
    dependencies['hermesjs-kafka'] = '2.x';
  } else if (serverProtocol === 'amqp') {
    dependencies['hermesjs-amqp'] = '1.x';
  } else if (serverProtocol === 'ws') {
    dependencies['hermesjs-ws'] = '1.x';
  }

  let packageJSON = {};

  if (asyncapi.info().title()) {
    packageJSON.name = kebabCase(asyncapi.info().title());
  }
  if (asyncapi.info().version()) {
    packageJSON.version = asyncapi.info().version();
  }
  if (asyncapi.info().description()) {
    packageJSON.description = oneLine(asyncapi.info().description());
  }

  packageJSON = {
    ...packageJSON,
    scripts: {
      test: 'node custom-handler-example/script.js'
    },
    main: './src/api',
    dependencies,
  };

  return (
    <File name={'package.json'}>{JSON.stringify(packageJSON, null, 2)}</File>
  );
}
