# pino-princess 👸 💅

A pretty dev logger for pino and other ndjson.

Largely inspired from the great pino-colada project but with all the bells and whistles of pino-pretty.

## Goals

Pino pretty is hard to configure and I didn't like the defaults. However, it was very good at always showing me all my data. Unfortunately, I didn't care about seeing all the data. For example, most of the time, req/res headers are just noise for me during development.

Pino colada was an awesome output format, but it was inflexible. I also couldn't see all my data when I wanted to because of its rigidity.

In order to get the best of both worlds, I started from a fork of pino-pretty, and developed a configurable version that always displays all your data, except when you don't want it to! You could probably get something pretty similar with just an advanced pino-pretty configuration, but use this if you are too lazy.


### Install

`npm install pino-princess --save-dev`
or
`yarn install -D pino-princess`

