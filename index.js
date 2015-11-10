var _ = require('lodash');
var h = require('highland');
var File = require('vinyl');

var sheets = require('stream-google-spreadsheet');
var es = require('vinyl-elasticsearch');
var s3 = require('vinyl-s3');

var channels = {
  'google-sheets': sheets,
  googleSheets: sheets,

  elasticsearch: es,

  s3: s3,

  echo: {
    dest: function(glob, opts) {
      return h()
        .each(function(file) {
          console.log('[ECHO]: ', file.id || file.path, (file.data) ?
            file.data : String(file.contents));
        });
    }
  }
};

function toVinyl(obj) {
  var file = new File();
  var data = _.clone(obj);

  /**
   * Set the path of the entry to the URL property, if it exists:
   */

  file.path = data.url || '';

  /**
   * Remove the ID that comes from Google Sheets so as to avoid
   * confusion with other IDs such as those for ElasticSearch:
   */

  delete data.id;

  /**
   * Set the data properties:
   */

  file.data = data;
  file.contents = new Buffer(data);

  return file;
}

var addRecipe = function(gulp, recipe, connections) {
  connections = connections || {};

  var _if = _.merge({opts: connections[recipe.if.channel]}, recipe.if);
  var _then = _.merge({opts: connections[recipe.then.channel]}, recipe.then);

  var src = channels[_if.channel].src;
  var dest = channels[_then.channel].dest;

  gulp.task(recipe.name, function(cb) {
    return h.pipeline(function(stream) {
      return stream
        .pipe(h(src(_if.glob, _if.opts)))
        .consume(function(err, file, push, next) {

          /*
           * Forward any errors:
           */

          if (err) {
            push(err);
            next();
            return;
          }

          /**
           * Check to see if we're finished:
           */

          if (file === h.nil) {
            push(null, file);
            return;
          }

          /**
           * If we're not expanding arrays or there is no data then move on:
           */

          if (!_if.arrayExpand || (!file.data && !file.contents)) {
            push(null, file);
            next();
            return;
          }

          /**
           * If there is no data then convert the contents to JSON:
           */

          if (!file.data) {
            file.data = JSON.parse(String(file.contents));
          }

          /**
           * If we don't have an array then there is nothing to do:
           */

          if (!Array.isArray(file.data)) {
            push(null, file);
            next();
            return;
          }

          /**
           * Finally, create a new Vinyl file for each entry in the array:
           */

          file.data
            .forEach(function(entry) {
              push(null, toVinyl(entry));
            });
          next();
        })
        .map(function(file) {
          return (recipe.map) ? recipe.map(file) : file;
        })
        .pipe(dest(_then.glob, _then.opts))
        .done(cb)
        ;
    });
  });
};

exports.addRecipe = addRecipe;
exports.channels = channels;
