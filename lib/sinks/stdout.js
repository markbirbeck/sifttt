'use strict';
const h = require('highland');

module.exports = {
  dest: (/*glob, opts*/) => {
    return h.pipeline(stream => {
      return stream
      .doto(file => {
        console.log(JSON.stringify(file.data || (file.contents && JSON.parse(file.contents)) || file, '', 0));
      });
    });
  }
};
