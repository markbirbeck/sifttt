'use strict';
var h = require('highland');
var _ = require('lodash');
var moment = require('moment');

var gulp = require('gulp');
var sheets = require('stream-google-spreadsheet');
var es = require('vinyl-elasticsearch');
var s3 = require('vinyl-s3');
var s3Glob = require('s3-glob');
var amqp = require('vinyl-amqp');
let File = require('vinyl');
const googleAnalytics = require('./sinks/googleAnalytics');

var runRecipe = require('./runRecipe');

module.exports = function(connections, codecs, recipes) {
  var channels = {
    googleAnalytics,

    'google-sheets': sheets,
    googleSheets: sheets,

    gulp: gulp,

    elasticsearch: {

      /**
       * Process the search results into individual Vinyl files. This can probably
       * go into vinyl-elasticsearch, but we'd need to take some of the sifttt-specific
       * out first:
       */

      src: (glob, opts) => {
        let docinfoFields = opts.docinfo_fields || ['_index', '_type', '_id'];
        let docinfoTarget = opts.docinfo_target || '@metadata';

        return es.src(glob, opts)
        .flatMap(function (file) {

          /**
           * The search returns an array of results in hits.hits, so we'll
           * convert that to an array of Vinyl files...
           */

          let hits = file.data.hits.hits;

          console.log(`Got: ${hits.length} records`);
          return h((push, next) => {
            hits.forEach(_data => {
              let data = _data._source;
              let metadata = _.pick(_data, docinfoFields);

              data[docinfoTarget] = metadata;
              let file = new File({
                path: metadata._id,
                contents: new Buffer(JSON.stringify(data))
              });

              file.data = data;
              file.stat = {
                size: file.contents.length
              };

              /**
               * This is not quite right; it should be set in the output
               * phase, and should come from fields defined by options.
               * To get that to work we'd need to add a final step that
               * uses the whole evaljson/params business:
               */

              file.id = metadata._id;
              file.index = metadata._index;
              file.type = metadata._type;

              console.log(`About to push: ${file.id}`);
              push(null, file);
            });

            push(null, h.nil);
          });
        })
        ;
      },

      /**
       * Insert a shim before dest() in vinyl-elasticsearch, which
       * calculates the index to put the event in, the type and an id,
       * if they don't already exist:
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

                file.index = (opts.index || 'logstash-') +
                  moment(timestamp).format('YYYY-MM-DD');
              }
              return file;
            })
            .map(function(file) {
              if (!file.id) {
                if (file.data && file.data.id) {

                  /**
                   * [TODO] Make the field name configurable:
                   */

                  file.id = file.data.id;
                }
              }
              return file;
            })
            .map(function(file) {
              if (!file.type) {
                if (file.data && file.data.type) {

                  /**
                   * [TODO] Make the field name configurable:
                   */

                  file.type = file.data.type;
                }
              }
              return file;
            })
            .through(es.dest(glob, opts));
        });
      }
    },

    s3: s3,

    s3Glob: {
      src: (glob, opts) => {
        let stream = h(new s3Glob(glob, opts));

        return stream
        .map(function(data) {
          let file = new File({
            path: data._id || 'noid',
            contents: new Buffer(JSON.stringify(data))
          });

          file.data = data;
          file.stat = {
            size: file.contents.length
          };
          return file;
        })
        ;
      }
    },

    amqp: amqp,

    runRecipe: {
      dest: function(glob /*, opts*/) {

        /**
         * First grab the recipe that we're going to chain into:
         */

        var recipe = _.filter(recipes, {name: glob})[0];

        if (!recipe) {
          throw new Error('Failed to find recipe: \'' + glob + '\'');
        }
        return runRecipe(recipe, connections, codecs, channels);
      }
    },

    noop: {
      dest: function(/*glob, opts*/) {
        return h()
          .doto(function(/*file*/) { });
      }
    },

    echo: {
      dest: function(/*glob, opts*/) {
        return h()
          .doto(function(file) {
            console.log('[ECHO]: ', file.id || file.path || 'no id or path',
              JSON.stringify(file.data, null, 2) || String(file.contents));
          });
      }
    }
  };

  return channels;
}
