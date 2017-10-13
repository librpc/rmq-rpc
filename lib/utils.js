function guid () {
  return Math.floor((1 + Math.random()) * 1e6).toString(16)
}

function createQueue (type, controller, method) {
  return `rmq-rpc-queue-${type}-${controller}-${method}`
}

function createExchange (type, controller) {
  return `rmq-rpc-exchange-${type}-${controller}`
}

module.exports = {
  guid,
  createQueue,
  createExchange
}
