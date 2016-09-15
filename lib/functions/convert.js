'use strict';

let funcs = {
  toarray: val => (Array.isArray(val)) ? val : [val],
  todate: val => {
    if (val) {
      val = Number(val);
      if (val < 10000000000) {
        val *= 1000;
      }
      val = (new Date(val)).toISOString();
    }
    return val;
  },
  tonumber: val => Number(val),
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
