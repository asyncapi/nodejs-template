const AsyncApiValidator = require('asyncapi-validator');

module.exports.validateMessage = async (payload, channel,name,operation)=> {
  let va = await AsyncApiValidator.fromSource('./asyncapi.yaml', {msgIdentifier: 'name'});
  va.validate(name, payload, channel, operation);
}
