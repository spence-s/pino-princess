import type {Chalk} from 'chalk';
import {
  type SerializedRequest,
  type SerializedResponse,
  type SerializedError,
} from 'pino';
import type {Theme} from 'cli-highlight';

export type Levels = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

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
  obj?: {chalk: Chalk; theme?: (chalk: Chalk) => HighlightTheme},
) => string;

export type MessageObj = {
  level: Levels | 'userlvl';
  message?: string;
};

/**
 * A log line object which has been serialized by pino
 * and is ready to be formatted by pino-princess.
 */
export type LogObject = {
  [key: string]: unknown;
  req?: Partial<SerializedRequest>;
  res?: Partial<SerializedResponse>;
  level?: number | Levels | 'userlvl';
  message?: string;
  name?: string;
  ns?: string;
  msg?: string;
  time?: string;
  statusCode?: number;
  responseTime?: number;
  elapsed?: number;
  method?: string;
  url?: string;
  contentLength?: string;
  stack?: string;
  err?: SerializedError;
  pid?: string;
  hostname?: string;
};

/**
 * A collection of formatter functions which are used to format
 * and can be overridden by the user in a config file.
 */
export type Formatters = {
  formatLevel: Formatter<Levels | 'userlvl'>;
  formatLoadTime: Formatter<string | number>;
  formatDate: Formatter<string | number>;
  formatName: Formatter<string>;
  formatMessage: Formatter<MessageObj>;
  formatBundleSize: Formatter<string>;
  formatNs: Formatter<string>;
  formatExtraFields: Formatter<Record<string, unknown>>;
  formatStack: Formatter<string>;
  formatUrl: Formatter<string>;
  formatStatusCode: Formatter<number>;
  formatErrorProp: Formatter<Partial<SerializedError>>;
  formatMethod: Formatter<string>;
};

/**
 * Configuration options for `pino-princess`.
 */
export type PrettifyOptions = {
  blacklist?: string[];
  whitelist?: string[];
  formatters?: Partial<Formatters>;
  theme?: (chalk: Chalk) => HighlightTheme;
};
