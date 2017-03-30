'use strict';
const h = require('highland');

module.exports = {
  dest: (glob, opts) => {
    return h.pipeline(stream => {
      return stream
      .doto(file => {

        /**
         * If we have something in .data, use that, if not then parse
         * .contents, and finally, if we don't have anything in .contents
         * either, then just use the entire object passed in (i.e., file):
         */

        let data = file.data || (file.contents && JSON.parse(file.contents)) || file;

        if (typeof data !== 'string') {
          data = JSON.stringify(data, '', -1);
        }
        if (opts.verbose) {
          console.error(`Write to stdout (${opts.modulePath}): Begin:`);
          console.error(data);
        }
        console.log(data);
        if (opts.verbose) {
          console.error(`Write to stdout (${opts.modulePath}): End:`);
        }
      });
    });
  }
};
