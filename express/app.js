var express = require('express');
var app = express();



// declares content as file serve folder
app.use(express.static( __dirname +'/content'));

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});


// switch handlers for socket io
var _socket = null,
  io = require('socket.io')(server);

io.on('connection', function (socket) {
  _socket = socket;
  console.log('socket set' + _socket);
});

app.get('/switch', function (req, res) {
  var args = getUrl(req)
  
  if (_socket){
    _socket.emit('switch', { value: args.switch });
    console.log('socket push : switch ' + args.switch);
  }
  else{
    console.log('no socket!');
  }

  res.send(args.value);
  
});


// parses querystrings
function getUrl(req){
  var url = require('url'),
    url_parts = url.parse(req.url, true),
        query = url_parts.query;
    return query; 
}
