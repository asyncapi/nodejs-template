import { File } from '@asyncapi/generator-react-sdk';

export default function readmeFile({asyncapi, params}) {
  return <File name={'README.md'}>
    {`# ${ asyncapi.info().title() }

${ asyncapi.info().description() || '' }

## Set up your template

1. Install dependencies
    \`\`\`sh
    npm i
    \`\`\`
${(params.securityScheme && (asyncapi.server(params.server).protocol() === 'kafka' || asyncapi.server(params.server).protocol() === 'kafka-secure') && asyncapi.components().securityScheme(params.securityScheme).type() === 'X509') ? '1. (Optional) For X509 security provide files with all data required to establish secure connection using certificates. Place files like `ca.pem`, `service.cert`, `service.key` in the root of the project or the location that you explicitly specified during generation.' : ''}

## Import and start

\`\`\`js
// output refers to the generated template folder
const { client } = require('../output'); // Modify require path if needed

client.init(); // starts the app
\`\`\`

## API

Use the \`client.register<OperationId>Middleware\` method as a bridge between the user-written handlers and the generated code. This can be used to register middlewares for specific methods on specific channels.

To send messages use built in sent function:
\`\`\`js
 client.app.send({my: "message"}, {}, 'topic/name');
\`\`\`
`}
  </File>;
}
