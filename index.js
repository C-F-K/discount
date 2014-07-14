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
		console.log(population[userId]);
		io.sockets.emit('newCharAdded', occupiedSpaces);
	});

	socket.on('userMoved', function(payload){
		var mid = payload[0];
		var newplace = payload[1];
		population[mid].lastknownplace = population[mid].file + population[mid].rank;
		// console.log('lkp')
		// console.log(population[mid].lastknownplace);
		population[mid].file = newplace.substring(0,1);
		population[mid].rank = newplace.substring(1);
		var oldplace = population[mid].lastknownplace;
		delete occupiedSpaces[oldplace];
		occupiedSpaces[newplace] = mid; 
		var resPayload = [mid, oldplace, newplace];
		io.sockets.emit('movedUser', resPayload);
	});
	
	socket.on('consoleCommand', function(payload){
		var cid = payload[0];
		var ccmd = payload[1];
		var resString = cid + ": " + ccmd;
		io.sockets.emit('consoleMsg', resString);
		// if logging: add code here to add string to log
	});

	socket.on('requestCharData', function(payload){

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

