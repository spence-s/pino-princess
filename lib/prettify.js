const chalk = require('chalk');
const jsonParse = require('fast-json-parse');
const unset = require('unset-value');
const get = require('get-value');
const set = require('set-value');
const isObject = require('./utils/is-object');
const isEmpty = require('./utils/is-empty');
const isPinoLog = require('./utils/is-pino-log');
const convertLogNumber = require('./utils/convert-log-number');

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
} = require('./utils/format');

const nl = '\n';

function prettier({omitKeys = [], whiteListKeys = []} = {}) {
  // eslint-disable-next-line complexity
  return function (inputData) {
    try {
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

      // pull out the whitelist
      const whiteListObj = {};
      for (const key of whiteListKeys) {
        const val = get(object, key);
        if (val) set(whiteListObj, key, val);
      }

      // remove the blacklist
      for (const key of omitKeys) unset(object, key);

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

      if (!level) return inputData + nl;
      if (!message) message = msg;
      if (typeof level === 'number') level = convertLogNumber(level);

      const output = [];

      if (!level) level = 'userlvl';
      if (!name) name = '';
      if (!ns) ns = '';

      output.push(
        formatDate(time || Date.now()),
        formatLevel(level),
        formatNs(ns),
        formatName(name),
      );

      statusCode = res ? res.statusCode : statusCode;
      responseTime = responseTime || elapsed;
      method = req ? req.method : method;
      url = req ? req.url : url;
      stack =
        (level === 'fatal' || level === 'error') &&
        (!statusCode || statusCode < 500)
          ? stack || (err && err.stack)
          : null;
      // Output err if it has more keys than 'stack'
      const error =
        (level === 'fatal' || level === 'error') &&
        (!statusCode || statusCode < 500) &&
        err &&
        Object.keys(err).some((key) => key !== 'stack')
          ? err
          : null;

      if (method) output.push(formatMethod(method));

      if (statusCode) output.push(formatStatusCode(statusCode));

      if (url) output.push(formatUrl(url));

      output.push(formatMessage({message, level}));

      if (contentLength) output.push(formatBundleSize(contentLength));

      if (responseTime) output.push(formatLoadTime(responseTime));

      if (stack) output.push(formatStack(stack));

      if (error) output.push(formatErrorProp(error));

      if (isObject(extraFields) && !isEmpty(extraFields))
        output.push(formatExtraFields(extraFields));

      if (isObject(req) && !isEmpty(req))
        output.push(nl + chalk.grey('req ' + JSON.stringify(req, null, 2)));

      if (isObject(res) && !isEmpty(res))
        output.push(nl + chalk.grey('res ' + JSON.stringify(res, null, 2)));

      return output.filter(Boolean).join(' ');
    } catch (error) {
      console.error(error);
    }
  };
}

module.exports = prettier;
