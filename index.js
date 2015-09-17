var _ = require('lodash');
var h = require('highland');

var sheets = require('stream-google-spreadsheet');
var es = require('vinyl-elasticsearch');
var s3 = require('vinyl-s3');

var channels = {
  'google-sheets': sheets,
  googleSheets: sheets,

  elasticsearch: es,

  s3: s3
};

var addRecipe = function(gulp, recipe, connections) {
  connections = connections || {};

  var _if = _.merge({opts: connections[recipe.if.channel]}, recipe.if);
  var _then = _.merge({opts: connections[recipe.then.channel]}, recipe.then);

  var src = channels[_if.channel].src;
  var dest = channels[_then.channel].dest;

  gulp.task(recipe.name, function(cb) {
    return h.pipeline(function(stream) {
      return stream
        .pipe(src(_if.glob, _if.opts))
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
