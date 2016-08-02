'use strict';
let _ = require('lodash');
let objectPath = require('object-path');

/**
 * Create an object from a source object with path expressions.
 * @param {Object} params - The parameters from the recipe which may include path expressions.
 * @param {Object} data - The data that contains the array to be paginated.
 */

module.exports = (params, data) => {
  let res = _.cloneDeep(params);

  data = data || params;

  /**
   * Loop through all of the properties of the params, looking for path expressions:
   */

  Object.keys(res).forEach((key) => {
    let value = res[key];

    /**
     * Path expressions will only be strings, so we can leave everything else alone:
     */

    if (typeof(value) === 'string') {

      /**
       * If we match a path expression that consists of just one path, then we
       * simply copy across the original object:
       */

      let matches = String(value).match(/^#{([^}]*)}$/);

      if (matches) {
        res[key] = objectPath.get(data, matches[1]);
      }

      /**
       * However, if there are multiple path expressions the result is a string:
       */

      else {
        res[key] = String(value).replace(/#{([^}]*)}/g, (match, p1) => {
          let obj = objectPath.get(data, p1);

          return (typeof(obj) === 'object') ? JSON.stringify(obj) : obj;
        });
      }
    }
  });

  return res;
};
