'use strict';
const h = require('highland');
const _ = require('lodash');
const ua = require('universal-analytics');

module.exports = {
  dest: (glob, opts) => {
    return h.pipeline(stream => {
      return stream

      /**
       * Cope with Vinyl and non-Vinyl:
       */

      .map(file => {
        return file.data || (file.contents && JSON.parse(file.contents)) || file;
      })

      /**
       * Add any additional properties specified as options:
       */

      .map(data => {
        if (opts.ga) {
          _.merge(data, opts.ga);
        }
        return data;
      })

      /**
       * Push the data to GA:
       */

      .doto(data => {
        ua((data && data.trackingId) || (glob && glob.trackingId) || (opts && opts.trackingId))
        .event(data, err => {
          if (err) {
            console.error(`An error occurred writing to Google Analytics:${err}`);
          }
        })
        ;
      })
      ;
    });
  }
};
