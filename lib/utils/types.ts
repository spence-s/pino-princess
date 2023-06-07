import type {Chalk} from 'chalk';
import {
  type SerializedRequest,
  type SerializedResponse,
  type SerializedError,
} from 'pino';
import type {Theme} from 'cli-highlight';

export type Levels = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type Colors = 'yellow' | 'cyan' | 'red' | 'blue' | 'white';

export type Formatter<Type> = (
  arg: Type,
  obj?: {chalk: Chalk; theme?: Theme},
) => string;

export type MessageObj = {
  level: Levels | 'userlvl';
  message?: string;
};

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

export type PrettifyOptions = {
  blacklist?: string[];
  whitelist?: string[];
  formatters?: Partial<Formatters>;
  theme?: Theme;
};
