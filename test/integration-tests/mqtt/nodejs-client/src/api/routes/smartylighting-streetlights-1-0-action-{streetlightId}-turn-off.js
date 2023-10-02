const Router = require('hermesjs/lib/router');
const {validateMessage} = require('../../lib/message-validator');
const router = new Router();
const smartylightingStreetlights10ActionStreetlightIdTurnOffHandler = require('../handlers/smartylighting-streetlights-1-0-action-{streetlightId}-turn-off');
module.exports = router;



router.useOutbound('smartylighting/streetlights/1/0/action/:streetlightId/turn/off', async (message, next) => {
  try {
    
    await validateMessage(message.payload,'smartylighting/streetlights/1/0/action/{streetlightId}/turn/off','turnOnOff','subscribe');
    await smartylightingStreetlights10ActionStreetlightIdTurnOffHandler._turnOff({message});
    next();
    
  } catch (e) {
    next(e);
  }
});
