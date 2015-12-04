'use strict';

let spawn = require('child_process').spawn;
var minimist = require('minimist');
var addRecipe = require('./lib/addRecipe');
var createApi = require('./lib/api');

/**
 * Pass any command-line options in to addRecipe():
 */

var opts = minimist(process.argv.slice(2));

module.exports = function(gulp, connections, recipes, defaultTaskDependencies) {
  var channels = require('./lib/channels')(connections, recipes);

  recipes.forEach(function(recipe) {
    addRecipe(gulp, recipe, connections, channels, opts);
  });

  /**
   * Add a task that exposes all recipes as endpoints on an API:
   */

  gulp.task('api', createApi(recipes, connections, channels));

  /**
   * If there is a list of dependencies for the default task then create
   * a default task which calls out to those dependencies:
   */

  if (!opts.spawn && defaultTaskDependencies) {
    let tasks = defaultTaskDependencies
      .split(',')
      .map(taskName => taskName.trim())
      ;

    console.log(`Creating default task with ${tasks}`);

    gulp.task('default', cb => {
      let taskList = [];

      tasks.forEach(taskName => {
        let task = spawn('gulp', [taskName, '--spawn']);

        task.stdout.on('data', data => {
          console.log(`stdin for task '${taskName}': ${data}`);
        });

        task.stderr.on('data', data => {
          console.error(`stderr for task '${taskName}': ${data}`);
        });

        task.on('close', code => {
          if (code !== 0) {
            console.error(`task '${taskName}' exited: ${code}`);
          } else {
            console.log(`task '${taskName}' exited successfully`);
          }
        });

        taskList.push(task);
      })
    });
  }
}
