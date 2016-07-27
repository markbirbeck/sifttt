'use strict';

const moment = require('moment');

module.exports = function* (start, end, step, unit, format) {
  if (start === undefined) {
    start = moment().format('YYYY-MM-DD');
  }

  if (end === undefined) {
    end = start;
    start = moment().format('YYYY-MM-DD');
  }

  if (step === undefined) {
    step = 1;
  }

  unit = unit || 'days';
  format = format || 'YYYY-MM-DD';

  let rangeDirection = (start < end) ? 1 : -1;
  let stepDirection = (step < 0) ? -1 : 1;

  /**
   * If the range direction is positive, but the step direction is negative,
   * then reverse the start and end:
   */

  if (rangeDirection === 1 && stepDirection === -1) {
    let tmp = start;
    start = end;
    end = tmp;
  }

  /**
   * If the range direction is negative, ensure that the step is negative, too:
   */

  if (rangeDirection === -1 && stepDirection === 1) {
    step *= -1;
  }

  let index = moment(start);

  do {
    yield index.format(format);
    index.add({[unit]: step});
  } while (step && ((step > 0) ? index.isBefore(end) : index.isAfter(end)));
}
