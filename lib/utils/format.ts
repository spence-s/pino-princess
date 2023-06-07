import chalk, {type Chalk} from 'chalk';
import dayjs from 'dayjs';
import type {
  SerializedError,
  SerializedRequest,
  SerializedResponse,
} from 'pino';
import prettyMs from 'pretty-ms';
import pcStringify from 'json-stringify-pretty-compact';
import type {Theme} from 'cli-highlight';
import highlight from 'cli-highlight';
import isObject from './is-object';
import type {Formatters, Levels, Colors, MessageObj} from './types';

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

  return stringified.startsWith('{"')
    ? '  ' + stringified.replace(/^{/, '').replace(/}$/, '')
    : stringified.replace(/^{\n/, '').replace(/\n}$/, '');
};

let formatters: Partial<Formatters> | undefined;

export default getFormatters;

/**
 * Get the default formatters or user supplied formatters.
 *
 * @param _formatters user supplied formatters
 * @returns user supplied formatters or default formatters
 */
function getFormatters(_formatters?: Partial<Formatters>): Formatters {
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
    ...formatters,
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
  if (formatters?.formatLevel) return formatters.formatLevel(level, {chalk});
  if (!emojiMap?.[level]) return '';
  const endlen = 5;
  const emoji = emojiMap[level];
  const padding = isWideEmoji(emoji) ? ' ' : '  ';
  const formattedLevel = chalk[colorMap[level]](level.toUpperCase());
  const endPadding = endlen - level.length;
  return emoji + padding + formattedLevel + ''.padEnd(endPadding, ' ');
}

function formatLoadTime(elapsedTime: string | number): string {
  if (formatters?.formatLoadTime)
    return formatters.formatLoadTime(elapsedTime, {chalk});
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
  if (formatters?.formatDate) return formatters.formatDate(instant, {chalk});
  return '🕰️ ' + chalk.gray(`[${dayjs(instant).format('H:mm:ss')}]`);
}

function formatName(name: string): string {
  if (formatters?.formatName) return formatters.formatName(name, {chalk});

  if (!name) return '';

  return `- ${chalk.blue(name)}:`;
}

function formatMessage({level, message}: MessageObj): string {
  if (formatters?.formatMessage)
    return formatters.formatMessage({level, message}, {chalk});
  if (message === undefined) return '';
  message = formatMessageName(message);
  let pretty = '';
  if (level === 'error') pretty = chalk.red(message);
  if (level === 'trace') pretty = chalk.cyan(message);
  if (level === 'warn') pretty = chalk.yellow(message);
  if (level === 'debug') pretty = chalk.white(message);
  if (level === 'info' || level === 'userlvl') pretty = chalk.white(message);
  if (level === 'fatal') pretty = chalk.white.bgRedBright(message);

  return pretty;
}

function formatMessageName(message: string): string {
  if (message === 'request') return '<--';
  if (message === 'response') return '-->';
  return message;
}

function formatBundleSize(bundle: string): string {
  const bytes = Number.parseInt(bundle, 10);
  const size = `${bytes}B`;
  return chalk.gray(size);
}

function formatNs(name: string): string {
  return chalk.cyan(name);
}

function formatUrl(url: string): string {
  return chalk.magenta(url);
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
    return [isObject(ogErr) ? formatErrorProp(ogErr) : undefined]
      .concat(
        aggregateErrors.map(
          (err: Partial<SerializedError>) => '  ' + formatErrorProp(err),
        ),
      )
      .filter(Boolean)
      .join(nl);
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
  extraFields: Record<string, any> & {
    req?: SerializedRequest;
    res?: SerializedResponse;
  },
  options?: {theme?: (chalk: Chalk) => Theme},
): string {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (isObject(extraFields) && (extraFields.req || extraFields.res)) {
    const {req, res} = extraFields;
    delete extraFields.req;
    delete extraFields.res;
    extraFields = {
      req,
      res,
      ...extraFields,
    };
  }

  return (
    nl + chalk.grey(stringify(extraFields, undefined, options?.theme?.(chalk)))
  );
}
