#!/usr/bin/env node
import fs from 'node:fs';
import process from 'node:process';
import os from 'node:os';
import {pathToFileURL} from 'node:url';
import pump from 'pump';
import {cosmiconfigSync} from 'cosmiconfig';
import type {PrettifyOptions} from './lib/utils/types';
import {build} from './index';

// eslint-disable-next-line unicorn/prefer-top-level-await
(async () => {
  const {default: meow} = await import('meow');

  const cli = meow(
    `
Usage
  $ node my-app-with-pino-logging | pino-princess

Options
  --blacklist, -b    blacklisted log fields separated by comma. Is overriden by whitelisted fields.
  --whitelist, -w    whitelisted log fields separated by comma. Overrides blacklisted fields.
  `,
    {
      importMeta: {
        url: pathToFileURL(__filename).toString(),
        resolve: (specified: string) =>
          pathToFileURL(require.resolve(specified)).toString(),
      },
      flags: {
        blacklist: {
          type: 'string',
          alias: 'b',
        },
        whitelist: {
          type: 'string',
          alias: 'w',
        },
      },
    },
  );
  const options: PrettifyOptions = {};

  if (cli.flags.blacklist) {
    options.blacklist = cli.flags.blacklist.split(',').map((str) => str.trim());
  }

  if (cli.flags.whitelist) {
    options.whitelist = cli.flags.whitelist.split(',').map((str) => str.trim());
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
