'use strict';

let funcs = {
  toarray: val => (Array.isArray(val)) ? val : [val],
  todate: val => {
    if (val) {
      /**
       * Have we got a date:
       */

      if (!(val.match && val.match(/^(\d{4}-\d{2}-\d{2})|(?:[1-9]\d{3}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1\d|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[1-9]\d(?:0[48]|[2468][048]|[13579][26])|(?:[2468][048]|[13579][26])00)-02-29)T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?(?:Z|[+-][01]\d:[0-5]\d)$/))) {
        val = Number(val);
        if (val < 10000000000) {
          val *= 1000;
        }
      }
      val = (new Date(val)).toISOString();
    }
    return val;
  },
  tonumber: val => {
    if (val === null || val === undefined) {
      return 0;
    }
    if (Number.parseFloat(val) != val) { // eslint-disable-line eqeqeq
      return val;
    }
    return Number.parseFloat(val);
  },

  tostring: val => String(val)
};

exports.convert = (val, type) => {
  if (!type) {
    throw(new Error('No type conversion provided'));
  }

  if (!funcs['to' + type]) {
    throw(new Error(`No type conversion for '${type}'`));
  }

  return funcs['to' + type](val);
};

exports.toArray = funcs.toarray;
exports.toDate = funcs.todate;
exports.toNumber = funcs.tonumber;
exports.toString = funcs.tostring;
