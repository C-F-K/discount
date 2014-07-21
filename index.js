var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var url = require('url');
var io = require('socket.io')(http);

app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 8000);  
app.set('ipaddr', process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");  

app.use('/public', express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/elements', express.static(__dirname + '/public/elements'));
app.use('/vendor', express.static(__dirname + '/public/vendor'));

app.get('/', function(req, res){
	res.sendfile('public/index.html');
});

var population = new Object();
var occupiedSpaces = new Object();

var commands = {
	'me': function(prm) {
		var fid = prm[0];
		var action = prm[1];
		var resString = population[fid].nm + " " + action;
		return ['me', resString];
	}
};

io.sockets.on('connection', function(socket){
	// console.log('a user connected');
	var userId = socket.id;
	var newUser = { 'uuid' : userId };
	socket.emit('uuid', newUser);
	population[userId] = new Object();
	socket.emit('prepopulate', occupiedSpaces);

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
		occupiedSpaces[newSpace] = {id: userId, nm: population[userId].nm};
		// console.log('occupied:');
		// console.log(occupiedSpaces);
		// console.log('user has specified char:');
		// console.log(population[userId]);
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
		occupiedSpaces[newplace] = population[mid].nm; 
		var resPayload = [mid, oldplace, newplace];
		io.sockets.emit('movedUser', resPayload);
	});
	
	socket.on('consoleMessage', function(payload){
		var cid = payload[0];
		var ccmd = payload[1];
		var cnm = population[cid].nm;
		var resString = cnm + ": " + ccmd;
		io.sockets.emit('consoleMsg', resString);
		// if logging: add code here to add string to log
	});

	socket.on('consoleCommand', function(payload){
		var cmd = payload.pop();
		if (commands[cmd]) {
			var returned = commands[cmd](payload);
			io.sockets.emit('consoleReturn', returned);
		}
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

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8000
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

// http.listen(server_port, server_ip_address, function () {
//   console.log( "Listening on " + server_ip_address + ", port " + server_port )
// });

http.listen(function () {
  console.log( "Listening on " + server_ip_address + ", port " + server_port )
});