var addRecipe = require('./lib/addRecipe');

module.exports = function(gulp, connections, recipes) {
  var channels = require('./lib/channels')(connections, recipes);

  recipes.forEach(function(recipe) {
    addRecipe(gulp, recipe, connections, channels);
  });
}
