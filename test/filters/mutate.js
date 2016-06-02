/**
 * Test mutate filter.
 *
 * Note that the conditional tests are in their own file.
 */

require('chai').should();
var uut = require('../../lib/filters/mutate');

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

    it('with multiple expressions', function() {
      uut(
        {'source': '#{b}, #{c}!', 'target': 'a'},
        {'a': 1, 'b': 'hello', 'c': 'world'}
      )
        .should.eql({'a': 'hello, world!', 'b': 'hello', 'c': 'world'});
    });

    it('with direct assignment', function() {
      uut(
        {'source': '#{b.c}', 'target': 'a'},
        {'a': 1, 'b': {'c': 2}}
      )
        .should.eql({'a': 2, 'b': {'c': 2}});
    });

    it('invalid source', function() {
      (function() {
        uut(
          {'source': 'hello, #{c}!', 'target': 'a'},
          {'a': 1, 'b': 'world'}
        );
      }).should.throw('Unable to assign to \'a\': Unknown expression:c');
    });

    describe('nested', function() {
      describe('source', function() {
        it('one level', function() {
          uut(
            {'source': '#{a.c}', 'target': 'b'},
            {'a': {'c': 1}, 'b': 2}
          )
          .should.eql({'a': {'c': 1}, 'b': 1});
        });

        it('two levels', function() {
          uut(
            {'source': '#{a.c.d}', 'target': 'b'},
            {'a': {'c': {'d' : 1}}, 'b': 2}
          )
          .should.eql({'a': {'c': {'d': 1}}, 'b': 1});
        });
      });

      describe('target', function() {
        it('one level', function() {
          uut(
            {'source': 3, 'target': 'a.c'},
            {'a': {'c': 1}, 'b': 2}
          )
          .should.eql({'a': {'c': 3}, 'b': 2});

          uut(
            {'source': 3, 'target': 'a.c'},
            {'a': {}}
          )
          .should.eql({'a': {'c': 3}});
        });

        it('two levels', function() {
          uut(
            {'source': 3, 'target': 'a.c.d'},
            {'a': {'c': {'d' : 1}}, 'b': 2}
          )
          .should.eql({'a': {'c': {'d': 3}}, 'b': 2});

          uut(
            {'source': 3, 'target': 'a.c.d'},
            {'a': {}}
          )
          .should.eql({'a': {'c': {'d': 3}}});
        });
      });
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

  describe('convert', function() {
    it('number', function() {
      uut(
        {'convert': {'a': 'number'}},
        {'a': '1'}
      )
        .should.eql({'a': 1});
    });

    it('string', function() {
      uut(
        {'convert': {'a': 'string'}},
        {'a': 1}
      )
        .should.eql({'a': '1'});
    });

    it('date in seconds', function() {
      uut(
        {'convert': {'a': 'date'}},
        {'a': 1446807983}
      )
        .should.eql({'a': '2015-11-06T11:06:23.000Z'});
    });

    it('date in milliseconds', function() {
      uut(
        {'convert': {'a': 'date'}},
        {'a': 1446807983000}
      )
        .should.eql({'a': '2015-11-06T11:06:23.000Z'});
    });

    it('missing date', function() {
      uut(
        {'convert': {'a': 'date'}},
        {'a': ''}
      )
      .should.eql({'a': ''});

      uut(
        {'convert': {'a': 'date'}},
        {'a': undefined}
      )
      .should.eql({a: undefined});

      uut(
        {'convert': {'a': 'date'}},
        {'a': null}
      )
      .should.eql({a: null});
    });

    it('invalid', function() {
      (function() {
        uut(
          {'convert': {'a': 'invalid'}},
          {'a': 'Some text'}
        );
      }).should.throw('No type conversion for \'invalid\'');
    });
  });
});
