var RmqRpc = require('./base.js')
var { createQueue } = require('./utils.js')
var { methodQueueOptions } = require('./defaults.js')

class RpcServer extends RmqRpc {
  constructor ({ name, methods }) {
    super({ name })
    this.methods = methods
  }

  setup (channel) {
    super.setup(channel)
    this.listen()
  }

  listen () {
    for (var method in this.methods) {
      this.listenTo(method)
    }
  }

  listenTo (method) {
    var queue = createQueue('method', this.name, method)
    this.channel.assertQueue(queue, methodQueueOptions)
    this.channel.bindQueue(queue, this.methodsExchange, method)
    this.channel.consume(queue, this.handler.bind(this, method))
  }

  handler (method, msg) {
    this.channel.ack(msg)
    Promise.all([
      msg.properties.replyTo,
      msg.properties.correlationId,
      this.methods[method](JSON.parse(msg.content.toString()))
    ])
    .then(this.reply.bind(this))
  }

  reply ([replyTo, correlationId, result]) {
    this.channel.sendToQueue(
      replyTo,
      Buffer.from(JSON.stringify(result)),
      { correlationId }
    )
  }

  emit (eventName, data) {
    this.channel.publish(
      this.eventsExchange,
      eventName,
      Buffer.from(JSON.stringify(data))
    )
  }
}

module.exports = RpcServer
