'use strict';
const _ = require('lodash');
const File = require('vinyl');

let toVinyl = obj => {
  var file = new File();
  var data = _.cloneDeep(obj._source || obj);

  /**
   * Set the path of the entry to the URL property, if it exists:
   */

  file.path = obj.url || '';

  /**
   * Set the data properties:
   *
   * If the data returned is a string then try to parse it as JSON:
   */

  if (typeof data === 'string') {
    try {
      file.data = JSON.parse(data);
    } catch (e) {
      file.data = data;
    }
  } else {
    file.data = data;
  }

  file.contents = new Buffer(JSON.stringify(data));

  file.stat = {
    size: file.contents.length
  };

  /**
   * If there are any ElasticSearch properties, copy them, too:
   */

  file.index = obj._index;
  file.type = obj._type;
  file.id = obj._id;

  return file;
}

module.exports = toVinyl;
