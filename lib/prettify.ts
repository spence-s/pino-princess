/* eslint-disable complexity */

import {logLineFactory} from 'json-log-line';
import _highlight from 'cli-highlight';
import type {PrettifyOptions} from './utils/types.ts';
import {Formatter} from './formatters.ts';

const defaultTimeFormat = 'h:mm:ss.SSS aaa';

export function prettify({
  errorKey,
  messageKey,
  timeKey,
  timeFormat = defaultTimeFormat,
  singleLine = false,
  exclude = [],
  include = [],
  theme = (chalk) => ({}),
  format = {},
  keyMap = {},
  unicode,
  colors,
}: PrettifyOptions = {}) {
  if (keyMap.msg && messageKey) {
    throw new Error('Cannot set both messageKey and keyMap.message');
  }

  if (keyMap.err && errorKey) {
    throw new Error('Cannot set both errorKey and keyMap.error');
  }

  if (keyMap.time && timeKey) {
    throw new Error('Cannot set both timeKey and keyMap.time');
  }

  if (keyMap.msg) {
    messageKey = keyMap.msg;
  }

  if (keyMap.err) {
    errorKey = keyMap.err;
  }

  if (keyMap.time) {
    timeKey = keyMap.time;
  }

  const formatter = new Formatter({
    supportsColor: colors,
    supportsUnicode: unicode,
    keyMap,
  });

  const formatters: Record<string, (...args: any[]) => string> = {
    [keyMap.name ?? 'name']: formatter.formatName,
    [timeKey ?? 'time']: (time: string | number) =>
      formatter.formatTime(time, timeFormat),
    [keyMap.level ?? 'level']: formatter.formatLevel,
    [keyMap['req.id'] ?? 'req.id']: formatter.formatId,
    [keyMap['req.method'] ?? 'req.method']: formatter.formatMethod,
    [keyMap['res.statusCode'] ?? 'res.statusCode']: formatter.formatStatusCode,
    [keyMap['req.url'] ?? 'req.url']: formatter.formatUrl,
    [messageKey ?? 'msg']: formatter.formatMessage,
    [keyMap.responseTime ?? 'responseTime']: formatter.formatLoadTime,
    extraFields: (fields: Record<string, unknown>) =>
      formatter.formatExtraFields(fields, {theme, singleLine}),
    [errorKey ?? 'err']: formatter.formatErrorProp,
    [`${errorKey ?? 'err'}.stack`]: formatter.formatStack,
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
