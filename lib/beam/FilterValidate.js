const Ajv = require('ajv');
let ajv = new Ajv({})

module.exports = (opts) => {
  let validate = ajv.compile(require(opts.schema));

  return (element) => {
    let valid = validate(JSON.parse(JSON.stringify(element)));

    if (!valid) {
      validate.errors.forEach((e) => {
        console.error(`Failed to validate '${JSON.stringify(element)}': ${e.dataPath} ${e.message}`);
      })
    }
    return valid;
  }
};
