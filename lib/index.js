
/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var mapper = require('./mapper');
var tick = process.nextTick;
var is = require('is');

/**
 * Expose `Calq`
 */

var Calq = module.exports = integration('Calq')
  .endpoint('https://api.calq.io')
  .channels(['server', 'mobile', 'client'])
  .ensure('settings.writeKey')
  .mapper(mapper)
  .retries(3);

/**
 * Track a new action/event within Calq.
 *
 * @param {Track} track
 * @param {Object} settings
 * @param {Function} fn
 * @api public
 */

Calq.prototype.track = function(payload, fn){
  return this
    .post('/track')
    .type('json')
    .send(payload)
    .end(this.handle(fn));
};

/**
 * Alias a user from one id to the other. In Calq this is called Transfer.
 *
 * @param {Alias} alias
 * @param {Object} settings
 * @param {Function} fn
 * @api public
 */

Calq.prototype.alias = function(payload, fn){
  return this
    .post('/transfer')
    .type('json')
    .send(payload)
    .end(this.handle(fn));
};

/**
 * Identify the user. In Calq this is called Profile.
 *
 * @param {Identify} identify
 * @param {Object} settings
 * @param {Function} fn
 * @api public
 */

Calq.prototype.identify = function(payload, fn){
  if (is.empty(payload.properties)) return tick(fn);
  return this
    .post('/profile')
    .type('json')
    .send(payload)
    .end(this.handle(fn));
};
