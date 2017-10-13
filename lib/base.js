var { createExchange } = require('./utils.js')
var { exchangeOptions } = require('./defaults.js')

class RmqRpc {
  constructor ({ name }) {
    this.name = name
    this.methodsExchange = createExchange('methods', this.name)
    this.eventsExchange = createExchange('events', this.name)
  }

  setup (channel) {
    this.channel = channel
    this.channel.assertExchange(this.methodsExchange, 'direct', exchangeOptions)
    this.channel.assertExchange(this.eventsExchange, 'direct', exchangeOptions)
  }
}

module.exports = RmqRpc
