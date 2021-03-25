const AsyncApiValidator = require('asyncapi-validator');

module.exports = (message, next) => {
  if (message.headers.cmd === 'publish') {
    validateMessage(message.payload, message.topic);
  }
  next();
};

validateMessage = async (payload, topic)=> {
  let va = await AsyncApiValidator.fromSource('./asyncapi.yaml', {msgIdentifier: 'name'});
  try {
    va.validate('lightMeasured', payload, topic, 'publish');
  }catch (e){
    throw e.message;
  }
}
