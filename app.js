const Emitter = require('events');
const eventConfig = require('./config').events

var emtr = new Emitter();

emtr.on(eventConfig.GREET, function() {
  console.log('1st');
})

emtr.on(eventConfig.GREET, function() {
  console.log('2nd');
})

emtr.emit('greet');
