var _ = require('lodash');

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

  gulp.task(recipe.name, function() {
    var stream = src(_if.glob, _if.opts);

    if (recipe.map) {
      stream = stream
        .map(recipe.map)
    }

    return stream
      .pipe(dest(_then.glob, _then.opts));
  });
};

exports.addRecipe = addRecipe;
exports.channels = channels;
