var h = require('highland');
var _ = require('lodash');
var moment = require('moment');

var sheets = require('stream-google-spreadsheet');
var es = require('vinyl-elasticsearch');
var s3 = require('vinyl-s3');
var amqp = require('vinyl-amqp');

var runRecipe = require('./runRecipe');

module.exports = function(connections, recipes) {
  var channels = {
    'google-sheets': sheets,
    googleSheets: sheets,

    elasticsearch: {

      /**
       * Insert a shim before the dest() in vinyl-elasticsearch, which
       * calculates the index to put the event in, if one doesn't already
       * exist:
       */

      dest: function(glob, opts) {
        return h.pipeline(function(stream) {
          return stream
            .map(function(file) {
              if (!file.index) {

                /**
                 * [TODO] Make the field name and format string configurable:
                 */

                var timestamp = file.data.startTime;

                file.index = 'logstash-' +
                  moment(timestamp).format('YYYY-MM-DD');
              }
              return file;
            })
            .through(es.dest(glob, opts));
        });
      }
    },

    s3: s3,

    amqp: amqp,

    runRecipe: {
      dest: function(glob, opts) {
        var recipe = _.filter(recipes, {name: glob})[0];

        if (!recipe) {
          throw new Error('Failed to find recipe: \'' + glob + '\'');
        }
        return runRecipe(recipe, connections, channels);
      }
    },

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
