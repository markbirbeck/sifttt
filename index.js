var sheets = require('stream-google-spreadsheet');
var es = require('vinyl-elasticsearch');

var channels = {
  'google-sheets': sheets,
  googleSheets: sheets,

  elasticsearch: es
};

var addRecipe = function(gulp, recipe) {
  var _if = recipe.if;
  var _then = recipe.then;

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
