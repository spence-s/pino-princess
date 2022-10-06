const chalk = require('chalk');
const dayjs = require('dayjs');
const prettyMs = require('pretty-ms');
// const isEmpty = require('./is-empty');
// const isObject = require('./is-object');

/**
 * @typedef {import('./types').Formatters} Formatters
 * @typedef {import('./types').Levels} Levels
 * @typedef {import('./types').Colors} Colors
 * @typedef {import('./types').MessageObj} MessageObj
 */

const nl = '\n';
/** @type {Formatters} */
let formatters;

/**
 * @param {Formatters} _formatters
 * @returns {Formatters}
 */
module.exports = (_formatters) => {
  formatters = _formatters;

  return {
    formatLevel,
    formatLoadTime,
    formatDate,
    formatName,
    formatMessage,
    formatBundleSize,
    formatNs,
    formatExtraFields,
    formatMethod,
    formatStack,
    formatUrl,
    formatStatusCode,
    formatErrorProp,
  };
};

const emojiMap = {
  warn: '⚠️',
  info: '✨',
  userlvl: '✨',
  error: '🚨',
  debug: '🐛',
  fatal: '💀',
  trace: '🔍',
};

/** @type {Record<Levels | 'userlvl', Colors>} */
const colorMap = {
  warn: 'yellow',
  info: 'cyan',
  userlvl: 'cyan',
  error: 'red',
  debug: 'blue',
  trace: 'white',
  fatal: 'red',
};

/**
 * @name isWideEmoji
 * @param {string} character
 * @returns {boolean}
 */
function isWideEmoji(character) {
  return character !== '⚠️';
}

/**
 * @name formatLevel
 * @param {Levels | 'userlvl'} level
 * @returns {string}
 */
function formatLevel(level) {
  if (formatters.formatLevel) return formatters.formatLevel(level, {chalk});
  if (!emojiMap?.[level]) return '';
  const endlen = 5;
  const emoji = emojiMap[level];
  const padding = isWideEmoji(emoji) ? ' ' : '  ';
  const formattedLevel = chalk[colorMap[level]](level.toUpperCase());
  const endPadding = endlen - level.length;
  return emoji + padding + formattedLevel + ''.padEnd(endPadding, ' ');
}

/**
 * @name formatLoadTime
 * @param {string|number} elapsedTime
 * @returns {string}
 */
function formatLoadTime(elapsedTime) {
  if (formatters.formatLoadTime)
    return formatters.formatLoadTime(elapsedTime, {chalk});
  const elapsed =
    typeof elapsedTime === 'string'
      ? Number.parseInt(elapsedTime, 10)
      : elapsedTime;
  const time = prettyMs(elapsed);
  return elapsed > 500
    ? chalk.red(time)
    : elapsed > 250
    ? chalk.yellow(time)
    : chalk.green(time);
}

/**
 * @name formatDate
 * @param {string|number} instant
 * @returns {string}
 */
function formatDate(instant) {
  if (formatters.formatDate) return formatters.formatDate(instant, {chalk});
  return chalk.gray(dayjs(instant).format('H:mm:ss'));
}

/**
 * @name formatName
 * @param {string} name
 * @returns {string}
 */
function formatName(name) {
  if (formatters.formatName) return formatters.formatName(name, {chalk});

  if (!name) return '';

  return `- ${chalk.blue(name)}:`;
}

/**
 * @name formatMessage
 * @param {MessageObj} obj
 * @returns {string}
 */
function formatMessage({level, message}) {
  if (formatters.formatMessage)
    return formatters.formatMessage({level, message}, {chalk});
  if (typeof message === 'undefined') return '';
  message = formatMessageName(message);
  let pretty = '';
  if (level === 'error') pretty = chalk.red(message);
  if (level === 'trace') pretty = chalk.cyan(message);
  if (level === 'warn') pretty = chalk.yellow(message);
  if (level === 'debug') pretty = chalk.white(message);
  if (level === 'info' || level === 'userlvl') pretty = chalk.white(message);
  if (level === 'fatal') pretty = chalk.white.bgRed(message);

  return pretty;
}

/**
 * @name formatMessageName
 * @param {string} message
 * @returns {string}
 */
function formatMessageName(message) {
  if (message === 'request') return '<--';
  if (message === 'response') return '-->';
  return message;
}

/**
 * @name formatBundleSize
 * @param {string} bundle
 * @returns {string}
 */
function formatBundleSize(bundle) {
  const bytes = Number.parseInt(bundle, 10);
  const size = `${bytes}B`;
  return chalk.gray(size);
}

/**
 * @param {string} name
 * @returns {string}
 */
function formatNs(name) {
  return chalk.cyan(name);
}

/**
 * @param {string} url
 * @returns {string}
 */
function formatUrl(url) {
  return chalk.magenta(url);
}

/**
 * @param {string} method
 * @returns {string}
 */
function formatMethod(method) {
  return method ? chalk.white(method) : '';
}

/**
 * @param {string|number} statusCode
 * @returns {string}
 */
function formatStatusCode(statusCode = 'xxx') {
  return chalk[
    statusCode < 300 ? 'green' : statusCode < 500 ? 'yellow' : 'red'
  ](statusCode);
}

/**
 * @param {string} stack
 * @returns {string}
 */
function formatStack(stack) {
  return stack ? chalk.grey(nl + stack) : '';
}

/**
 * @param {Partial<import('pino').SerializedError>} errorPropValue
 * @returns {string}
 */
function formatErrorProp(errorPropValue) {
  if (
    errorPropValue.type &&
    ['Error', 'TypeError'].includes(errorPropValue.type)
  ) {
    delete errorPropValue.type;
    if (errorPropValue.stack) delete errorPropValue.stack;
    if (errorPropValue.message) delete errorPropValue.message;
  }

  if (Object.keys(errorPropValue).length === 0) return '';

  return nl + chalk.grey(JSON.stringify(errorPropValue));
}

/**
 * @param {Record<string, any>} extraFields
 * @returns {string}
 */
function formatExtraFields(extraFields) {
  // const deepClean = (obj) => {
  //   for (const val of Object.keys(obj)) {
  //     if (isObject(obj) && isEmpty(obj[val])) {
  //       delete obj[val];
  //     } else if (isObject(obj[val])) obj[val] = deepClean(obj[val]);
  //   }

  //   return obj;
  // };

  // deepClean(extraFields);

  // if (isEmpty(extraFields)) return '';

  return nl + chalk.grey(JSON.stringify(extraFields, null, 2));
}
