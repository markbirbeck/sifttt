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
      let inProgress = false;

      scheduler.scheduleJob(schedule, () => {
        let msg = `Schedule triggered for '${recipe.name}'`;

        /**
         * If the recipe is already running then suggest that the schedule
         * is reduced:
         */

        if (inProgress) {
          console.log(`${msg} but a job is already running: consider reducing the frequency`);
        }

        /**
         * If the recipe is not already running then kick it off:
         */

        else {
          inProgress = true;
          console.log(msg);

          fn().done(() => {
            inProgress = false;
            console.log(`Job '${recipe.name} has completed`);
          });
        }
      });
    } else {
      return fn().done(cb);
    }

  });
};

module.exports = addRecipe;
