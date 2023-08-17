import chalk from 'chalk';
import jsonParse from 'fast-json-parse';
import unset from 'unset-value';
import get from 'get-value';
import set from 'set-value';
import type {SerializedRequest, SerializedResponse} from 'pino';
import isObject from './utils/is-object';
import isEmpty from './utils/is-empty';
import convertLogNumber from './utils/convert-log-number';
import {WHITE_LIST, BLACK_LIST} from './defaults';
import getFormatters from './utils/format';
import type {PrettifyOptions, Formatters, LogObject} from './utils/types';

const nl = '\n';

export function prettify({
  // white list and black list both take keys with dot notation
  blacklist = [],
  // whitelist always overrides black list
  whitelist = [],
  // custom json colors
  theme = (chalk) => ({}),
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
    formatId,
  }: Formatters = getFormatters(formatters);

  // eslint-disable-next-line complexity
  return function (
    inputData: string | Record<string, unknown>,
  ): string | undefined {
    try {
      let object: LogObject = {};
      if (typeof inputData === 'string') {
        const parsedData = jsonParse(inputData);
        if (!parsedData.value || parsedData.err) {
          return inputData + nl;
        }

        object = parsedData.value as LogObject;
      } else if (isObject(inputData)) {
        object = inputData as LogObject;
      } else {
        return nl;
      }

      // cache the whitelist
      const whiteListObj = {};
      for (const key of [...whitelist, ...WHITE_LIST]) {
        const val: unknown = get(object, key);
        if (val) set(whiteListObj, key, val);
      }

      // remove the blacklist
      for (const key of [...BLACK_LIST, ...blacklist]) unset(object, key);

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
        id,
        contentLength,
        stack,
        err,
        pid,
        hostname,
        ...extraFields
      } = object;

      let extraReq: Partial<SerializedRequest>;
      if (isObject(req) && !isEmpty(req)) {
        ({method, url, id, ...extraReq} = req ?? {});
        object.req = extraReq;
        if (!isEmpty(extraReq)) {
          if (!extraFields) extraFields = {};
          extraFields.req = extraReq;
        }
      }

      let extraRes: Partial<SerializedResponse>;
      if (isObject(res) && !isEmpty(res)) {
        ({statusCode, ...extraRes} = res ?? {});
        object.res = extraRes;
        if (!isEmpty(extraRes)) {
          if (!extraFields) extraFields = {};
          extraFields.res = extraRes;
        }
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
        formatId ? formatId(id ?? '') : '',
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
