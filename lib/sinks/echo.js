'use strict';
const h = require('highland');

module.exports = {
  dest: (glob, opts) => {
    return h.pipeline(stream => {
      return stream
      .doto(file => {
        console.log('[ECHO]: ', file.id || file.path || 'no id or path',
          JSON.stringify(file.data, null, 2) || String(file.contents));
      });
    });
  }
};
