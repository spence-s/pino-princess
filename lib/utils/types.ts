import type {ChalkInstance} from 'chalk';
import type {Theme} from 'cli-highlight';

export type Levels = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type NumLevels = 10 | 20 | 30 | 40 | 50 | 60;
export type Colors = 'yellow' | 'cyan' | 'red' | 'blue' | 'white';
/**
 * A small subset of available options for `cli-highlight`
 * which can be applied to stringified log lines in pino-princess.
 */
export type HighlightTheme = Partial<
  Pick<Theme, 'attr' | 'string' | 'number' | 'literal'>
>;
/**
 * A formatter function which takes a segment of a log line,
 * formats it, and returns it as a string.
 *
 * @param arg - The segment of the log line to format.
 * @param obj - An object containing a `chalk` instance and an optional `theme` object.
 */
export type Formatter<Type> = (
  arg: Type,
  obj?: {
    [key: string]: any;
    chalk?: ChalkInstance;
    theme?: (chalk: ChalkInstance) => HighlightTheme;
  },
) => string;

export type MessageObj = {
  level: Levels;
  message?: string;
};
/**
 * Configuration options for `pino-princess`.
 */
export type PrettifyOptions = {
  /**
   * An array of strings which represent a key on any object.
   * Keys matching any one of these strings cause these keys to be excluded from the log output.
   * The excludes are always overridden by the includes.
   * In this way, excludes can be used to exclude large base objects and the "include"
   * can be used to pick certain fields and "add them back" to the log output.
   * For example, by default, pino-princess excludes the entire req or res object from any http logger.
   * Because some fields on req and res are required to construct the core of the log line, these fields are added back via the include.
   *
   * Accepts dot notation for nested keys.
   *
   * @default ["req", "res", "hostname", "pid"]
   */
  exclude?: string[];
  /**
   * An array of strings which represent a key on any object.
   * Keys matching any one of these strings will ensure the key is always part of the log output.
   * The includes always override the excludes.
   * In this way, include can be used to "add back" properties of excluded objects to the log output.
   * By default pino-princess includes all the properties required to create our standard log line.
   *
   * Accepts dot notation for nested keys.
   *
   * @default ["res.statusCode", "req.method", "req.url", "req.id", "level", "name", "msg", "responseTime"]
   */
  include?: string[];
  /**
   * The key used for the log message.
   *
   * @default "msg"
   */
  messageKey?: string;
  /**
   * The key to use for the error object.
   *
   * @default "err"
   */
  errorKey?: string;
  /**
   * The key used for the time segment.
   *
   * @default "time"
   */
  timeKey?: string;
  /**
   * Supply a custom time format. The time format is passed directly to date-fns format.
   *
   * @see https://date-fns.org/docs/format
   * @default "h:mm:ss.SSS aaa"
   */
  timeFormat?: string;
  /**
   * Format the entire log line on a single line with no new lines.
   *
   * @default false
   */
  singleLine?: boolean;
  /**
   * Force unicode emoji support on or off. When undefined, unicode support is auto-detected
   * based on your terminal capabilities using the 'is-unicode-supported' package.
   *
   * Set to false for CI/CD environments or terminals with limited unicode support.
   * When false, ASCII alternatives are used (e.g., '!' instead of '⚠️').
   *
   * @default auto-detected
   */
  unicode?: boolean;
  /**
   * Enable or disable colored output. When set to false, all color formatting is disabled,
   * producing plain text output. Useful when piping logs to files or in environments
   * without color support.
   *
   * @default auto-detected via chalk's color support detection
   */
  colors?: boolean;
  /**
   * Remap the keys of the log line. This is useful when your log structure uses different
   * field names than pino-princess expects. Supports dot notation for nested keys.
   *
   * **IMPORTANT:** You cannot set both messageKey and keyMap.msg at the same time
   * (or errorKey/keyMap.err, or timeKey/keyMap.time). Choose one approach.
   *
   * Available remappings:
   * - `name`: Logger name
   * - `time`: Timestamp field
   * - `level`: Log level
   * - `req.id`: Request ID
   * - `req.method`: HTTP method
   * - `req.url`: Request URL/path
   * - `res.statusCode`: Response status code
   * - `msg`: Log message
   * - `err`: Error object
   * - `responseTime`: Response time/duration
   *
   * @example
   * ```ts
   * // If your logs use 'request.path' instead of 'req.url':
   * {
   *   "req.url": "request.path",
   *   "req.method": "request.httpMethod",
   *   "res.statusCode": "response.status"
   * }
   * ```
   */
  keyMap?: {
    name?: string;
    time?: string;
    level?: string;
    'req.id'?: string;
    'req.method'?: string;
    'res.statusCode'?: string;
    'req.url'?: string;
    msg?: string;
    err?: string;
    responseTime?: string;
  };
  /**
   * This determines the colors of any extra fields that are not included in the pino-princess log line.
   * Returns a theme object that defines colors for JSON syntax highlighting.
   *
   * @param chalk - Chalk instance for creating color functions
   * @returns Theme object with color settings for attr, string, number, and literal values
   *
   * @example
   * ```ts
   * theme: (chalk) => ({
   *   attr: chalk.cyanBright,
   *   string: chalk.yellow,
   *   number: chalk.default,
   *   literal: chalk.default,
   * })
   * ```
   */
  theme?: (chalk: ChalkInstance) => HighlightTheme;
  /**
   * Custom format functions for any given key. These are functions which are passed to json-log-line,
   * where you can override them directly to customize how specific log fields are formatted.
   *
   * **IMPORTANT:** You cannot pass functions to pino-princess when using it as a pino v7 transport.
   * Format functions need to be configured in a pino-princess.config.js file.
   *
   * @example
   * ```ts
   * format: {
   *   name: (name) => `[${name}]`,
   *   level: (level) => level.toUpperCase(),
   *   'req.method': (method) => method.toLowerCase(),
   * }
   * ```
   */
  format?: Record<string, (...args: any[]) => string>;
};
