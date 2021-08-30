const { fromEvent } = require('rxjs');

var express = require('express')
  , http = require('http')
  , app = express()
  , serv = http.createServer(app);

var players = [];
var items = [];

function Play(id, x, y, r, a, s){
	this.id = id;
	this.x = x;
	this.y = y;
	this.r = r; //size
	this.a = a; //role
	this.s = s; //score
}

function Item(x, y, r, c){
	this.x = x;
	this.y = y;
	this.r = r; //size
	this.c = c; //colour
}

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
  //console.log(req.socket.address());
});

app.use('/www', express.static(__dirname + '/'));

serv.listen(2000, () => {
    console.log("server started");
});

var io = require('socket.io')(serv, {});

setInterval(return_to_client, 33);

function return_to_client(){
	io.sockets.emit('return_player', players);
	io.sockets.emit('return_item', items);
}

io.sockets.on('connection', function(socket){
	console.log(socket.request.connection.remoteAddress);
	console.log('socket connection ' + socket.id);

	fromEvent(socket, "start").subscribe((data) => {
		var player = new Play(socket.id, data.x, data.y, data.r, data.a, data.s);
		players.push(player);
		console.log(data);
	});

	fromEvent(socket, "start_item").subscribe((data) => {
		var item = new Item(data.x, data.y, data.r, data.c);
		items.push(item);
	});

	fromEvent(socket, "update").subscribe((data) => {
		var player = new Play(socket.id, data.x, data.y, data.r, data.a, data.s);

		for (var i = 0; i < players.length; i++) {
			if (socket.id == players[i].id) {
				player = players[i];
			}
		}
		
		player.x = data.x;
		player.y = data.y;
		player.r = data.r;
		player.a = data.a;
		player.s = data.s;
	});

	fromEvent(socket, "update_item").subscribe((data) => {
		var item = new Item(data.x, data.y, data.r, data.c);

		item.x = data.x;
		item.y = data.y;
		item.r = data.r;
		item.c = data.c;
	});

	//delete player
	fromEvent(socket, "delete").subscribe((data) => {
		for (var i = 0; i < players.length; i++) {
			if (data == players[i].id) {
				players.splice(i,1);
				console.log(data);
			}
		}
	});

	fromEvent(socket, "delete_item").subscribe((data) => {
		for (var i = items.length - 1; i >= 0 ; i--) {
			if (data == i) {
				items.splice(i,1);
			}
		}
	});
});