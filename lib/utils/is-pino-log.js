module.exports = isPinoLog;

/**
 * @name isPinoLog
 * @param {unknown} log
 * @returns {boolean} true if pino log, false otherwise
 */
function isPinoLog(log) {
  return Boolean(log && Object.prototype.hasOwnProperty.call(log, 'level'));
}
