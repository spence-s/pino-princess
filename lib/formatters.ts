/* eslint-disable @typescript-eslint/naming-convention */
import _highlight from 'cli-highlight';
import {
  Chalk,
  supportsColor as chalkSupportsColor,
  type ChalkInstance,
  type ColorSupportLevel,
} from 'chalk';
import type {SerializedError} from 'pino';
import prettyMs from 'pretty-ms';
import pcStringify from 'json-stringify-pretty-compact';
import {format} from 'date-fns';
import getValue from 'get-value';
import isUnicodeSupported from 'is-unicode-supported';
import type {NumLevels, Levels, Colors} from './utils/types.ts';
import isObject from './utils/is-object.ts';

const nl = '\n';

const defaultTimeFormat = 'h:mm:ss.SSS aaa';

/** key map cache - assigned once at startup if user has custom keymap */
const highlight = _highlight.default;

const colorMap: Record<Levels, Colors> = {
  warn: 'yellow',
  info: 'cyan',
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

export class Formatter {
  chalk: ChalkInstance;

  supportsUnicode: boolean;

  keyMap: Record<string, string>;

  emojiMap = {
    warn(supportsUnicode: boolean) {
      return supportsUnicode ? '⚠️' : '!';
    },
    info(supportsUnicode: boolean) {
      return supportsUnicode ? '✨' : '*';
    },
    error(supportsUnicode: boolean) {
      return supportsUnicode ? '🚨' : 'X';
    },
    debug(supportsUnicode: boolean) {
      return supportsUnicode ? '🐛' : '+';
    },
    fatal(supportsUnicode: boolean) {
      return supportsUnicode ? '💀' : '!';
    },
    trace(supportsUnicode: boolean) {
      return supportsUnicode ? '🔍' : '.';
    },
  };

  constructor({
    keyMap,
    supportsColor,
    supportsUnicode,
  }: {
    keyMap: Record<string, string>;
    supportsColor?: boolean | undefined;
    supportsUnicode?: boolean | undefined;
  }) {
    this.keyMap = keyMap;

    this.supportsUnicode = supportsUnicode ?? isUnicodeSupported();

    let level: ColorSupportLevel = 0;

    if (supportsColor === false) {
      level = 0;
    } else if (supportsColor === true) {
      level = 3;
    } else if (
      typeof chalkSupportsColor === 'object' &&
      typeof chalkSupportsColor.level === 'number'
    ) {
      level = chalkSupportsColor.level;
    }

    this.chalk = new Chalk({
      level,
    });
  }

  stringify = (
    obj: unknown,
    indent?: string | number,
    theme?: _highlight.Theme,
  ) => {
    const stringified = highlight(pcStringify(obj, {indent}), {
      language: 'json',
      ignoreIllegals: true,
      theme: {
        attr: this.chalk.cyanBright,
        string: this.chalk.yellow,
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

  formatLevel = (_level: NumLevels | Levels): string => {
    const level: Levels =
      numLevelsMapping[_level as NumLevels] || (_level as Levels);

    if (!this.emojiMap?.[level]) return '';
    const endlen = 5;
    const emoji = this.emojiMap[level];
    const padding = isWideEmoji(emoji(this.supportsUnicode)) ? ' ' : '  ';
    const formattedLevel = this.chalk[colorMap[level]](level.toUpperCase());
    const endPadding = endlen - level.length;
    return (
      emoji(this.supportsUnicode) +
      padding +
      formattedLevel +
      ''.padEnd(endPadding, ' ')
    );
  };

  formatLoadTime = (elapsedTime: string | number): string => {
    const elapsed =
      typeof elapsedTime === 'string'
        ? Number.parseInt(elapsedTime, 10)
        : elapsedTime;
    const time = prettyMs(elapsed);
    return elapsed > 750
      ? this.chalk.red(time)
      : elapsed > 450
        ? this.chalk.yellow(time)
        : this.chalk.green(time);
  };

  formatTime = (
    instant: string | number,
    timeFormat: string = defaultTimeFormat,
  ): string => {
    return this.chalk.gray(`[${format(new Date(instant), timeFormat)}]`);
  };

  formatName = (name: string): string => {
    if (!name) return '';

    return this.chalk.blue(`[${name}]`);
  };

  formatMessage = (
    message: string,
    {level}: {level: NumLevels | Levels},
  ): string => {
    if (message === undefined) return '';
    let pretty = '';
    if (level === 50 || level === 'error') pretty = this.chalk.red(message);
    if (level === 10 || level === 'trace') pretty = this.chalk.cyan(message);
    if (level === 40 || level === 'warn') pretty = this.chalk.yellow(message);
    if (level === 20 || level === 'debug') pretty = this.chalk.white(message);
    if (level === 30 || level === 'info') pretty = this.chalk.white(message);
    if (level === 60 || level === 'fatal')
      pretty = this.chalk.white.bgRedBright(message);

    return pretty || message;
  };

  formatBundleSize = (bundle: string): string => {
    const bytes = Number.parseInt(bundle, 10);
    const size = `${bytes}B`;
    return this.chalk.gray(size);
  };

  formatUrl = (url: string, logObj: Record<string, unknown> = {}): string => {
    const statusCode: unknown = getValue(
      logObj,
      this.keyMap['res.statusCode'] ?? 'res.statusCode',
    );
    return statusCode
      ? this.chalk.magenta(url)
      : `    ${this.chalk.magenta(url)}`;
  };

  formatMethod = (method: string): string => {
    return method ? this.chalk.white(method.toUpperCase().padEnd(4)) : '';
  };

  formatStatusCode = (statusCode: string | number = 'xxx'): string => {
    return this.chalk[
      typeof statusCode === 'number' && statusCode < 300
        ? 'green'
        : typeof statusCode === 'number' && statusCode < 500
          ? 'yellow'
          : 'red'
    ](statusCode);
  };

  formatStack = (stack: string): string => {
    return stack ? this.chalk.grey(nl + '  ' + stack) : '';
  };

  formatErrorProp = (
    errorPropValue: Partial<
      SerializedError & {aggregateErrors?: SerializedError[]}
    >,
  ): string => {
    if (Array.isArray(errorPropValue.aggregateErrors)) {
      const {aggregateErrors, ...ogErr} = errorPropValue;
      return (
        [isObject(ogErr) ? this.formatErrorProp(ogErr) : undefined]
          // eslint-disable-next-line unicorn/prefer-spread
          .concat(
            aggregateErrors.map(
              (err: Partial<SerializedError>) =>
                '  ' + this.formatErrorProp(err),
            ),
          )
          .filter(Boolean)
          .join(nl)
      );
    }

    let stack = '';

    if (errorPropValue.type) delete errorPropValue.type;
    if (errorPropValue.stack) {
      stack += this.formatStack(errorPropValue.stack);
      delete errorPropValue.stack;
    }

    if (errorPropValue.message) delete errorPropValue.message;

    const hasExtraData = Object.keys(errorPropValue).length > 0;

    if (!stack && !hasExtraData) return '';

    return (
      stack +
      (stack ? nl : '') +
      (hasExtraData ? this.chalk.grey(this.stringify(errorPropValue, 4)) : '')
    );
  };

  formatExtraFields = (
    extraFields: Record<string, any>,
    options?: {
      theme?: (chalk: ChalkInstance) => _highlight.Theme;
      singleLine?: boolean;
    },
  ): string => {
    if (options?.singleLine) {
      return (
        '  ' +
        this.chalk.grey(
          this.stringify(extraFields, '', options?.theme?.(this.chalk)),
        )
      );
    }

    return (
      nl +
      this.chalk.grey(
        this.stringify(extraFields, undefined, options?.theme?.(this.chalk)),
      )
    );
  };

  formatId = (id: string) => {
    return id ? this.chalk.yellow(`[ID:${id}]`) : '';
  };
}
