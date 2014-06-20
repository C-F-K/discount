var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var url = require('url');
var io = require('socket.io')(http);

app.use('/public', express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/elements', express.static(__dirname + '/public/elements'));
app.use('/vendor', express.static(__dirname + '/public/vendor'));

app.get('/', function(req, res){
	res.sendfile('public/index.html');
});

io.on('connection', function(socket){
	console.log('a user connected');
	console.log(socket.id);
// 	socket.on('disconnect', function(){
// 		console.log('user disconnected');
// 	});
// 	socket.on('chat message', function(msg){
// 		console.log('message: ' + msg);
// 		io.emit('chat message', msg);
// 	});
});

var port = Number(process.env.PORT || 5000);

http.listen(port, function(){
	console.log('listening on *:' + port);
});