'use strict';
let _ = require('lodash');

let checkForSimpleAssignment = require('./../checkForSimpleAssignment');

function javascript(params, data) {
  var ret;

  try {
    var condition = checkForSimpleAssignment(data, params.if);

    if (!params.if || condition) {
      ret = _.clone(data);

      /**
       * Create a function that includes the passed in code, and then call
       * the function, using the data as a parameter:
       */

      var fn = eval(`(function (event) {${params.code};})`);
      fn(ret);
    }
  } catch (e) {
    throw(new Error('Unable to evaluate JavaScript \'' + params.code + '\': ' +
      e));
  }

  return ret || data;
}

module.exports = javascript;
