import chalk from 'chalk';
import jsonParse from 'fast-json-parse';
import unset from 'unset-value';
import get from 'get-value';
import set from 'set-value';
import isObject from './utils/is-object';
import isEmpty from './utils/is-empty';
import isPinoLog from './utils/is-pino-log';
import convertLogNumber from './utils/convert-log-number';
import {WHITE_LIST, BLACK_LIST} from './defaults';
import getFormatters from './utils/format';
import type {
  PrettifyOptions,
  Formatters,
  LogObject,
  Formatter,
} from './utils/types';

const nl = '\n';

function prettify({
  // white list and black list both take keys with dot notation
  blackList = [],
  // whitelist always overrides black list
  whiteList = [],
  // custom json colors
  theme = {},
  // custom format objects
  // support the same func names as seen below
  formatters: {...formatters} = {},
}: PrettifyOptions = {}) {
  const {
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
  }: Formatters = getFormatters(formatters);

  // eslint-disable-next-line complexity
  return function (inputData: unknown): string | undefined {
    try {
      let object: LogObject;
      if (typeof inputData === 'string') {
        const parsedData = jsonParse(inputData);
        if (!parsedData.value || parsedData.err) {
          return inputData + nl;
        }

        object =
          parsedData.value instanceof Error
            ? (() => {
                return {
                  err: parsedData.value,
                };
              })()
            : parsedData.value;
      } else if (isObject(inputData)) {
        object = inputData as LogObject;
      } else if (inputData instanceof Error) {
        object = {err: inputData};
      } else {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        return inputData + nl;
      }

      // cache the whitelist
      const whiteListObj = {};
      for (const key of [...whiteList, ...WHITE_LIST]) {
        const val: unknown = get(object, key);
        if (val) set(whiteListObj, key, val);
      }

      // remove the blacklist
      for (const key of [...BLACK_LIST, ...blackList]) unset(object, key);

      // add back in the whitelist
      object = {
        ...object,
        ...whiteListObj,
      };

      let {
        req,
        res,
        level,
        message,
        name,
        ns,
        msg,
        time,
        statusCode,
        responseTime,
        elapsed,
        method,
        url,
        contentLength,
        stack,
        err,
        pid,
        hostname,
        ...extraFields
      } = object;

      if (isObject(req) && !isEmpty(req)) {
        ({method, url, ...req} = req ?? {});
        object.req = req;
      }

      if (isObject(res) && !isEmpty(res)) {
        ({statusCode, ...res} = res ?? {});
        object.res = res;
      }

      if (!message) message = msg;
      if (typeof level === 'number') level = convertLogNumber(level);

      const output = [];

      if (!level) level = 'userlvl';
      if (!name) name = '';
      if (!ns) ns = '';

      output.push(
        formatDate ? formatDate(time ?? Date.now()) : '',
        formatLevel ? formatLevel(level) : '',
        formatNs ? formatNs(ns) : '',
        formatName ? formatName(name) : '',
      );

      responseTime = responseTime ?? elapsed;

      // Output err if it has more keys than 'stack'
      /** @type {Partial<import('pino').SerializedError> | undefined} */
      const error =
        (!statusCode || statusCode < 500) &&
        err &&
        Object.keys(err).some((key) => key !== 'stack')
          ? err
          : undefined;

      if (method && formatMethod) output.push(formatMethod(method));

      if (statusCode && formatStatusCode)
        output.push(formatStatusCode(statusCode));

      if (url && formatUrl) output.push(formatUrl(url));

      if (formatMessage && typeof level === 'string')
        output.push(formatMessage({message, level}));

      if (contentLength && formatBundleSize)
        output.push(formatBundleSize(contentLength));

      if (responseTime && formatLoadTime)
        output.push(formatLoadTime(responseTime));

      if (stack && formatStack) output.push(formatStack(stack));

      if (error && formatErrorProp) output.push(formatErrorProp(error));

      if (isObject(extraFields) && !isEmpty(extraFields) && formatExtraFields)
        output.push(formatExtraFields(extraFields, {chalk, theme}));

      let outputString = output.filter(Boolean).join(' ');

      if (!outputString.endsWith(nl)) outputString += nl;

      return outputString;
    } catch (error: unknown) {
      console.log(error);
    }
  };
}

export default prettify;
