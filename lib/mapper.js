
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

exports.track = function(track) {
  return createCommonPayload(track, this.settings);
};

/**
 * Maps a screen call. In Calq this is a call to Track
 * with some extra properties set.
 *
 * @param {Screen} screen
 * @return {Object} payload
 */

exports.screen = function(screen) {
  var payload = createCommonPayload(screen, this.settings);
  payload.action_name = 'Screen View';
  payload.properties.$view_name = screen.name();
  del(payload.properties, 'name'); // Don't send twice
  payload.properties = reject(payload.properties);
  
  return reject(payload);
};

/**
 * Maps a page call. In Calq this is a call to Track
 * with some extra properties set.
 *
 * @param {Page} page
 * @return {Object} payload
 */

exports.page = function(page) {
  // Same as track, but we need to add page specific info
  var payload = createCommonPayload(page, this.settings);
  payload.action_name = 'Page View';

  // If not set then reject will clear these (e.g. a page view with no name given)
  payload.properties.category = page.category();
  payload.properties.$view_name = page.name();
  payload.properties.$view_url = page.url();
  del(payload.properties, 'name'); // Don't send twice
  del(payload.properties, 'url'); // Don't send twice
  payload.properties = reject(payload.properties);

  return reject(payload);
};

/**
 * Maps an alias call
 *
 * https://calq.io/docs/client/http
 *
 * @param {Alias} alias
 * @return {Object} payload
 */

exports.alias = function(alias) {
  var timestamp = alias.timestamp();
  return reject({
    old_actor: alias.previousId(),
    write_key: this.settings.writeKey,
    new_actor: alias.userId(),
    timestamp: timestamp && timestamp.toISOString()
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

exports.identify = function(identify) {
  var timestamp = identify.timestamp();
  return reject({
    actor: identify.userId() || identify.sessionId(),
    properties: traits(identify),
    write_key: this.settings.writeKey,
    timestamp: timestamp && timestamp.toISOString()
  });
};

/**
 * Gets the base properties to be sent with all track calls. Used by track, page and screen.
 *
 * @param {Track} track
 * @return {Object} properties
 */

function createCommonPayload(facade, settings) {
  return reject({
    timestamp: facade.timestamp() && facade.timestamp().toISOString(),
    actor: facade.userId() || facade.sessionId(),
    properties: properties(facade),
    write_key: settings.writeKey,
    action_name: facade.event(),
    ip_address: facade.ip()
  });
}

/**
 * Gets the user properties to be sent with a track call.
 *
 * @param {Track} track
 * @return {Object} properties
 */

function properties(facade) {
  var ret = facade.properties();
  ret.$device_agent = facade.userAgent();

  var dimensions = resolution(facade);
  if (dimensions) ret.$device_resolution = dimensions;

  // Campaign is mapped to special properties in Calq
  var campaign = facade.proxy('context.campaign');
  if (campaign) {
    ret.$utm_campaign = campaign.name;
    ret.$utm_source = campaign.source;
    ret.$utm_medium = campaign.medium;
    ret.$utm_content = campaign.content;
    ret.$utm_term = campaign.term;
  }

  // Calq needs both currency and value together or neither
  if (facade.currency) {  // Used by page() and facade(), but page() won't have currency
    var saleCurrency = facade.currency();
    var saleValue = facade.revenue();
    if (saleCurrency != null && saleCurrency.length == 3 && !isNaN(saleValue)) {
      ret.$sale_currency = saleCurrency;
      ret.$sale_value = saleValue;
      del(ret, 'currency'); // Don't send twice
      del(ret, 'revenue');  // Don't send twice
    }
  }

  return reject(ret);
}

/**
 * Return a resolution string from the facade
 *
 * @param {Facade} facade
 * @return {String} resolution  e.g. "300x540"
 */

function resolution(facade) {
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

function traits(identify) {
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