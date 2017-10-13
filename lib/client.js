var RmqRpc = require('./base.js')
var { createQueue, guid } = require('./utils.js')
var {
  eventQueueOptions,
  replyQueueOptions,
  eventsConsumeOptions,
  replyConsumeOptions
} = require('./defaults.js')

class RpcClient extends RmqRpc {
  constructor ({ name }) {
    super({ name })
    this.id = guid()

    this.events = {}
    this.calls = {}
    this.timeouts = {}
  }

  setup (channel) {
    super.setup(channel)
    this.subscribeToReply()
    this.subscribeToEvents()
  }

  subscribeToReply () {
    this.replyQueue = createQueue('reply', this.name, this.id)
    this.channel.assertQueue(this.replyQueue, replyQueueOptions)
    this.channel.consume(this.replyQueue, this.handleReply.bind(this), replyConsumeOptions)
  }

  handleReply (msg) {
    var correlationId = msg.properties.correlationId
    var data = JSON.parse(msg.content.toString())
    this.resolve(correlationId, data)
  }

  resolve (correlationId, data) {
    if (this.calls[correlationId]) {
      clearTimeout(this.timeouts[correlationId])
      this.calls[correlationId](data)
      this.clear(correlationId)
    }
  }

  clear (correlationId) {
    delete this.timeouts[correlationId]
    delete this.calls[correlationId]
  }

  call (method, data, { timeout = 5000 } = {}) {
    return new Promise((resolve, reject) => {
      var correlationId = guid()
      this.channel.publish(this.methodsExchange, method, Buffer.from(JSON.stringify(data)), {
        correlationId,
        replyTo: this.replyQueue,
        persistent: true
      })
      this.calls[correlationId] = resolve
      this.timeouts[correlationId] = setTimeout(() => {
        reject(new Error(`RPC timeout exceeded for '${method}' call`))
        this.clear(correlationId)
      }, timeout)
    })
  }

  subscribeToEvents () {
    this.eventsQueue = createQueue('events', this.name, this.id)
    this.channel.assertQueue(this.eventsQueue, eventQueueOptions)
    this.channel.consume(this.eventsQueue, this.handleEvents.bind(this), eventsConsumeOptions)
  }

  handleEvents (msg) {
    var eventName = msg.properties.correlationId
    var data = JSON.parse(msg.content.toString())
    this.trigger(eventName, data)
  }

  trigger (eventName, data) {
    var handlers = this.events[eventName] || []
    for (var i = 0; i < handlers.length; i++) {
      handlers[i](data)
    }
  }

  on (eventName, handler) {
    var handlers = this.events[eventName]
    if (handlers) {
      handlers.push(handler)
    } else {
      this.events[eventName] = [handler]
      this.channel.bindQueue(this.eventsQueue, this.eventExchange, eventName)
    }
  }

  off (eventName, handler) {
    var handlers = this.events[eventName] || []
    var idx = handlers.indexOf(handler)
    if (idx !== -1) {
      this.events[eventName].splice(idx, 1)
      if (!this.events[eventName].length) {
        this.channel.unbindQueue(this.eventsQueue, this.eventExchange, eventName)
      }
    }
  }
}

module.exports = RpcClient
