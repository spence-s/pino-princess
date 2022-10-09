function isPinoLog(log: unknown): boolean {
  return Boolean(log && Object.prototype.hasOwnProperty.call(log, 'level'));
}

export default isPinoLog;
