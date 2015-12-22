'use strict';
let _ = require('lodash');
let objnest = require('objnest');

/**
 * params will be a collection of nested object assignments, such as:
 *
 *  input.glob.body.aggs.device.aggs.plays.date_histogram.extended_bounds.min=2015-12-11
 *
 * We first split this into a target and source:
 *
 *  target: input.glob.body.aggs.device.aggs.plays.date_histogram.extended_bounds.min
 *  source: 2015-12-11
 *
 * Then we use the target value to generate a structured object with source as
 * its value:
 *
 *  {
 *    input: {
 *      glob: {
 *        body: {
 *          ...snip...
 *            extended_bounds: {
 *              min: '2015-12-11'
 *            }
 *          ...snip...
 *        }
 *      }
 *    }
 *  }
 */

module.exports = (defaults, params, escapeSequence) => {
  if (!Array.isArray(params)) {
    params = [params];
  }

  let m = params.map(param => {
    if (typeof(param) !== 'string') {
      return param;
    }

    let assignment = param.split('=');

    if (assignment.length !== 2) {
      return param;
    }

    return objnest.expand({
      [assignment[0]]: assignment[1]
    });
  });

  let ret = defaults;

  m.forEach(mDash => {
    ret = _.merge(ret, mDash);
  });

  return ret;
};
