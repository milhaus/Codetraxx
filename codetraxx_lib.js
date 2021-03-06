var amqp = require('amqp');

var config = {
  rabbitUrl:'amqp://guest:@localhost',
  queueName:'bpm'
};

function createConnection() {
  return amqp.createConnection({url:config.rabbitUrl});
}

function safeEndConnection(connection) {
    // `connection.end` doesn't flush outgoing buffers, run a
    // synchronous command to comprehend
    connection.queue('tmp-' + Math.random(), {exclusive: true}, function(){
        connection.end();
        // `connection.end` in 0.1.3 raises a ECONNRESET error, silence it:
        connection.once('error', function(e){
            if (e.code !== 'ECONNRESET' || e.syscall !== 'write')
                throw e;
        });
    });
};


function publish(msg, conn) {
  console.log("starting..");
  if (conn === undefined) {
    conn = createConnection();
  }
  conn.on('ready', function () {
    console.log("Sending message...");
    conn.exchange(config.queueName, {type: 'fanout', autoDelete: true},
      function(exchange){
        exchange.publish('',msg);
        safeEndConnection(conn);
    });
  });
}

function subscribe(exchange, conn) {
  console.log("Subbbbing...");
  if (conn === undefined) {
    conn = createConnection();
  }
  conn.on('ready', function() {
    console.log("Subscribing to " + exchange);
    conn.exchange(exchange, {type: 'fanout', autoDelete: true}, function(exch) {
      conn.queue('tmp-' + Math.random(), {exclusive: true},function(queue){
        queue.bind(exchange, '');
        console.log('[*] -- waiting for the dataz.');

        queue.subscribe(function(msg) {
          console.log("[*] %s", msg.data.toString('utf-8'));
        });
      });
    });
  });
}

function sin (x) {
  return Math.sin(tau * t * x);
}

function square (x) {
  var n = Math.sin(tau * t * x);
  return n > 0 ? 1 : -1;
}

function sawtooth (x) {
  return t % (1 / x) * x * 2 - 1;
}

function playrrr (sound_file) {
  var cmd = "play " + sound_file;
  console.log(cmd);
  return exec(cmd);
}

//  module.exports.init = init;
module.exports.publish = publish;
module.exports.subscribe = subscribe;
module.exports.createConnection = createConnection;
module.exports.sin = sin;
module.exports.square = square;
module.exports.sawtooth = sawtooth;
module.exports.playrrr = playrrr;
