#!/usr/bin/env node

const process = require('node:process');
const os = require('node:os');
const pump = require('pump');
const {cosmiconfigSync} = require('cosmiconfig');
const build = require('.');

const explorer = cosmiconfigSync('pino-prettier', {stopDir: os.homedir()});
const {config} = explorer.search(process.cwd()) || {};

const res = build(config);
pump(process.stdin, res);
