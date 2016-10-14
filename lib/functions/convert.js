'use strict';

let funcs = {
  toarray: val => (Array.isArray(val)) ? val : [val],
  todate: val => {
    if (val) {
      /**
       * Have we got a date:
       */

      if (!(val.match && val.match(/^\d{4}-\d{2}-\d{2}$/))) {
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
