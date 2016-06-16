'use strict';

module.exports = function* (start, end, step) {
  if (start === undefined) {
    start = 0;
  }

  if (end === undefined) {
    end = start;
    start = 0;
  }

  if (step === undefined) {
    step = 1;
  }

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

  let index = start;

  do {
    yield index;
    index += step;
  } while (step && ((step > 0) ? index < end : index > end));
}
