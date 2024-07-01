const { red, gray, green } = require('chalk');

module.exports = (err, message, next) => {
  if (err.name === 'AsyncAPIValidationError') {
    console.error(red(`❗  Message Rejected. ${err.message}`));
    if(err.warning) {
      console.warn(green(`⛔ ${err.warning}`));
    }
  } else {
    console.error(red(`❗  ${err.message}`));
    if (err.stack)
      console.error(gray(err.stack.substr(err.stack.indexOf('\n') + 1)));
  }
  next();
};
