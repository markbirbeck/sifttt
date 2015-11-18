var h = require('highland');

var sheets = require('stream-google-spreadsheet');
var es = require('vinyl-elasticsearch');
var s3 = require('vinyl-s3');

module.exports = function(connections, recipes) {
  var channels = {
    'google-sheets': sheets,
    googleSheets: sheets,

    elasticsearch: es,

    s3: s3,

    noop: {
      dest: function(glob, opts) {
        return h()
          .each(function(file) { });
      }
    },

    echo: {
      dest: function(glob, opts) {
        return h()
          .each(function(file) {
            console.log('[ECHO]: ', file.id || file.path || 'no id or path',
              file.data || String(file.contents));
          });
      }
    }
  };

  return channels;
}
