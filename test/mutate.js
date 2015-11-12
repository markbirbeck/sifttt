var should = require('chai').should();
var uut = require('../mutate');

describe('mutate', function() {
  describe('assign', function() {
    it('a number', function() {
      uut(
        {'source': 3, 'target': 'a'},
        {'a': 1, 'b': 2}
      )
        .should.eql({'a': 3, 'b': 2});
    });

    it('a string', function() {
      uut(
        {'source': 'hello, world!', 'target': 'a'},
        {'a': 1, 'b': 2}
      )
        .should.eql({'a': 'hello, world!', 'b': 2});
    });

    it('with an expression', function() {
      uut(
        {'source': 'hello, #{b}!', 'target': 'a'},
        {'a': 1, 'b': 'world'}
      )
        .should.eql({'a': 'hello, world!', 'b': 'world'});
    });
  });

  describe('removeField', function() {
    it('a single field', function() {
      uut(
        {'removeField': 'b'},
        {'a': 1, 'b': 2, 'c': 3}
      )
        .should.eql({'a': 1, 'c': 3});
    });

    it('multiple fields', function() {
      uut(
        {'removeField': ['a', 'c']},
        {'a': 1, 'b': 2, 'c': 3}
      )
        .should.eql({'b': 2});
    });
  });
});
