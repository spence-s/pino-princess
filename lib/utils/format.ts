/* eslint-disable @typescript-eslint/naming-convention */
import chalk, {type Chalk} from 'chalk';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import type {SerializedError} from 'pino';
import prettyMs from 'pretty-ms';
import pcStringify from 'json-stringify-pretty-compact';
import type {Theme} from 'cli-highlight';
import highlight from 'cli-highlight';
import isObject from './is-object';
import type {Levels, Colors, MessageObj} from './types';

dayjs.extend(utc);

const nl = '\n';

const stringify = (obj: unknown, indent?: number, theme?: Theme) => {
  const stringified = highlight(pcStringify(obj, {indent}), {
    language: 'json',
    ignoreIllegals: true,
    theme: {
      attr: chalk.cyanBright,
      string: chalk.yellow,
      ...theme,
    },
  });

  return /^{.*"/.test(stringified)
    ? '  ' + stringified.replace(/^{/, '').replace(/}$/, '')
    : stringified.replace(/^{\n/, '').replace(/\n}$/, '');
};

export default getFormatters;

/**
 * Get the default formatters or user supplied formatters.
 *
 * @param _formatters user supplied formatters
 * @returns user supplied formatters or default formatters
 */
function getFormatters() {
  return {
    level: formatLevel,
    date: formatDate,
    name: formatName,
    msg: formatMessage,
    message: formatMessage,
    stack: formatStack,
    'req.method': formatMethod,
    'req.url': formatUrl,
    'res.statusCode': formatStatusCode,
    'req.id': formatId,
    responseTime: formatLoadTime,
    err: formatErrorProp,
    extraFields: formatExtraFields,
  };
}

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

function isWideEmoji(character: string): boolean {
  return character !== '⚠️';
}

function formatLevel(level: Levels | 'userlvl'): string {
  if (!emojiMap?.[level]) return '';
  const endlen = 5;
  const emoji = emojiMap[level];
  const padding = isWideEmoji(emoji) ? ' ' : '  ';
  const formattedLevel = chalk[colorMap[level]](level.toUpperCase());
  const endPadding = endlen - level.length;
  return emoji + padding + formattedLevel + ''.padEnd(endPadding, ' ');
}

function formatLoadTime(elapsedTime: string | number): string {
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

function formatDate(instant: string | number): string {
  return chalk.gray(`[${dayjs.utc(instant).format('H:mm:ss')}]`);
}

function formatName(name: string): string {
  if (!name) return '';

  return chalk.blue(name) + ':';
}

function formatMessage(message: string, {level}: {level: string}): string {
  if (message === undefined) return '';
  let pretty = '';
  if (level === 'error') pretty = chalk.red(message);
  if (level === 'trace') pretty = chalk.cyan(message);
  if (level === 'warn') pretty = chalk.yellow(message);
  if (level === 'debug') pretty = chalk.white(message);
  if (level === 'info') pretty = chalk.white(message);
  if (level === 'fatal') pretty = chalk.white.bgRedBright(message);

  return pretty || message;
}

function formatBundleSize(bundle: string): string {
  const bytes = Number.parseInt(bundle, 10);
  const size = `${bytes}B`;
  return chalk.gray(size);
}

function formatUrl(
  url: string,
  {res: {statusCode} = {}}: {res?: Record<string, unknown>} = {},
): string {
  return statusCode ? chalk.magenta(url) : `    ${chalk.magenta(url)}`;
}

function formatMethod(method: string): string {
  return method ? chalk.white(method) : '';
}

function formatStatusCode(statusCode: string | number = 'xxx'): string {
  return chalk[
    typeof statusCode === 'number' && statusCode < 300
      ? 'green'
      : typeof statusCode === 'number' && statusCode < 500
      ? 'yellow'
      : 'red'
  ](statusCode);
}

function formatStack(stack: string): string {
  return stack ? chalk.grey(nl + '  ' + stack) : '';
}

function formatErrorProp(
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

function formatExtraFields(
  extraFields: Record<string, any>,
  options?: {theme?: (chalk: Chalk) => Theme},
): string {
  return (
    nl + chalk.grey(stringify(extraFields, undefined, options?.theme?.(chalk)))
  );
}

function formatId(id: string) {
  return id ? chalk.yellow(`[ID:${id}]`) : '';
}
