'use strict';

const h = require('highland');

class Context {
  constructor(outputFn, nextFn) {

    /**
     * [TODO] This needs some work, since it will only work if there
     *        is a one-to-one between the input and the output:
     */

    this._outputFn = outputFn;
    this._nextFn = nextFn;
  }

  output(element) {
    this._outputFn(null, element);
    this._nextFn();
  }
};

class ProcessContext extends Context {
  constructor(element, outputFn, nextFn) {
    super(outputFn, nextFn);
    this._element = element;
  }

  element() {
    return this._element;
  }
};

class DoFn {
  constructor(fn) {
    this._fn = fn;
  }

  apply() {
    return h.consume((err, element, push, next) => {
      if (err) {
        push(err);
        next();
        return;
      }

      if (element === h.nil) {
        push(null, h.nil);
        return;
      }

      let pc = new ProcessContext(element, push, next);

      this._fn(pc);
    });
  }
};

module.exports = DoFn;
