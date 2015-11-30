var streamFromRecipe = require('./streamFromRecipe');

var addRecipe = function(gulp, recipe, connections, channels, opts) {
  connections = connections || {};

  gulp.task(recipe.name, function(cb) {
    return streamFromRecipe(recipe, connections, channels, opts)
      .done(cb);
  });
};

module.exports = addRecipe;
