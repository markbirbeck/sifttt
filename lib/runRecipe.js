var _ = require('lodash');
var h = require('highland');

var streamFromRecipe = require('./streamFromRecipe');

module.exports = function(recipe, connections, channels) {
  return h()
    .each(function(file) {
      var r = _.clone(recipe);

      r.input.glob = file.data.glob;

      h.pipeline(function(stream) {
        return streamFromRecipe(stream, r, connections, channels, function() {
          if (file.whenDone) {
            file.whenDone();
          }
        });
      });
    });
};
