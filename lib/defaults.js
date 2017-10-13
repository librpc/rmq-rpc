var exchangeOptions = {
  durable: true
}

var methodQueueOptions = {
  durable: true,
  autoDelete: true
}

var eventQueueOptions = {
  durable: false,
  exclusive: true
}

var replyQueueOptions = {
  durable: false,
  exclusive: true
}

var eventsConsumeOptions = {
  noAck: true
}

var replyConsumeOptions = {
  noAck: true
}

module.exports = {
  exchangeOptions,
  methodQueueOptions,
  eventQueueOptions,
  replyQueueOptions,
  eventsConsumeOptions,
  replyConsumeOptions
}
