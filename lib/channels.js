'use strict';
var h = require('highland');
var _ = require('lodash');

var gulp = require('gulp');
var sheets = require('stream-google-spreadsheet');
var s3 = require('vinyl-s3');
var s3Glob = require('s3-glob');
var amqp = require('vinyl-amqp');
let File = require('vinyl');
const googleAnalytics = require('./sinks/googleAnalytics');
const echo = require('./sinks/echo');
const elasticsearch = require('./sinks/elasticSearch');

var runRecipe = require('./runRecipe');

module.exports = function(connections, codecs, recipes) {
  var channels = {
    googleAnalytics,

    'google-sheets': sheets,
    googleSheets: sheets,

    gulp: gulp,

    elasticsearch,

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

    echo
  };

  return channels;
}
