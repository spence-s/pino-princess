#!/usr/bin/env node
const fs = require('fs');
const process = require('node:process');
const os = require('node:os');
const pump = require('pump');
const {cosmiconfigSync} = require('cosmiconfig');
const build = require('.');

const explorer = cosmiconfigSync('pino-princess', {stopDir: os.homedir()});
const {config} = explorer.search(process.cwd()) || {};

const res = build(config);
pump(process.stdin, res);

if (!process.stdin.isTTY && !fs.fstatSync(process.stdin.fd).isFile()) {
  process.once('SIGINT', function () {});
}
