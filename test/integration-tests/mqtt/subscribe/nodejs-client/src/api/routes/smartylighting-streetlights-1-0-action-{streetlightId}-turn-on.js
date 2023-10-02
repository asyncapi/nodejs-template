const Router = require('hermesjs/lib/router');
const {validateMessage} = require('../../lib/message-validator');
const router = new Router();
const smartylightingStreetlights10ActionStreetlightIdTurnOnHandler = require('../handlers/smartylighting-streetlights-1-0-action-{streetlightId}-turn-on');
module.exports = router;



router.useOutbound('smartylighting/streetlights/1/0/action/:streetlightId/turn/on', async (message, next) => {
  try {
    
    await validateMessage(message.payload,'smartylighting/streetlights/1/0/action/{streetlightId}/turn/on','turnOnOff','subscribe');
    await smartylightingStreetlights10ActionStreetlightIdTurnOnHandler._turnOn({message});
    next();
    
  } catch (e) {
    next(e);
  }
});
