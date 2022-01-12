const chalk = require('chalk');

module.exports = (err, message, next) => {
  if (err.name === 'AsyncAPIValidationError'){
    console.error(chalk.red(`❗  Message Rejected. ${err.message}`));
  } 
  else {
    console.error(chalk.red(`❗  ${err.message}`));
    if (err.stack) console.error(chalk.gray(err.stack.substr(err.stack.indexOf('\n')+1)));
  }
  next();
};
