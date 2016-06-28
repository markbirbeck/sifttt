'use strict';
const moment = require('moment');

module.exports = (date, format, offset) => {

  /**
   * If params.input is empty then we'll get today's date:
   */

  let m = moment(date).utc();

  /**
   * If there's an offset then add it on:
   */

  if (offset) {
    m.add(moment.duration(offset));
  }

  /**
   * If format is undefined then we'll get today's date in ISO 8601
   * format:
   */

  return m.format(format);
}
