<h1 align="center">RMQ-RPC</h1>
<h4 align="center">RabbitMQ RPC client and server</h4>

<p align="center">
   <a href="https://github.com/feross/standard" target="_blank">
      <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat" alt="js-standard-style"></img>
   </a>
</p>

## Table of Contents

- [Features](#features)
- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Development](#development)

## Features

- Simple
- Lightweight
- Promise based
- Easiest API as possible
- Designed with performance in mind

## Install

## Usage

```js
// server.js
var open = require('amqplib').connect('amqp://localhost')
var RpcServer = require('rmq-rpc').Server

var server = new RpcServer({
  name: 'math',
  methods: {
    add ({ x, y }) {
      console.log('add', x, y)
      return Number(x) + Number(y)
    },

    sub ({ x, y }) {
      console.log('sub', x, y)
      return Number(x) - Number(y)
    },

    mul ({ x, y }) {
      console.log('mul', x, y)
      return Number(x) * Number(y)
    },

    div ({ x, y }) {
      console.log('div', x, y)
      return Number(x) / Number(y)
    }
  }
})

function main (channel) {
  server.setup(channel)
}

open
  .then(connection => connection.createChannel())
  .then(main)
  .catch(console.warn)
```

```js
// client.js
var express = require('express')
var argv = require('minimist')(process.argv.slice(2))
var open = require('amqplib').connect('amqp://localhost')
var RpcClient = require('rmq-rpc').Client

var client = new RpcClient({ name: 'math' })

function main (channel) {
  client.setup(channel)
}

var connected = open
  .then(connection => connection.createChannel())
  .then(main)

var app = express()

app.get('/add/:x/:y', function (req, res) {
  client.call('add', req.params)
    .then(result => res.send(String(result)))
})

app.get('/sub/:x/:y', function (req, res) {
  client.call('sub', req.params)
    .then(result => res.send(String(result)))
})

app.get('/mul/:x/:y', function (req, res) {
  client.call('mul', req.params)
    .then(result => res.send(String(result)))
})

app.get('/div/:x/:y', function (req, res) {
  client.call('div', req.params)
    .then(result => res.send(String(result)))
})

app.listen(argv.port, function () {
  console.log(`Listening on port ${argv.port}`)
})
```

## API

### RpcServer

#### `#constructor({ name, methods })`

#### `#setup(channel)`

#### `#emit(eventName, data)`

### RpcClient

#### `#constructor({ name })`

#### `#setup(channel)`

#### `#call(method, data, { timeout = 5000 })`

#### `#on(eventName, handler)`

#### `#off(eventName, handler)`


## Development

Command | Description
------- | -----------
`npm run check` | Check standard code style by [snazzy](https://www.npmjs.com/package/snazzy)
