'use strict';

/**
 * This function ensures that we have everything we need for an ES insert
 * (index, type and id):
 */

const moment = require('moment');

module.exports = (opts) => {
  return (element) => {
    element.id = element.id || element['@id'];
    element.type = element.type || element['@type'];
    if (!element.index) {

      /**
       * [TODO] Make the field name and format string configurable:
       */

      let timestamp = element.startTime || element.dateModified;
      let pattern = opts.elasticsearchIndexOutput || opts.elasticsearchIndex || '[logstash-]YYYY.MM.dd';

      element.index = moment(timestamp).format(pattern);
    }
  };
};
