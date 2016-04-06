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

var runRecipe = require('./runRecipe');

module.exports = function(connections, recipes) {
  var channels = {
    'google-sheets': sheets,
    googleSheets: sheets,

    gulp: gulp,

    elasticsearch: {
      src: es.src,

      /**
       * Insert a shim before dest() in vinyl-elasticsearch, which
       * calculates the index to put the event in and an id, if they
       * don't already exist:
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
            .map(function(file) {
              if (file.data && file.data.id) {

                /**
                 * [TODO] Make the field name configurable:
                 */

                file.id = file.data.id;
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
        return runRecipe(recipe, connections, channels);
      }
    },

    noop: {
      dest: function(/*glob, opts*/) {
        return h()
          .each(function(/*file*/) { });
      }
    },

    echo: {
      dest: function(/*glob, opts*/) {
        return h()
          .each(function(file) {
            console.log('[ECHO]: ', file.id || file.path || 'no id or path',
              JSON.stringify(file.data) || String(file.contents));
          });
      }
    }
  };

  return channels;
}
