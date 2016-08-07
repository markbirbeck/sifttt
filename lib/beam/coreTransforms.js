'use strict';

const h = require('highland');

class Map {
  constructor(fn) {
    this._fn = fn;
  }

  apply() {
    return h.map(this._fn);
  }
};

class DoTo extends Map {
  constructor(fn) {
    super(
      x => {
        fn(x);
        return x;
      }
    );
  }
};

class Collect {
  apply() {
    return h.collect();
  }
};

class ParseJSON extends Map {
  constructor() {
    super(
      file => {

        /**
         * If there is no data then convert 'contents' to JSON:
         */

        if (!file.data) {
          try {
            file.data = JSON.parse(String(file.contents));
          } catch (e) {

          }
        }
        return file;
      }
    );
  }
};

exports.Map = Map;
exports.DoTo = DoTo;
exports.Collect = Collect;
exports.ParseJSON = ParseJSON;
