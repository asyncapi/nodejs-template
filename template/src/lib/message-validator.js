const path = require('path');
const AsyncApiValidator = require('asyncapi-validator');

// Try to parse the payload, and increment nValidated if parsing was successful.
module.exports.validateMessage = async (payload, channelName, messageName, operation, nValidated=0) => {
  const asyncApiFilePath = path.resolve(__dirname, '../../asyncapi.yaml');
  const va = await AsyncApiValidator.fromSource(asyncApiFilePath, {msgIdentifier: 'name'});
  va.validate(messageName, payload, channelName, operation);
  nValidated++;
  
  return nValidated;
};
