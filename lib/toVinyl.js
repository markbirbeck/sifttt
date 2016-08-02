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
   * Remove the ID that comes from Google Sheets so as to avoid
   * confusion with other IDs such as those for ElasticSearch:
   */

  delete data.id;

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
