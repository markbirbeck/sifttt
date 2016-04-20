'use strict';

/**
 * Test the 'line' codec on its own, i.e., not in a recipe:
 */

var path = require('path');
var fs = require('fs');
require('chai').should();
let h = require('highland');
let uut = require('../../lib/codecs/line');

let readFile = filename => {
  return h((push) => {
    fs.readFile(filename, (err, data) => {
      push(err, data);
      push(null, h.nil);
    });
  });
};

describe('line codec', () => {
  it('should read a file', done => {
    let codec = uut();

    h([
      path.join(__dirname, '../fixtures/file.csv')
    ])
    .consume((err, filename, push, next) => {
      if (err) {
        push(err);
        next();
      } else if (filename === h.nil) {
        push(null, h.nil);
      } else {
        readFile(filename)
        .through(codec)
        .doto(push.bind(undefined, null)) /* push(null, item) */
        .done(next)
      }
    })
    .collect()
    .doto(ar => {
      ar.should.eql([
        {'message': 'greeting'},
        {'message': 'hello'},
        {'message': 'bonjour'},
        {'message': 'howdy'}
      ]);
    })
    .done(done)
    ;
  });

  it('should read two files', done => {
    let codec = uut();

    h([
      path.join(__dirname, '../fixtures/file.csv'),
      path.join(__dirname, '../fixtures/file2.csv')
    ])
    .consume((err, filename, push, next) => {
      if (err) {
        push(err);
        next();
      } else if (filename === h.nil) {
        push(null, h.nil);
      } else {
        readFile(filename)
        .through(codec)
        .doto(push.bind(undefined, null)) /* push(null, item) */
        .done(next)
      }
    })
    .collect()
    .doto(ar => {
      ar.should.eql([
        {'message': 'greeting'},
        {'message': 'hello'},
        {'message': 'bonjour'},
        {'message': 'howdy'},

        {'message': 'greeting'},
        {'message': 'wotcha'},
        {'message': 'bona sera'}
      ]);
    })
    .done(done)
    ;
  });

  describe('should skip first line', () => {
    let codec = uut({drop: 1});

    it('of a file', done => {
      h([
        path.join(__dirname, '../fixtures/file.csv')
      ])
      .consume((err, filename, push, next) => {
        if (err) {
          push(err);
          next();
        } else if (filename === h.nil) {
          push(null, h.nil);
        } else {
          readFile(filename)
          .through(codec)
          .doto(push.bind(undefined, null)) /* push(null, item) */
          .done(next)
        }
      })
      .collect()
      .doto(ar => {
        ar.should.eql([
          {'message': 'hello'},
          {'message': 'bonjour'},
          {'message': 'howdy'}
        ]);
      })
      .done(done)
      ;
    });

    it('of each of two files', done => {
      h([
        path.join(__dirname, '../fixtures/file.csv'),
        path.join(__dirname, '../fixtures/file2.csv')
      ])
      .consume((err, filename, push, next) => {
        if (err) {
          push(err);
          next();
        } else if (filename === h.nil) {
          push(null, h.nil);
        } else {
          readFile(filename)
          .through(codec)
          .doto(push.bind(undefined, null)) /* push(null, item) */
          .done(next)
        }
      })
      .collect()
      .doto(ar => {
        ar.should.eql([
          {'message': 'hello'},
          {'message': 'bonjour'},
          {'message': 'howdy'},

          {'message': 'wotcha'},
          {'message': 'bona sera'}
        ]);
      })
      .done(done)
      ;
    });
  });
});

