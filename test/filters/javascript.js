require('chai').should();
var uut = require('../../lib/filters/javascript');

describe('javascript', function() {
  it('should evaluate percentage', function() {
    uut(
      {code: 'event.c = (event.a / event.b) * 100'},
      {a: 1, b: 2}
    )
    .should.eql({a: 1, b: 2, c: 50});
  });

  it('should throw syntax error', function() {
    (function() {
      uut(
        {code: 'event.c = '},
        {a: 1, b: 2}
      )
    })
    .should.throw('Unable to evaluate JavaScript \'event.c = \': SyntaxError: Unexpected token ;');
  });
});
