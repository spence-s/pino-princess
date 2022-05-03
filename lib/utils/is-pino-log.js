module.exports = isPinoLog;

function isPinoLog(log) {
  return log && Object.prototype.hasOwnProperty.call(log, 'level');
}
