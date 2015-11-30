var minimist = require('minimist');
var addRecipe = require('./lib/addRecipe');

/**
 * Pass any command-line options in to addRecipe():
 */

var opts = minimist(process.argv.slice(2));

module.exports = function(gulp, connections, recipes) {
  var channels = require('./lib/channels')(connections, recipes);

  recipes.forEach(function(recipe) {
    addRecipe(gulp, recipe, connections, channels, opts);
  });
}
