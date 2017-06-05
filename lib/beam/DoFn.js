'use strict';

const h = require('highland');

class Context {
  constructor(outputFn) {

    /**
     * [TODO] This needs some work, since it will only work if there
     *        is a one-to-one between the input and the output:
     */

    this._outputFn = outputFn;
  }

  output(element) {
    this._outputFn(null, element);
  }
};

class ProcessContext extends Context {
  constructor(element, outputFn) {
    super(outputFn);
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

      let pc = new ProcessContext(element, push);

      this._fn(pc);
      next()
    });
  }
};

module.exports = DoFn;
