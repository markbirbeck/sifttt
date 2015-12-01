var minimist = require('minimist');
var addRecipe = require('./lib/addRecipe');
var createApi = require('./lib/api');

/**
 * Pass any command-line options in to addRecipe():
 */

var opts = minimist(process.argv.slice(2));

module.exports = function(gulp, connections, recipes) {
  var channels = require('./lib/channels')(connections, recipes);

  recipes.forEach(function(recipe) {
    addRecipe(gulp, recipe, connections, channels, opts);
  });

  /**
   * Add a task that exposes all recipes as endpoints on an API:
   */

  gulp.task('api', createApi(recipes, connections, channels));
}
