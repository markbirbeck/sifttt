'use strict';
var jt = require('../jsonTemplates');

/**
 * Paginate an array, providing information about page number and size.
 * @param {Object} params - The parameters from the recipe.
 * @param {Object} [params.page=1] - The page number to return.
 * @param {Object} [params.size=10] - The page size.
 * @param {Object} [params.state='pagination'] - The property in which to put the pagination state.
 * @param {Object} [params.target=params.source] - The property in which to put the metadata.
 * @param {Object} data - The data that contains the array to be paginated.
 */
module.exports = (_params, data) => {
  let params = jt(_params, data);

  if (params.source) {
    try {
      var val = data[params.source];

      if (Array.isArray(val)) {
        let page = +params.page || 1;
        let size = +params.size || 10;
        let total = +params.total || val.length;
        let begin = (page - 1) * size;
        let end = begin + size;

        /**
         * Write the requested page of data, either to a target field, or on
         * top of the source:
         */

        data[params.target || params.source] = val.slice(begin, end);

        /**
         * Save the pagination state into the specified field:
         */

        let state = {};

        state.page = page;
        state.size = size;
        state.count = total;
        data[params.state || 'pagination'] = state;
      } else {
        data[params.target] = val;
      }
    } catch (e) {
      throw(new Error('Unable to assign to \'' + params.target + '\': ' +
        e.message));
    }
  }

  return data;
}
