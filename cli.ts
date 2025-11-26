#!/usr/bin/env node
import fs from 'node:fs';
import process from 'node:process';
import os from 'node:os';
import pump from 'pump';
import {cosmiconfigSync} from 'cosmiconfig';
import meow from 'meow';
import type {PrettifyOptions} from './lib/utils/types.js';
import {build} from './index.js';

const cli = meow(
  `
Usage
  $ node my-app-with-pino-logging | pino-princess

Options
  --exclude, -e    excluded log fields separated by comma. Is overriden by included fields.
  --include, -i    included log fields separated by comma. Overrides excluded fields.
  --messageKey     key for the message field, defaults to 'msg'
  --errorKey       key for the error field, defaults to 'err'
  --timeFormat     format for the time field, passed to date-fns format defaults to 'h:mm:ss.SSS aaa'
  --singleLine     format the output as a single line, defaults to false
  `,
  {
    importMeta: import.meta,
    flags: {
      exclude: {
        type: 'string',
        shortFlag: 'e',
      },
      include: {
        type: 'string',
        shortFlag: 'i',
      },
      messageKey: {
        type: 'string',
      },
      errorKey: {
        type: 'string',
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
    },
  },
);

const cliConfig: PrettifyOptions = {};

if (cli.flags.exclude) {
  cliConfig.exclude = cli.flags.exclude.split(',').map((str) => str.trim());
}

if (cli.flags.include) {
  cliConfig.include = cli.flags.include.split(',').map((str) => str.trim());
}

if (cli.flags.messageKey) {
  cliConfig.messageKey = cli.flags.messageKey;
}

if (cli.flags.errorKey) {
  cliConfig.errorKey = cli.flags.errorKey;
}

if (cli.flags.timeFormat) {
  cliConfig.timeFormat = cli.flags.timeFormat;
}

if (cli.flags.singleLine) {
  cliConfig.singleLine = cli.flags.singleLine;
}

if (cli.flags.timeKey) {
  cliConfig.timeKey = cli.flags.timeKey;
}

const defaultConfig: PrettifyOptions = {
  messageKey: 'msg',
  errorKey: 'err',
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
