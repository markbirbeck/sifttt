'use strict';
var evaljson = require('evaljson');
let ForecastIo = require('forecastio');
let forecastIo = new ForecastIo(process.env.FORECASTIO_API_KEY);

let checkForSimpleAssignment = require('./../checkForSimpleAssignment');

module.exports = (params, data) => {
  var val = checkForSimpleAssignment(data, params.source);

  if (val === null) {
    val = evaljson(params, data).source;
  }

  let latitude = val.latitude;
  let longitude = val.longitude;
  let time = val.time.replace('.000', '');

  return forecastIo.timeMachine(latitude, longitude, time, {units: 'si'})
  .then(weather => {

    /**
     * TODO:
     *
     * Would like to map this to some generic pattern, such as that described here:
     *
     *  https://github.com/schemaorg/schemaorg/issues/362
     */

    data[params.target] = weather.daily.data[0];
    return data;
  })
  .catch(e => {
    throw(new Error(`Unable to get weather forecast for '${JSON.stringify(params.source)}' ('${JSON.stringify(val)}'): ${e}`));
  })
  ;
}
