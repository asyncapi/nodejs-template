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

function performPreGenValidation(asyncApiFilePath, messageRuntimeValidation) {
  if (messageRuntimeValidation === false) {
    return;
  }
  const fileContents = fs.readFileSync(asyncApiFilePath, 'utf8');
  const asyncApiSpec = yaml.load(fileContents);

  const missingNames = validateMessageIdentifiers(asyncApiSpec);

  if (missingNames.length > 0) {
    const errorMessage = `msgIdentifier "name" does not exist for message(s): ${missingNames.join(', ')}`;
    const warningMessage = 'If you are not able to modify your AsyncAPI document to add missing message IDs, then disable runtime validation logic by passing parameter messageRuntimeValidation set to false';
    const error = new Error(errorMessage);
    error.warning = warningMessage;
    error.name = 'AsyncAPIValidationError';
    throw error;
  }
}

// Try to parse the payload, and increment nValidated if parsing was successful.
async function validateMessage (
  payload,
  channelName,
  messageName,
  operation,
  messageRuntimeValidation,
  nValidated = 0
) {
  if (messageRuntimeValidation === false) {
    return nValidated + 1;
  }

  const asyncApiFilePath = path.resolve(__dirname, "../../asyncapi.yaml");
  try {
    performPreGenValidation(asyncApiFilePath, messageRuntimeValidation);
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

module.exports = {
  validateMessage
};