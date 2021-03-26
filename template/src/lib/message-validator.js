const AsyncApiValidator = require('asyncapi-validator');

module.exports.validateMessage = async (payload, topic,name,operation)=> {
  let va = await AsyncApiValidator.fromSource('./asyncapi.yaml', {msgIdentifier: 'name'});
  va.validate(name, payload, topic, operation);
}
