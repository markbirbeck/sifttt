'use strict';
const _ = require('lodash');
const File = require('vinyl');

let toVinyl = obj => {
  var file = new File();
  var data = _.cloneDeep(obj);

  /**
   * Set the path of the entry to the URL property, if it exists:
   */

  file.path = data.url || '';

  /**
   * Set the data properties:
   */

  file.data = data;
  file.contents = new Buffer(JSON.stringify(data));

  file.stat = {
    size: file.contents.length
  };

  return file;
}

module.exports = toVinyl;
