'use strict';
const scheduler = require('node-schedule');
var streamFromRecipe = require('./streamFromRecipe');

var addRecipe = function(gulp, recipe, connections, codecs, channels, opts) {
  connections = connections || {};

  gulp.task(recipe.name, function(cb) {
    let fn = streamFromRecipe.bind(null, recipe, connections, codecs, channels, opts);

    /**
     * If a schedule has been specified then use it to repeatedly run
     * the recipe:
     */

    let schedule = recipe.input && recipe.input.schedule;
    if (schedule) {
      scheduler.scheduleJob(schedule, fn);
    } else {
      return fn().done(cb);
    }

  });
};

module.exports = addRecipe;
