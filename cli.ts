#!/usr/bin/env node
import fs from 'node:fs';
import process from 'node:process';
import os from 'node:os';
import {pathToFileURL} from 'node:url';
import pump from 'pump';
import {cosmiconfigSync} from 'cosmiconfig';
import type {PrettifyOptions} from './lib/utils/types';
import {build} from './index';

(async () => {
  const {default: meow} = await import('meow');

  const cli = meow(
    `
  Usage
    $ my-app | pino-princess

  Options
    --blackList, -b Blacklisted log fields separated by comma. Is overriden by whiteListed fields.
    --whiteList, -w Whitelisted log fields separated by comma. Overrides blackListed fields.
  `,
    {
      importMeta: {url: pathToFileURL(__filename).toString()},
      flags: {
        blackList: {
          type: 'string',
          alias: 'b',
        },
        whiteList: {
          type: 'string',
          alias: 'b',
        },
      },
    },
  );
  const options: PrettifyOptions = {};

  if (cli.flags.blackList) {
    options.blackList = cli.flags.blackList.split(',').map((str) => str.trim());
  }

  if (cli.flags.whiteList) {
    options.whiteList = cli.flags.whiteList.split(',').map((str) => str.trim());
  }

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
})();
