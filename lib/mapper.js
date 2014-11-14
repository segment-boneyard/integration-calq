
/**
 * Module dependencies.
 */

var del = require('obj-case').del;
var reject = require('reject');

/**
 * Maps a track call
 *
 * https://calq.io/docs/client/http
 *
 * @param {Track} track
 * @return {Object} payload
 */

exports.track = function(track){
  return reject({
    actor: track.userId() || track.sessionId(),
    properties: properties(track),
    write_key: this.settings.writeKey,
    action_name: track.event(),
    ip_address: track.ip()
  });
};

/**
 * Maps an alias call
 *
 * https://calq.io/docs/client/http
 *
 * @param {Alias} alias
 * @return {Object} payload
 */

exports.alias = function(alias){
  return reject({
    old_actor: alias.previousId(),
    write_key: this.settings.writeKey,
    new_actor: alias.userId()
  });
};

/**
 * Maps an identify call
 *
 * https://calq.io/docs/client/http
 *
 * @param {Identify} identify
 * @return {Object} payload
 */

exports.identify = function(identify){
  return reject({
    actor: identify.userId() || identify.sessionId(),
    properties: traits(identify),
    write_key: this.settings.writeKey
  });
};

/**
 * Gets the properties to be sent with a track call.
 *
 * @param {Track} track
 * @return {Object} properties
 */

function properties(track){
  var ret = track.properties();
  ret.$device_agent = track.userAgent();

  var dimensions = resolution(track);
  if (dimensions) ret.$device_resolution = dimensions;

  // Campaign is mapped to special properties in Calq
  var campaign = track.proxy('context.campaign');
  if (campaign) {
    ret.$utm_campaign = campaign.name;
    ret.$utm_source = campaign.source;
    ret.$utm_medium = campaign.medium;
    ret.$utm_content = campaign.content;
    ret.$utm_term = campaign.term;
  }

  // Calq needs both currency and value together or neither
  var saleCurrency = track.currency();
  var saleValue = track.revenue();
  if (saleCurrency != null && saleCurrency.length == 3 && !isNaN(saleValue)) {
    ret.$sale_currency = saleCurrency;
    ret.$sale_value = saleValue;
    del(ret, 'currency'); // Don't send twice
    del(ret, 'revenue');  // Don't send twice
  }

  return reject(ret);
}

/**
 * Return a resolution string from the facade
 *
 * @param {Facade} facade
 * @return {String} resolution  e.g. "300x540"
 */

function resolution(facade){
  var width = facade.proxy('context.screen.width');
  var height = facade.proxy('context.screen.height');
  if (isNaN(width) || width <= 0) return;
  if (isNaN(height) || height <= 0) return;
  return width + 'x' + height;
}

/**
 * Return the traits aliased to what Calq recognizes
 *
 * @param {Identify} identify
 * @return {Object} traits
 */

function traits(identify){
  return identify.traits({
    avatar: '$image_url',
    country: '$country',
    name: '$full_name',
    gender: '$gender',
    email: '$email',
    phone: '$phone',
    city: '$city',
    age: '$age'
  });
}
