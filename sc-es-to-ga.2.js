'use strict';
const h = require('highland');

let Collection = require('./lib/Collection');
let Pipeline = require('./lib/Pipeline');
let CompositeTransform = require('./lib/CompositeTransform');

/**
 * A transform that increments a field:
 */

let incrementTransformx = fieldName => {
  return s => s
  .doto(element => {
    element[fieldName] = element[fieldName] || 0;
    element[fieldName]++;
  })
  ;
};

class Transform {
  constructor(doto) {
    this.doto = doto;
  }

  apply2() {
    console.log('Transform.apply2');
    return s => s
    .through(this.doto);
  }
};

let incrementTransform = fieldName => {
  return new Transform(element => {
    element[fieldName] = element[fieldName] || 0;
    element[fieldName]++;
  });
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
 * An output writer that just logs each element of a collection:
 */

let outputWriterx = s => s
.doto(element => {
  console.log('outputWriter:', element);
})
;

let outputWriter = new Transform(element => {
  console.log('outputWriter using classes:', element);
});

/**
 * A transform has one or more steps:
 */

let transform = new CompositeTransform()
.apply(incrementTransform('count'))
.apply(incrementTransform('parrot'))
.apply(incrementTransform('dad'))
;

new Pipeline({cmd: 'do something!!'})
.apply(new Collection([{count: 2001, mumsy: 99000}]))
.apply(incrementTransform('mumsy'))
.apply(incrementTransform('parrot'))
.apply(transform)
.apply(outputWriter)
.run(/*() => {
  new Pipeline({cmd: 'do something else!!'})
  .apply(new Collection([{count: 20009, mumsy: 99000}]))
  .apply(transform)
  .apply(incrementTransform('mumsy'))
  .apply(incrementTransform('dad'))
  .apply(outputWriter)
  .run()
  ;
}*/)
;


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
