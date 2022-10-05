# pino-princess 👸 💅

A pretty dev logger for pino and other ndjson.

Largely inspired from the great pino-colada project but with all the bells and whistles of pino-pretty.

## Goals

Pino pretty is hard to configure and I didn't like the defaults. However, it was very good at always showing me all my data. Unfortunately, I didn't care about seeing all the data. For example, most of the time, req/res headers are just noise for me during development.

Pino colada was an awesome output format, but it was inflexible. I also couldn't see all my data when I wanted to because of its rigidity.

In order to get the best of both worlds, I started from a fork of pino-pretty, and developed a configurable version that always displays all your data, except when you don't want it to!

## Use

### Install

`npm install pino-princess --save-dev`
or
`yarn install -D pino-princess`

### Configure

As a pino v7 transport.

```js
const pino = require('pino');

const logger = pino({
  transports: {
    ...
  }
})
```
