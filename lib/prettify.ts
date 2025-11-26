/* eslint-disable @typescript-eslint/naming-convention */
import {logLineFactory} from 'json-log-line';
import _highlight from 'cli-highlight';
import chalk, {type ChalkInstance} from 'chalk';
import type {SerializedError} from 'pino';
import prettyMs from 'pretty-ms';
import pcStringify from 'json-stringify-pretty-compact';
import {format} from 'date-fns';
import type {
  NumLevels,
  Levels,
  Colors,
  PrettifyOptions,
} from './utils/types.js';
import isObject from './utils/is-object.js';

const highlight = _highlight.default;

const nl = '\n';

const defaultTimeFormat = 'h:mm:ss.SSS aaa';

const stringify = (
  obj: unknown,
  indent?: string | number,
  theme?: _highlight.Theme,
) => {
  const stringified = highlight(pcStringify(obj, {indent}), {
    language: 'json',
    ignoreIllegals: true,
    theme: {
      attr: chalk.cyanBright,
      string: chalk.yellow,
      ...theme,
    },
  });

  if (indent === Infinity || indent === '') {
    return stringified;
  }

  return /^{.*"/.test(stringified)
    ? '  ' + stringified.replace(/^{/, '').replace(/}$/, '')
    : stringified.replace(/^{\n/, '').replace(/\n}$/, '');
};

const emojiMap = {
  warn: '⚠️',
  info: '✨',
  userlvl: '👤',
  error: '🚨',
  debug: '🐛',
  fatal: '💀',
  trace: '🔍',
};

const colorMap: Record<Levels | 'userlvl', Colors> = {
  warn: 'yellow',
  info: 'cyan',
  userlvl: 'cyan',
  error: 'red',
  debug: 'blue',
  trace: 'white',
  fatal: 'red',
};

const numLevelsMapping: Record<NumLevels, Levels> = {
  10: 'trace',
  20: 'debug',
  30: 'info',
  40: 'warn',
  50: 'error',
  60: 'fatal',
};

function isWideEmoji(character: string): boolean {
  return character !== '⚠️';
}

export function formatLevel(_level: NumLevels | Levels): string {
  const level: Levels =
    numLevelsMapping[_level as NumLevels] || (_level as Levels);

  if (!emojiMap?.[level]) return '';
  const endlen = 5;
  const emoji = emojiMap[level];
  const padding = isWideEmoji(emoji) ? ' ' : '  ';
  const formattedLevel = chalk[colorMap[level]](level.toUpperCase());
  const endPadding = endlen - level.length;
  return emoji + padding + formattedLevel + ''.padEnd(endPadding, ' ');
}

export function formatLoadTime(elapsedTime: string | number): string {
  const elapsed =
    typeof elapsedTime === 'string'
      ? Number.parseInt(elapsedTime, 10)
      : elapsedTime;
  const time = prettyMs(elapsed);
  return elapsed > 750
    ? chalk.red(time)
    : elapsed > 450
      ? chalk.yellow(time)
      : chalk.green(time);
}

export function formatTime(
  instant: string | number,
  timeFormat: string = defaultTimeFormat,
): string {
  return chalk.gray(`[${format(new Date(instant), timeFormat)}]`);
}

export function formatName(name: string): string {
  if (!name) return '';

  return chalk.blue(`[${name}]`);
}

export function formatMessage(
  message: string,
  {level}: {level: NumLevels | Levels},
): string {
  if (message === undefined) return '';
  let pretty = '';
  if (level === 50 || level === 'error') pretty = chalk.red(message);
  if (level === 10 || level === 'trace') pretty = chalk.cyan(message);
  if (level === 40 || level === 'warn') pretty = chalk.yellow(message);
  if (level === 20 || level === 'debug') pretty = chalk.white(message);
  if (level === 30 || level === 'info') pretty = chalk.white(message);
  if (level === 60 || level === 'fatal')
    pretty = chalk.white.bgRedBright(message);

  return pretty || message;
}

export function formatBundleSize(bundle: string): string {
  const bytes = Number.parseInt(bundle, 10);
  const size = `${bytes}B`;
  return chalk.gray(size);
}

export function formatUrl(
  url: string,
  {res: {statusCode} = {}}: {res?: Record<string, unknown>} = {},
): string {
  return statusCode ? chalk.magenta(url) : `    ${chalk.magenta(url)}`;
}

export function formatMethod(method: string): string {
  return method ? chalk.white(method.padEnd(4)) : '';
}

export function formatStatusCode(statusCode: string | number = 'xxx'): string {
  return chalk[
    typeof statusCode === 'number' && statusCode < 300
      ? 'green'
      : typeof statusCode === 'number' && statusCode < 500
        ? 'yellow'
        : 'red'
  ](statusCode);
}

export function formatStack(stack: string): string {
  return stack ? chalk.grey(nl + '  ' + stack) : '';
}

export function formatErrorProp(
  errorPropValue: Partial<
    SerializedError & {aggregateErrors?: SerializedError[]}
  >,
): string {
  if (Array.isArray(errorPropValue.aggregateErrors)) {
    const {aggregateErrors, ...ogErr} = errorPropValue;
    return (
      [isObject(ogErr) ? formatErrorProp(ogErr) : undefined]
        // eslint-disable-next-line unicorn/prefer-spread
        .concat(
          aggregateErrors.map(
            (err: Partial<SerializedError>) => '  ' + formatErrorProp(err),
          ),
        )
        .filter(Boolean)
        .join(nl)
    );
  }

  let stack = '';

  if (errorPropValue.type) delete errorPropValue.type;
  if (errorPropValue.stack) {
    stack += formatStack(errorPropValue.stack);
    delete errorPropValue.stack;
  }

  if (errorPropValue.message) delete errorPropValue.message;

  const hasExtraData = Object.keys(errorPropValue).length > 0;

  if (!stack && !hasExtraData) return '';

  return (
    stack +
    (stack ? nl : '') +
    (hasExtraData ? chalk.grey(stringify(errorPropValue, 4)) : '')
  );
}

export function formatExtraFields(
  extraFields: Record<string, any>,
  options?: {
    theme?: (chalk: ChalkInstance) => _highlight.Theme;
    singleLine?: boolean;
  },
): string {
  if (options?.singleLine) {
    return (
      '  ' + chalk.grey(stringify(extraFields, '', options?.theme?.(chalk)))
    );
  }

  return (
    nl + chalk.grey(stringify(extraFields, undefined, options?.theme?.(chalk)))
  );
}

export function formatId(id: string) {
  return id ? chalk.yellow(`[ID:${id}]`) : '';
}

export function prettify({
  /**
   * The key to use for the error object. Defaults to `err`.
   */
  errorKey = 'err',
  /**
   * The key to use for the message object. Defaults to `msg`.
   */
  messageKey = 'msg',
  /**
   * The key to use for the time segment. Defaults to `time`.
   */
  timeKey = 'time',
  /**
   * Format string for time display using date-fns format
   */
  timeFormat = defaultTimeFormat,
  /**
   * Whether to format the output as a single line
   */
  singleLine = false,
  /**
   * include and exclude both take keys with dot notation
   */
  exclude = [],
  /**
   * include always overrides exclude
   */
  include = [],
  /**
   * Theme for the extra fields object
   */
  theme = (chalk) => ({}),
  /**
   * Format functions for any given key
   */
  format = {},
}: PrettifyOptions = {}) {
  const formatters: Record<string, (...args: any[]) => string> = {
    name: formatName,
    [timeKey]: (time: string | number) => formatTime(time, timeFormat),
    level: formatLevel,
    'req.id': formatId,
    'req.method': formatMethod,
    'res.statusCode': formatStatusCode,
    'req.url': formatUrl,
    [messageKey]: formatMessage,
    responseTime: formatLoadTime,
    extraFields: (fields: Record<string, unknown>) =>
      formatExtraFields(fields, {theme, singleLine}),
    [errorKey]: formatErrorProp,
    [`${errorKey}.stack`]: formatStack,
    ...format,
  };

  const opts = {
    include: [...include, ...Object.keys(formatters)],
    exclude: ['req', 'res', 'hostname', 'pid', ...exclude],
    format: formatters,
  };

  return logLineFactory(opts);
}

export default prettify;
