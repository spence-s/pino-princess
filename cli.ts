#!/usr/bin/env node
import fs from 'node:fs';
import util from 'node:util';
import process from 'node:process';
import os from 'node:os';
import pump from 'pump';
import {cosmiconfigSync} from 'cosmiconfig';
import type {PrettifyOptions} from './lib/utils/types.ts';
import {build} from './index.ts';

const helpText = `
Pino Princess - Pretty print json logs with emojis and colors

Usage
  $ node my-app-with-pino-logging | pino-princess

Options
  --exclude, -e    excluded log fields separated by comma. Is overriden by included fields.
  --include, -i    included log fields separated by comma. Overrides excluded fields.
  --messageKey     key for the message field, defaults to 'msg'
  --errorLikeKeys  additional keys for error fields, defaults to 'error' and 'err'
  --timeKey        key for the time field, defaults to 'time'
  --timeFormat     format for the time field, passed to date-fns format defaults to 'h:mm:ss.SSS aaa'
  --singleLine     format the output as a single line, defaults to false
  --unicode        force unicode emojis on or off, auto-detected by default
  --colors         enable or disable all color output, auto-detected by default
  `;

const cli = util.parseArgs({
  options: {
    help: {
      type: 'boolean',
      short: 'h',
    },
    exclude: {
      type: 'string',
      short: 'e',
    },
    include: {
      type: 'string',
      short: 'i',
    },
    messageKey: {
      type: 'string',
    },
    errorLikeKeys: {
      type: 'string',
      isMultiple: true,
    },
    singleLine: {
      type: 'boolean',
    },
    timeFormat: {
      type: 'string',
    },
    timeKey: {
      type: 'string',
    },
    // Set to string so we can detect if the user passed them or not
    unicode: {
      type: 'boolean',
    },
    // Set to string so we can detect if the user passed them or not
    colors: {
      type: 'boolean',
    },
  },
  allowNegative: true,
});

const cliConfig: PrettifyOptions = {};

if (cli.values.help) {
  console.log(helpText);
  process.exit(0);
}

if (cli.values.exclude) {
  cliConfig.exclude = cli.values.exclude.split(',').map((str) => str.trim());
}

if (cli.values.include) {
  cliConfig.include = cli.values.include.split(',').map((str) => str.trim());
}

if (cli.values.messageKey) {
  cliConfig.messageKey = cli.values.messageKey;
}

if (cli.values.errorLikeKeys) {
  cliConfig.errorLikeKeys = cli.values.errorLikeKeys
    .split(',')
    .map((str) => str.trim());
}

if (cli.values.timeFormat) {
  cliConfig.timeFormat = cli.values.timeFormat;
}

if (cli.values.singleLine) {
  cliConfig.singleLine = cli.values.singleLine;
}

if (cli.values.timeKey) {
  cliConfig.timeKey = cli.values.timeKey;
}

cliConfig.unicode = cli.values.unicode;
cliConfig.colors = cli.values.colors;

const defaultConfig: PrettifyOptions = {
  messageKey: 'msg',
  timeFormat: 'h:mm:ss.SSS aaa',
  singleLine: false,
};

const explorer = cosmiconfigSync('pino-princess', {stopDir: os.homedir()});

const {config} = (explorer.search(process.cwd()) ?? {}) as {
  config: PrettifyOptions;
};

const res = build({...defaultConfig, ...config, ...cliConfig});

pump(process.stdin, res);

if (!process.stdin.isTTY && !fs.fstatSync(process.stdin.fd).isFile()) {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  process.once('SIGINT', function () {});
}
