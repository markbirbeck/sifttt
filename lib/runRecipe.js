var _ = require('lodash');
var h = require('highland');

var streamFromRecipe = require('./streamFromRecipe');

module.exports = function(recipe, connections, channels) {
  return h.pipeline(function(stream) {
    return stream
    .consume(function (err, file, push, next) {
      if (err) {
        push(err);
        next();
      }
      else if (file === h.nil) {
        push(null, file);
      }
      else {

        /**
         * Replace the glob parameter of the recipe's input with the glob
         * parameter from our file input:
         */

        var r = _.clone(recipe);

        r.input.glob = file.data.glob;
        h(streamFromRecipe(r, connections, channels))
        .each(function(item) {
          push(null, item);
        })
        .done(function() {
          next();
        })
        ;
      }
    })
    ;
  });
};
