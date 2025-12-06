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
   * The key to use for the error object. Defaults to `err`.
   */
  errorKey?: string;
  /**
   * The key used for the log message. Defaults to `msg`.
   */
  messageKey?: string;
  /**
   * The key used for the time segment. Defaults to `time`.
   */
  timeKey?: string;
  /**
   * exclude keys from the log object, accepts dot notation
   */
  exclude?: string[];
  /**
   * include keys in the log object, accepts dot notation, always overrides exclude
   */
  include?: string[];
  /**
   * Format functions for any given key
   */
  format?: Record<string, (...args: any[]) => string>;
  /**
   * defines the order in which format functions are ran
   */
  logLine?: string | string[];
  /**
   * Theme for the extra fields object
   */
  theme?: (chalk: ChalkInstance) => HighlightTheme;
  /**
   * Format string for time display using date-fns format
   */
  timeFormat?: string;
  /**
   * Whether to format the output as a single line
   */
  singleLine?: boolean;
  /**
   * Remap the keys of the log line. For instance, if you want to use custom keys for req/res fields that make up the log line.
   * dot notation is supported for nested keys.
   * Note: you cannot set values for both messageKey and keyMap.message at the same time or any other overlapping keys.
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
};
