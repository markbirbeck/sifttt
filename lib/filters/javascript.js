'use strict';

module.exports = (params, data) => {
  try {

    /**
     * Create a function that includes the passed in code, and then call
     * the function, using the data as a parameter:
     */

    var fn = eval(`(function (event) {${params.code}; return event;})`);
    return fn(data);
  } catch (e) {
    throw(new Error('Unable to evaluate JavaScript \'' + params.code + '\': ' +
      e));
  }
};
