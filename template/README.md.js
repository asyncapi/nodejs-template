import { File } from '@asyncapi/generator-react-sdk';

export default function readmeFile({asyncapi, params}) {
  const server = asyncapi.allServers().get(params.server);
  const protocol = server.protocol();
  const security = server.security();

  let hasSecuritySchemeX509 = false;
  let securitySchemeType;
  if (params.securityScheme && security && security.length > 0) {
    const securityReq = security[0].all();
    if (securityReq && securityReq.length > 0) {
      securitySchemeType = securityReq[0].scheme().type();
    }
  }
  
  hasSecuritySchemeX509 = (params.securityScheme && (protocol === 'kafka' || protocol === 'kafka-secure') && securitySchemeType === 'X509');
  
  return <File name={'README.md'}>
    {`# ${ asyncapi.info().title() }

${ asyncapi.info().description() || '' }

## Set up your template

1. Install dependencies
    \`\`\`sh
    npm i
    \`\`\`
${ hasSecuritySchemeX509 ? '1. (Optional) For X509 security provide files with all data required to establish secure connection using certificates. Place files like `ca.pem`, `service.cert`, `service.key` in the root of the project or the location that you explicitly specified during generation.' : ''}

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
