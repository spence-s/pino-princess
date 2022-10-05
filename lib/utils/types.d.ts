import type {ClientRequest, ServerResponse} from 'node:http';
import type {Chalk} from 'chalk';

export type Levels = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type Colors = 'yellow' | 'cyan' | 'red' | 'blue' | 'white' | 'red';

export type Formatter<Type> = (arg: Type, obj?: {chalk: Chalk}) => string;

export type MessageObj = {
  level: Levels | 'userlvl';
  message?: string;
};

export type LogObject = {
  req?: Partial<ClientRequest> & {url?: string};
  res?: Partial<ServerResponse>;
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
  err?: Partial<Error>;
  pid?: string;
  hostname?: string;
  extraFields?: unknown;
};

export type Formatters = {
  formatLevel?: Formatter<Levels | 'userlvl'>;
  formatLoadTime?: Formatter<string | number>;
  formatDate?: Formatter<string | number>;
  formatName?: Formatter<string>;
  formatMessage?: Formatter<MessageObj>;
  formatBundleSize?: Formatter<string>;
  formatNs?: Formatter<string>;
  formatExtraFields?: Formatter<Record<string, unknown>>;
  formatStack?: Formatter<string>;
  formatUrl?: Formatter<string>;
  formatStatusCode?: Formatter<number>;
  formatErrorProp?: Formatter<Partial<Error> | string>;
  formatMethod?: Formatter<string>;
};
