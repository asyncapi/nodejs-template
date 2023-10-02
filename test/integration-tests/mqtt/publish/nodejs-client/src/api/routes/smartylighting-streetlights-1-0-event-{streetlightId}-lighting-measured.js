const Router = require('hermesjs/lib/router');
const {validateMessage} = require('../../lib/message-validator');
const router = new Router();
const smartylightingStreetlights10EventStreetlightIdLightingMeasuredHandler = require('../handlers/smartylighting-streetlights-1-0-event-{streetlightId}-lighting-measured');
module.exports = router;



/**
 * Inform about environmental lighting conditions of a particular streetlight.
 */
router.use('smartylighting/streetlights/1/0/event/:streetlightId/lighting/measured', async (message, next) => {
  try {
    
    await validateMessage(message.payload,'smartylighting/streetlights/1/0/event/{streetlightId}/lighting/measured','lightMeasured','publish');
    await smartylightingStreetlights10EventStreetlightIdLightingMeasuredHandler._receiveLightMeasurement({message});
    next();
    
  } catch (e) {
    next(e);
  }
});
