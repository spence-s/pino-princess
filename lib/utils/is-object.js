module.exports = isObject;

/**
 * @name isObject
 * @param {any} input
 * @returns {boolean} true if input is object, false otherwise
 */
function isObject(input) {
  return input && Object.prototype.toString.apply(input) === '[object Object]';
}
