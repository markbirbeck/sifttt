'use strict';
var evaljson = require('evaljson');
var _ = require('lodash');

var checkForSimpleAssignment = require('./../checkForSimpleAssignment');

/**
 * Sum an array of numbers, or a specified field from an array of objects.
 * @param {Object} params - The parameters from the recipe.
 * @param {Object} data - The data to be summed.
 */
module.exports = (params, data) => {
  if (params.source) {
    try {
      var list = checkForSimpleAssignment(data, params.source);

      if (list === null) {
        list = evaljson(params, data).source;
      }

      /**
       * Use the type of the first array element to determine how to
       * process. If we have an array of objects then we need a property name:
       */

      data[params.target || 'sumTotal'] = _.sum(data[list],
        (typeof data[list][0] === 'object') ? params.value || 'value' : undefined);
      data[params.count || 'sumNums'] = data[list].length;
    } catch (e) {
      throw(new Error('Unable to sum to \'' + params.target + '\': ' +
        e.message));
    }
  }

  return data;
}
