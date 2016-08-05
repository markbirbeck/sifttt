'use strict';
const h = require('highland');

const Pipeline = require('./lib/Pipeline');
const CompositeTransform = require('./lib/CompositeTransform');

/**
 * A transform that increments a field:
 */

let incrementTransform = fieldName => {
  return s => s
  .doto(element => {
    element[fieldName] = element[fieldName] || 0;
    element[fieldName]++;
  })
  ;
};

/**
 * We can either create a new pipeline that will get bolted in:
 */

let inputCollectionx = s => s
.flatMap(() => {
  return h([{count: 2, mum: 99}]);
})
;

/**
 * Or we can return a duplex stream:
 */

let inputCollection = () => {
  return h([{count: 200000, mumsy: 99}]);
};

/**
 * An output writer that just logs each element of a collection:
 */

let outputWriter = s => s
.doto(element => {
  console.log('outputWriter:', element);
})
;

/**
 * A transform has one or more steps:
 */
let transform = new CompositeTransform()
.apply(incrementTransform('count'))
// .apply(incrementTransform('parrot'))
// .apply(incrementTransform('dad'))
;

/**
 * A pipeline that has its own input, and a few transform steps:
 */

// let pipeline = s => s
// .through(inputCollection())
// .through(transform)
// .through(outputWriter)
// ;

/**
 * General pipeline runner:
 */

// pipeline.run = function(_params) {
//   return h([_params])
//   .doto(params => {
//     console.log('About to run command:', params);
//   })
//   .through(this)
//   ;
// }

let pipeline = new Pipeline({cmd: 'do something!!'})
.apply(inputCollection())
.apply(outputWriter)
.apply(incrementTransform('parrot'))
.apply(outputWriter)
.apply(transform.apply2())
.apply(outputWriter)
;

// let result = pipeline.run({cmd: 'do something!!'});
/*let result =*/ pipeline.run();

/*
sifttt()
.input() // query for each person's search specification
.flatMap(searchSpecification => {
  sifttt()
  .input() // query for all actions as defined by query
  .flatMap(action => {
    sifttt(action)
    .map() // convert the data to the right format for Google Analytics
    .output() // write to GA
    ;
  })
  .output() // set flag on each action
  ;
})
.output() // some kind of indication about each person's status
;
*/
