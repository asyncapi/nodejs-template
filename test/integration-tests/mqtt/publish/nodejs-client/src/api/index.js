const Hermes = require('hermesjs');
const app = new Hermes();
const path = require('path');
const { yellow, gray, cyan } = require('chalk');
const buffer2string = require('./middlewares/buffer2string');
const string2json = require('./middlewares/string2json');
const json2string = require('./middlewares/json2string');
const logger = require('./middlewares/logger');
const errorLogger = require('./middlewares/error-logger');
const config = require('../lib/config');
const serverConfig = config.broker.mqtt;
const MqttAdapter = require('hermesjs-mqtt');
const smartylightingStreetlights10EventStreetlightIdLightingMeasured = require('./routes/smartylighting-streetlights-1-0-event-{streetlightId}-lighting-measured.js');
const smartylightingStreetlights10ActionStreetlightIdTurnOn = require('./routes/smartylighting-streetlights-1-0-action-{streetlightId}-turn-on.js');
const smartylightingStreetlights10ActionStreetlightIdTurnOff = require('./routes/smartylighting-streetlights-1-0-action-{streetlightId}-turn-off.js');
const smartylightingStreetlights10ActionStreetlightIdDim = require('./routes/smartylighting-streetlights-1-0-action-{streetlightId}-dim.js');

app.addAdapter(MqttAdapter, serverConfig);

app.use(buffer2string);
app.use(string2json);
app.use(logger);

// Channels
console.log(cyan.bold.inverse(' SUB '), gray('Subscribed to'), yellow('smartylighting/streetlights/1/0/event/{streetlightId}/lighting/measured'));
app.use(smartylightingStreetlights10EventStreetlightIdLightingMeasured);
console.log(yellow.bold.inverse(' PUB '), gray('Will eventually publish to'), yellow('smartylighting/streetlights/1/0/action/{streetlightId}/turn/on'));
app.useOutbound(smartylightingStreetlights10ActionStreetlightIdTurnOn);
console.log(yellow.bold.inverse(' PUB '), gray('Will eventually publish to'), yellow('smartylighting/streetlights/1/0/action/{streetlightId}/turn/off'));
app.useOutbound(smartylightingStreetlights10ActionStreetlightIdTurnOff);
console.log(yellow.bold.inverse(' PUB '), gray('Will eventually publish to'), yellow('smartylighting/streetlights/1/0/action/{streetlightId}/dim'));
app.useOutbound(smartylightingStreetlights10ActionStreetlightIdDim);

app.use(errorLogger);
app.useOutbound(errorLogger);
app.useOutbound(logger);
app.useOutbound(json2string);

function init() {
  app
    .listen()
    .then((adapters) => {
      console.log(cyan.underline(`${config.app.name} ${config.app.version}`), gray('is ready!'), '\n');
      adapters.forEach(adapter => {
        console.log('🔗 ', adapter.name(), gray('is connected!'));
      });
    })
    .catch(console.error);
}

const handlers = {
  registerReceiveLightMeasurementMiddleware: require('./handlers/smartylighting-streetlights-1-0-event-{streetlightId}-lighting-measured').registerReceiveLightMeasurementMiddleware,
  registerTurnOnMiddleware: require('./handlers/smartylighting-streetlights-1-0-action-{streetlightId}-turn-on').registerTurnOnMiddleware,

  registerTurnOffMiddleware: require('./handlers/smartylighting-streetlights-1-0-action-{streetlightId}-turn-off').registerTurnOffMiddleware,

  registerDimLightMiddleware: require('./handlers/smartylighting-streetlights-1-0-action-{streetlightId}-dim').registerDimLightMiddleware,
};

const client = {
  app,
  init,
  ...handlers
};

module.exports = {
  client
};
