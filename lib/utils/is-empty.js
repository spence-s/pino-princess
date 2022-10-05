const isObject = require('./is-object');

/**
 * @param {unknown} object
 * @returns {boolean}
 */
function isEmpty(object) {
  return (
    isObject(object) &&
    (object === undefined ||
      object === null ||
      Object.keys(object).length === 0)
  );
}

module.exports = isEmpty;
