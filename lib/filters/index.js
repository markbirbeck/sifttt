var _geoip = require('./geoip');
var _json = require('./json');
var _mutate = require('./mutate');

function geoip(params, data) {
  try {
    return _geoip(params, data);
  } catch (e) {
    console.warn(data.MessageId, ':', e.message, data);
  }
  return data;
}

function json(params, data) {
  try {
    return _json(params, data);
  } catch (e) {
    console.warn(data.MessageId, ':', e.message, data);
  }
  return data;
}

function mutate(params, data) {
  try {
    return _mutate(params, data);
  } catch (e) {
    console.warn(data.MessageId, ':', e.message, data);
  }
  return data;
}

exports.geoip = geoip;
exports.json = json;
exports.mutate = mutate;
