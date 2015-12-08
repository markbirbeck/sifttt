require('chai').should();
var uut = require('../../lib/filters')();

describe('conditional', function() {
  describe('mutate', function() {
    it('property does not exist', function() {
      uut
      .mutate(
        {
          'if': '#{missingProperty}',
          'source': 'hello, world!',
          'target': 'a'
        },
        {'a': 1, 'b': 2}
      )
      .should.eql({'a': 1, 'b': 2});
    });

    it('property does exist', function() {
      uut
      .mutate(
        {
          'if': '#{b}',
          'source': 'hello, world!',
          'target': 'a'
        },
        {'a': 1, 'b': 2}
      )
      .should.eql({'a': 'hello, world!', 'b': 2});
    });
  });

  describe('json', function() {
    it('property does not exist', function() {
      uut
      .json(
        {
          'if': '#{missingProperty}',
          source: 'a',
          target: 'b'
        },
        {a: '{"c": 1}'}
      )
      .should.eql({a: '{"c": 1}'});
    });

    it('property does exist', function() {
      uut
      .json(
        {
          'if': '#{c}',
          source: 'a',
          target: 'b'
        },
        {a: '{"c": 1}', c: true}
      )
      .should.eql({a: '{"c": 1}', b: {c: 1}, c: true});
    });
  });
});
