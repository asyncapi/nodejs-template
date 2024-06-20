const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const AsyncApiValidator = require('asyncapi-validator');

function validateMessageIdentifiers(asyncApiSpec) {
  const messages = asyncApiSpec.components.messages;
  const missingNames = [];

  for (const [messageName, messageObj] of Object.entries(messages)) {
    if (!messageObj.name) {
      missingNames.push(messageName);
    }
  }

  return missingNames;
}

function performPreGenValidation(asyncApiFilePath) {
  const fileContents = fs.readFileSync(asyncApiFilePath, 'utf8');
  const asyncApiSpec = yaml.load(fileContents);

  const missingNames = validateMessageIdentifiers(asyncApiSpec);

  if (missingNames.length > 0) {
    const errorMessage = `msgIdentifier "name" does not exist for message(s): ${missingNames.join(', ')}`;
    throw new Error(errorMessage);
  }
}

// Try to parse the payload, and increment nValidated if parsing was successful.
module.exports.validateMessage = async (
  payload,
  channelName,
  messageName,
  operation,
  nValidated = 0
) => {
  try {
    const asyncApiFilePath = path.resolve(__dirname, "../../asyncapi.yaml");
    const va = await AsyncApiValidator.fromSource(asyncApiFilePath, {
      msgIdentifier: "name",
    });
    va.validate(messageName, payload, channelName, operation);
    nValidated++;

    return nValidated;
  } catch (error) {
    error.name = "AsyncAPIValidationError";
    throw error;
  }
};
