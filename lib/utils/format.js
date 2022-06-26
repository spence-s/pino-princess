const chalk = require('chalk');
const dayjs = require('dayjs');
const prettyMs = require('pretty-ms');
const isEmpty = require('./is-empty');

const nl = '\n';
let formatters;

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
  error: '🚨',
  debug: '🐛',
  fatal: '💀',
  trace: '🔍',
};

const colorMap = {
  warn: 'yellow',
  info: 'cyan',
  error: 'red',
  debug: 'blue',
  trace: 'white',
  fatal: 'red',
};

function isWideEmoji(character) {
  return character !== '⚠️';
}

function formatLevel(level) {
  if (formatters.formatLevel) return formatters.formatLevel(level, {chalk});
  const endlen = 5;
  const emoji = emojiMap[level];
  const padding = isWideEmoji(emoji) ? ' ' : '  ';
  const formattedLevel = chalk[colorMap[level]](level.toUpperCase());
  const endPadding = endlen - level.length;
  return emoji + padding + formattedLevel + ''.padEnd(endPadding, ' ');
}

function formatLoadTime(elapsedTime) {
  if (formatters.formatLoadTime)
    return formatters.formatLoadTime(elapsedTime, {chalk});
  const elapsed = Number.parseInt(elapsedTime, 10);
  const time = prettyMs(elapsed);
  return elapsed > 500
    ? chalk.red(time)
    : elapsed > 250
    ? chalk.yellow(time)
    : chalk.green(time);
}

function formatDate(instant) {
  if (formatters.formatDate) return formatters.formatDate(instant, {chalk});
  return chalk.gray(dayjs(instant).format('H:mm:ss'));
}

function formatName(name) {
  if (formatters.formatName) return formatters.formatName(name, {chalk});
  return `${name ? '-' : ''} ${chalk.blue(name + name ? ':' : '')}`;
}

function formatMessage({level, message}) {
  if (formatters.formatMessage)
    return formatters.formatMessage({level, message}, {chalk});
  if (typeof message === 'undefined') return;
  message = formatMessageName(message);
  let pretty;
  if (level === 'error') pretty = chalk.red(message);
  if (level === 'trace') pretty = chalk.cyan(message);
  if (level === 'warn') pretty = chalk.yellow(message);
  if (level === 'debug') pretty = chalk.white(message);
  if (level === 'info' || level === 'userlvl') pretty = chalk.white(message);
  if (level === 'fatal') pretty = chalk.white.bgRed(message);

  return pretty;
}

function formatMessageName(message) {
  if (message === 'request') return '<--';
  if (message === 'response') return '-->';
  return message;
}

function formatBundleSize(bundle) {
  const bytes = Number.parseInt(bundle, 10);
  const size = `${bytes}B`;
  return chalk.gray(size);
}

function formatNs(name) {
  return chalk.cyan(name);
}

function formatUrl(url) {
  return chalk.magenta(url);
}

function formatMethod(method) {
  return method ? chalk.white(method) : '';
}

function formatStatusCode(statusCode = 'xxx') {
  return chalk[
    statusCode < 300 ? 'green' : statusCode < 500 ? 'yellow' : 'red'
  ](statusCode);
}

function formatStack(stack) {
  return stack ? chalk.grey(nl + stack) : '';
}

function formatErrorProp(errorPropValue) {
  return nl + chalk.grey(JSON.stringify({err: errorPropValue}, null, 2));
}

function formatExtraFields(extraFields) {
  for (const val of Object.keys(extraFields))
    if (isEmpty(extraFields[val])) delete extraFields[val];

  if (isEmpty(extraFields)) return '';

  return nl + chalk.grey(JSON.stringify(extraFields, null, 2));
}
