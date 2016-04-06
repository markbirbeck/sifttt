'use strict';
var evaljson = require('evaljson');
var _ = require('lodash');

var checkForSimpleAssignment = require('./../checkForSimpleAssignment');

/**
 * Create an array by selecting items from an existing array, matching on some
 * key field.
 * @param {Object} params - The parameters from the recipe.
 * @param {string} params.source - The identifier for the source data.
 * @param {string} params.target - The identifier for the location the result should be stored to.
 * @param {string} params.keyProperty - The name of the property holding the keys.
 * @param {string} params.keys - The keys of the items to select.
 * @param {string} params.remove - A flag indicating whether the list comprises everything *except* the keys.
 * @param {Object} data - The data containing the array to be selected from.
 */
module.exports = (params, data) => {
  if (params.source && params.target) {
    try {
      var list = checkForSimpleAssignment(data, params.source);

      if (list === null) {
        list = evaljson(params, data).source;
      }

      /**
       * Select only the objects that have the correct key:
       */

      data[params.target] = _.select(list, item => {
        let key = item[params.keyProperty || 'id'];
        let res = params.keys.indexOf(key);

        return (params.negate) ? res === -1 : res > -1;
      });
    } catch (e) {
      throw(new Error('Unable to select to \'' + params.target + '\': ' +
        e.message));
    }
  }

  return data;
}
