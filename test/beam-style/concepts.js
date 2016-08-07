/**
 * These tests help to experiment with high-level concepts such as
 * nesting pipelines, chaining pipelines, and so on.
 */

'use strict';
require('chai').should();

const h = require('highland');

/**
 * The first thing we want to do is take in a stream of numbers
 * and operate on them:
 */

describe('basic pipeline', () => {
  it('simple input', (done) => {

    /**
     * Double some elements:
     */

    h([1, 2, 3, 4])
    .map(element => {
      return element * 2;
    })
    .collect()
    .doto(ar => {
      ar.should.eql([2, 4, 6, 8]);
    })
    .done(done)
    ;
  });
});

describe('nested pipeline', () => {
  it('using through() with stream as parameter', (done) => {

    /**
     * Create a pipeline that doubles the elements and adds 3:
     */

    let p = s => s
    .map(element => {
      return element * 2;
    })
    .map(element => {
      return element + 3;
    })
    ;

    /**
     * Triple some elements, run them through the pipeline, and then
     * subtract 2:
     */

    h([1, 2, 3, 4])
    .map(element => {
      return element * 3;
    })
    .through(p)
    .map(element => {
      return element - 2;
    })
    .collect()
    .doto(ar => {
      ar.should.eql([
        (((1 * 3) * 2) + 3) - 2,
        (((2 * 3) * 2) + 3) - 2,
        (((3 * 3) * 2) + 3) - 2,
        (((4 * 3) * 2) + 3) - 2
      ]);
    })
    .done(done)
    ;
  });

  it('using through() with pipeline setup from array of transforms', (done) => {

    /**
     * Create a function that creates a pipeline that triples the
     * elements and adds 7:
     */

    let transforms = [
      h.map(element => {
        return element * 3;
      }),
      h.map(element => {
        return element + 7;
      })
    ];

    /**
     * Highland curries all methods, so we can build the pipeline just
     * before we need it, by passing a stream parameter in to each of
     * the transforms:
     */

    let pipeline = s => transforms.reduce((stream, fn) => fn(stream), s);

    /**
     * Quadruple some elements, run them through the pipeline, and then
     * subtract 20:
     */

    h([2, 3, 7, 6])
    .map(element => {
      return element * 4;
    })
    .through(pipeline)
    .map(element => {
      return element - 20;
    })
    .collect()
    .doto(ar => {
      ar.should.eql([
        (((2 * 4) * 3) + 7) - 20,
        (((3 * 4) * 3) + 7) - 20,
        (((7 * 4) * 3) + 7) - 20,
        (((6 * 4) * 3) + 7) - 20
      ]);
    })
    .done(done)
    ;
  });

  it('call pipeline and ignore results', (done) => {

    /**
     * Create a function that creates a pipeline that triples the
     * elements and adds 7:
     */

    let transforms = [
      h.map(element => {
        return element * 3;
      }),
      h.map(element => {
        return element + 7;
      })
    ];

    let pipeline = s => transforms.reduce((stream, fn) => fn(stream), s);

    /**
     * Create a function that will call a pipeline but then continue the
     * previous pipeline:
     */

    let callPipelineAndIgnoreResults = p => {
      return s => {
        return s = s.consume((err, data, push, next) => {
          if (err) {
            push(err);
            next();
            return;
          }

          if (data === h.nil) {
            push(null, h.nil);
            return;
          }

          h([data])
          .through(p)
          .done(() => {
            push(null, data);
            next();
          })
          ;
        });
      };
    };

    /**
     * Quadruple some elements, run them through the pipeline, and then
     * subtract 20; the results we're expecting should NOT include any results
     * from the pipeline:
     */

    h([2, 3, 7, 6])
    .map(element => {
      return element * 4;
    })
    .through(callPipelineAndIgnoreResults(pipeline))
    .map(element => {
      return element - 20;
    })
    .collect()
    .doto(ar => {
      ar.should.eql([
        (2 * 4) - 20,
        (3 * 4) - 20,
        (7 * 4) - 20,
        (6 * 4) - 20
      ]);
    })
    .done(done)
    ;
  });
});
