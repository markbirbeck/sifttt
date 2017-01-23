'use strict';

let spawn = require('child_process').spawn;
var minimist = require('minimist');
var addRecipe = require('./lib/addRecipe');
var createApi = require('./lib/api');
let codecs = require('./lib/codecs');

/**
 * Pass any command-line options in to addRecipe():
 */

var opts = minimist(process.argv.slice(2));

module.exports = function(gulp, connections, recipes, defaultTaskDependencies, partitionedTask) {
  var channels = require('./lib/channels')(connections, codecs, recipes);

  recipes.forEach(function(recipe) {
    addRecipe(gulp, recipe, connections, codecs, channels, opts);
  });

  /**
   * Add a task that exposes all recipes as endpoints on an API:
   */

  gulp.task('api', createApi(recipes, connections, codecs, channels));
  gulp.task('api2', function(/*cb*/) {
    var wrap = require('gulp-endpoint');
    wrap(gulp);
  });

  /**
   * If there is a partitioned task...:
   */

  if (!opts.spawn && partitionedTask) {
    let taskName = partitionedTask;

    console.log(`Creating partitioned task with ${taskName}`);

    gulp.task(partitionedTask, (/*cb*/) => {
      let childList = [];

      let numWorkers = opts.numWorkers || require('os').cpus().length;

      for (let worker = 1; worker <= numWorkers; worker++) {
        let task = spawn('gulp', [
          taskName + 'Worker',
          '--spawn',
          `--worker=${worker}`,
          `--numWorkers=${numWorkers}`,
          `--input=${opts.input}`,
        ]);
        let workerName = `${taskName}-${worker}`;

        task.stdout.on('data', data => {
          console.log(`[${workerName}]: ${data}`);
        });

        task.stderr.on('data', data => {
          console.error(`[${workerName}]: error: ${data}`);
        });

        task.on('close', code => {
          if (code !== 0) {
            console.error(`[${workerName}]: exited with error: ${code}`);
          } else {
            console.log(`[${workerName}]: exited successfully`);
          }

          /**
           * Remove the finished task from the list:
           */

          for (let i = 0; i < childList.length; i++) {
            if (childList[i].name === workerName) {
              delete childList[i];
            }
          }

          /**
           * Exit when there are no children left:
           */

          if (!childList.length) {
            process.exit(0);
          }
        });

        childList.push({name: taskName, task});
      }
    });
  }

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

    gulp.task('default', (/*cb*/) => {
      let childList = [];

      tasks.forEach(taskName => {
        let task = spawn('gulp', [taskName, '--spawn']);

        task.stdout.on('data', data => {
          console.log(`[${taskName}]: ${data}`);
        });

        task.stderr.on('data', data => {
          console.error(`[${taskName}]: error: ${data}`);
        });

        task.on('close', code => {
          if (code !== 0) {
            console.error(`[${taskName}]: exited with error: ${code}`);
          } else {
            console.log(`[${taskName}]: exited successfully`);
          }

          /**
           * Terminate all tasks before we exit:
           */

          childList.forEach(child => {
            console.warn(`killing child task '${child.name}'`);
            child.task.kill();
          });

          /**
           * Propagate the error code:
           */

          process.exit(code);
        });

        childList.push({name: taskName, task});
      })
    });
  }
  return opts;
}
