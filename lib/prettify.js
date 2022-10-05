const chalk = require('chalk');
const jsonParse = require('fast-json-parse');
const unset = require('unset-value');
const get = require('get-value');
const set = require('set-value');
const isObject = require('./utils/is-object');
const isEmpty = require('./utils/is-empty');
const isPinoLog = require('./utils/is-pino-log');
const convertLogNumber = require('./utils/convert-log-number');
const {WHITE_LIST, BLACK_LIST} = require('./defaults');

/**
 * @typedef {import('./utils/types').Formatters} Formatters
 * @typedef {import('./utils/types').LogObject} LogObject
 */

const nl = '\n';

/**
 * @name prettify
 * @param {{ blackList?: Array<string>, whiteList?: Array<string>, formatters?: Formatters}} options
 * @returns
 */
function prettify({
  // white list and black list both take keys with dot notation
  blackList = [],
  // whitelist always overrides black list
  whiteList = [],
  // custom format objects
  // support the same func names as seen below
  formatters: {...formatters} = {},
} = {}) {
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
  } = require('./utils/format')(formatters);

  // eslint-disable-next-line complexity
  return function (/** @type {LogObject} */ inputData) {
    try {
      /** @type {LogObject} */
      let object;
      if (typeof inputData === 'string') {
        const parsedData = jsonParse(inputData);
        if (
          !parsedData.value ||
          parsedData.err ||
          !isPinoLog(parsedData.value)
        ) {
          return inputData + nl;
        }

        object = parsedData.value;
      } else if (isObject(inputData) && isPinoLog(inputData)) {
        object = inputData;
      } else {
        return inputData + nl;
      }

      // cache the whitelist
      const whiteListObj = {};
      for (const key of [...whiteList, ...WHITE_LIST]) {
        const val = get(object, key);
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

      if (!level) return inputData + nl;
      if (!message) message = msg;
      if (typeof level === 'number') level = convertLogNumber(level);

      const output = [];

      if (!level) level = 'userlvl';
      if (!name) name = '';
      if (!ns) ns = '';

      output.push(
        formatDate ? formatDate(time || Date.now()) : '',
        formatLevel ? formatLevel(level) : '',
        formatNs ? formatNs(ns) : '',
        formatName ? formatName(name) : '',
      );

      responseTime = responseTime || elapsed;
      stack =
        (level === 'fatal' || level === 'error') &&
        (!statusCode || statusCode < 500)
          ? stack || (err && err.stack)
          : undefined;
      // Output err if it has more keys than 'stack'
      const error =
        (level === 'fatal' || level === 'error') &&
        (!statusCode || statusCode < 500) &&
        err &&
        Object.keys(err).some((key) => key !== 'stack')
          ? err
          : null;

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
        output.push(formatExtraFields(extraFields));

      if (isObject(req) && !isEmpty(req))
        output.push(nl + chalk.grey('req ' + JSON.stringify(req, null, 2)));

      if (isObject(res) && !isEmpty(res))
        output.push(nl + chalk.grey('res ' + JSON.stringify(res, null, 2)));

      let outputString = output.filter(Boolean).join(' ');

      if (!outputString.endsWith('\n')) outputString += '\n';

      return outputString;
    } catch (error) {
      console.error(error);
    }
  };
}

module.exports = prettify;
