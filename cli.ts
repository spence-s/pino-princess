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
        default: 'msg',
      },
      errorKey: {
        type: 'string',
        default: 'err',
      },
      singleLine: {
        type: 'boolean',
        default: false,
      },
      timeFormat: {
        type: 'string',
        default: 'h:mm:ss.SSS aaa',
      },
    },
  },
);
const options: PrettifyOptions = {};

if (cli.flags.exclude) {
  options.exclude = cli.flags.exclude.split(',').map((str) => str.trim());
}

if (cli.flags.include) {
  options.include = cli.flags.include.split(',').map((str) => str.trim());
}

options.messageKey = cli.flags.messageKey;
options.errorKey = cli.flags.errorKey;
options.timeFormat = cli.flags.timeFormat;
options.singleLine = cli.flags.singleLine ?? false;

const explorer = cosmiconfigSync('pino-princess', {stopDir: os.homedir()});
const {config} = (explorer.search(process.cwd()) ?? {}) as {
  config: PrettifyOptions;
};

const res = build({...config, ...options});

pump(process.stdin, res);

if (!process.stdin.isTTY && !fs.fstatSync(process.stdin.fd).isFile()) {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  process.once('SIGINT', function () {});
}
