const chalk = require('chalk');
const jsonParse = require('fast-json-parse');
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

function prettier({omitKeys = ['req', 'res']}) {
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

      if (isObject(req) && !omitKeys.includes('req')) {
        const filteredReq = Object.fromEntries(
          Object.entries(req).filter(([key]) => !omitKeys.includes(key)),
        );

        output.push(
          nl + chalk.grey('res ' + JSON.stringify(filteredReq, null, 2)),
        );
      }

      if (isObject(res) && !omitKeys.includes('res')) {
        const filteredRes = Object.fromEntries(
          Object.entries(res).filter(([key]) => !omitKeys.includes(key)),
        );

        output.push(
          nl + chalk.grey('res ' + JSON.stringify(filteredRes, null, 2)),
        );
      }

      return output.filter(Boolean).join(' ');
    } catch (error) {
      console.error(error);
    }
  };
}

module.exports = prettier;
