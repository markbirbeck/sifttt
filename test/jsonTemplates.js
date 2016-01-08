'use strict';
require('chai').should();

let uut = require('../lib/jsonTemplates');

//evaljson doesn't copy objects across properly
//object-builder treats everything as a path...evaljson is better in that respect

describe('jsonTemplates', () => {
  describe('using self as data', () => {
    describe('simple assignment', () => {
      it('a number', () => {
        uut({ a: 1, b: '#{a}' })
        .should.deep.equal({ a: 1, b: 1 })
      });

      it('an object', () => {
        uut({
          a: '#{b}',
          b: 2,
          c: '#{d}',
          d: { e: 4 }
        })
        .should.deep.equal({
          a: 2,
          b: 2,
          c: { e: 4 },
          d: { e: 4 }
        });
      });

      it('an array', () => {
        uut({
          a: '#{b}',
          b: 2,
          c: '#{d}',
          d: [
            { e: 4 }
          ]
        })
        .should.deep.equal({
          a: 2,
          b: 2,
          c: [
            { e: 4 }
          ],
          d: [
            { e: 4 }
          ]
        });
      });
    });

    describe('multiple assignments to a string', () => {
      it('two strings', () => {
        uut({
          a: '#{b}, #{c}!',
          b: 'Hello',
          c: 'World'
        })
        .should.deep.equal({
          a: 'Hello, World!',
          b: 'Hello',
          c: 'World'
        });
      });

      it('objects should be JSONified', () => {
        uut({
          a: '#{b}, #{c}!',
          b: 'Hello',
          c: { d: 'World' }
        })
        .should.deep.equal({
          a: 'Hello, {"d":"World"}!',
          b: 'Hello',
          c: { d: 'World' }
        });
      });

      it('arrays should be JSONified', () => {
        uut({
          a: '#{b}, #{c}!',
          b: 'Hello',
          c: [{ d: 'World' }]
        })
        .should.deep.equal({
          a: 'Hello, [{"d":"World"}]!',
          b: 'Hello',
          c: [{ d: 'World' }]
        });
      });
    });
  });

  describe('using separate data', () => {
    describe('simple assignment', () => {
      it('a number', () => {
        uut(
          { a: 1, b: '#{a}' },
          { a: 3, b: 4 }
        )
        .should.deep.equal({ a: 1, b: 3 });
      });

      it('an object', () => {
        uut(
          { a: '#{a}', b: '#{b}' },
          { a: 3, b: { c: 7 } }
        )
        .should.deep.equal({ a: 3, b: { c: 7 }});
      });
    });
  });
});
