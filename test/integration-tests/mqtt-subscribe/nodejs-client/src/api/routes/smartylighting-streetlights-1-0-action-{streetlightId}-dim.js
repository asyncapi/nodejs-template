const Router = require('hermesjs/lib/router');
const {validateMessage} = require('../../lib/message-validator');
const router = new Router();
const smartylightingStreetlights10ActionStreetlightIdDimHandler = require('../handlers/smartylighting-streetlights-1-0-action-{streetlightId}-dim');
module.exports = router;



router.useOutbound('smartylighting/streetlights/1/0/action/:streetlightId/dim', async (message, next) => {
  try {
    
    await validateMessage(message.payload,'smartylighting/streetlights/1/0/action/{streetlightId}/dim','dimLight','subscribe');
    await smartylightingStreetlights10ActionStreetlightIdDimHandler._dimLight({message});
    next();
    
  } catch (e) {
    next(e);
  }
});
