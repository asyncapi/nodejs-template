const AsyncApiValidator = require('asyncapi-validator');

module.exports.validateMessage = async (payload, channelName, messageName, operation, nValidated) => {
  try {
    let va = await AsyncApiValidator.fromSource('./asyncapi.yaml', {msgIdentifier: 'name'});
    va.validate(messageName, payload, channelName, operation);
    nValidated++;
  } catch (e) {
  }
  if (nValidated > 1) {
    throw new Error(`At least ${nValidated} message schema matched when exactly 1 should match`);
  }
  return nValidated;
}
