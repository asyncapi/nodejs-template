const Router = require('hermesjs/lib/router');
const {validateMessage} = require('../../lib/message-validator');
const router = new Router();
const {{ channelName | camelCase }}Handler = require('../handlers/{{ channelName | convertToFilename }}');
module.exports = router;


{% if channel.hasPublish() %}
  {%- if channel.publish().summary() %}
/**
 * {{ channel.publish().summary() }}
 */
  {%- endif %}
router.use('{{ channelName | toHermesTopic }}', async (message, next) => {
  try {
    {% if channel.publish().hasMultipleMessages() %}
    /*
     * TODO: If https://github.com/asyncapi/parser-js/issues/372 is addressed, simplify this
     * code to just validate the message against the combined message schema which will
     * include the `oneOf` in the JSON schema - let the JSON schema validator handle the
     * oneOf semantics (rather than each generator having to emit conditional code)
     */
    let nValidated = 0;
    // For oneOf, only one message schema should match.
    // Validate payload against each message and count those which validate
    {% for i in range(0, channel.publish().messages().length) -%}
    try {
      nValidated = await validateMessage(message.payload,'{{ channelName }}','{{ channel.publish().message(i).name() }}','publish', nValidated);  
    } catch { };
    {% endfor -%}
    if (nValidated === 1) {
      await {{ channelName | camelCase }}Handler.{{ channel.publish().id() }}({message});
      next()
    } else {
      throw new Error(`${nValidated} of {{ channel.publish().messages().length }} message schemas matched when exactly 1 should match`);
    }
    {% else %}
    await validateMessage(message.payload,'{{ channelName }}','{{ channel.publish().message().name() }}','publish');
    await {{ channelName | camelCase }}Handler.{{ channel.publish().id() }}({message});
    next();
    {% endif %}
  } catch (e) {
    next(e);
  }
});

{%- endif %}
{%- if channel.hasSubscribe() %}
  {%- if channel.subscribe().summary() %}
/**
 * {{ channel.subscribe().summary() }}
 */
  {%- endif %}
router.useOutbound('{{ channelName | toHermesTopic }}', async (message, next) => {
  try {
    {% if channel.subscribe().hasMultipleMessages() %}
    let nValidated = 0;
    // For oneOf, only one message schema should match.
    // Validate payload against each message and count those which validate
    {% for i in range(0, channel.subscribe().messages().length) -%}
    nValidated = await validateMessage(message.payload,'{{ channelName }}','{{ channel.subscribe().message(i).name() }}','subscribe', nValidated);
    {% endfor -%}
    if (nValidated === 1) {
      await {{ channelName | camelCase }}Handler.{{ channel.subscribe().id() }}({message});
      next()
    } else {
      throw new Error(`${nValidated} of {{ channel.subscribe().messages().length }} message schemas matched when exactly 1 should match`);
    }
    {% else %}
    await validateMessage(message.payload,'{{ channelName }}','{{ channel.subscribe().message().name() }}','subscribe');
    await {{ channelName | camelCase }}Handler.{{ channel.subscribe().id() }}({message});
    next();
    {% endif %}
  } catch (e) {
    next(e);
  }
});

{%- endif %}
