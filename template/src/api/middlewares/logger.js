const util = require('util');
const chalk = require('chalk');
// const { yellow, blue, magenta } = require('colors/safe');

module.exports = (message, next) => {
  const arrow = message.inbound ? chalk.blue('←') : chalk.magenta('→');
  const action = message.inbound ? 'received' : 'sent';
  console.log(`${arrow} ${chalk.yellow(message.topic)} was ${action}:`);
  console.log(util.inspect(message.payload, { depth: null, colors: true }));
  next();
};
