#!/usr/bin/env node

const process = require('node:process');
const pump = require('pump');
const build = require('.');

const res = build();
pump(process.stdin, res);
