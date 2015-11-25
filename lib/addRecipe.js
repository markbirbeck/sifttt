var streamFromRecipe = require('./streamFromRecipe');

var addRecipe = function(gulp, recipe, connections, channels) {
  connections = connections || {};

  gulp.task(recipe.name, function(cb) {
    return streamFromRecipe(recipe, connections, channels)
      .done(cb);
  });
};

module.exports = addRecipe;
