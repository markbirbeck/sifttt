var h = require('highland');
var _ = require('lodash');

var streamFromRecipe = require('./streamFromRecipe');

var addRecipe = function(gulp, recipe, connections) {
  connections = connections || {};

  gulp.task(recipe.name, function(cb) {
    return h.pipeline(function(stream) {
      return streamFromRecipe(stream, recipe, connections, cb);
    });
  });
};

module.exports = addRecipe;
