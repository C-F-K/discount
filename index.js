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

var population = new Object();
var occupiedSpaces = new Object();

io.sockets.on('connection', function(socket){
	console.log('a user connected');
	var userId = socket.id;
	var newUser = { 'uuid' : userId };
	socket.emit('uuid', newUser);
	population[userId] = new Object();
	console.log(population);
	socket.on('newChar', function(e){

		population[userId] = {
			id: userId,
			rank: e.rank,
			file: e.file,
			chr: e.chr,
			clr: e.clr,
			nm: e.nm,
			lastknownplace: e.lastknownplace
			
		};
		var newSpace = e.file + e.rank;
		occupiedSpaces[newSpace] = userId;
		console.log('occupied:');
		console.log(occupiedSpaces);
		console.log('user has specified char:');
		console.log(population);
		io.sockets.emit('newCharAdded', occupiedSpaces);
	});

	socket.on('requestCharData',  function(payload){

	});
	socket.on('updateCharData', function(payload){

	});

	socket.on('disconnect', function(){
		var emptySpace = population[userId].file + population[userId].rank;
		io.sockets.emit('userLeaving', emptySpace)
		delete population[userId];
		delete occupiedSpaces[emptySpace];
		// console.log('population:');
		// console.log(population);
		// console.log('occupied:');
		// console.log(occupiedSpaces);
	});
});

var port = Number(process.env.PORT || 5000);

http.listen(port, function(){
	console.log('listening on *:' + port);
});

