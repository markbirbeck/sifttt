var objectPath = require('object-path');

module.exports = function checkForSimpleAssignment(data, source) {
  var matches = String(source).match(/^#{(.*)}$/);

  if (matches) {
    return objectPath.get(data, matches[1]);
  }
  return;
}
