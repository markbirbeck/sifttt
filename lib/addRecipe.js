var streamFromRecipe = require('./streamFromRecipe');

var addRecipe = function(gulp, recipe, connections, codecs, channels, opts) {
  connections = connections || {};

  gulp.task(recipe.name, function(cb) {
    return streamFromRecipe(recipe, connections, codecs, channels, opts)
      .done(cb);
  });
};

module.exports = addRecipe;
