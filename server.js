/*  Variables and import
    
    Imports the express package and creates a server.
    Imports the game engine that handles all game logic.
    Imports http and makes a server that socket.io can listen to.
*/
var express     = require('express'),
    server      = module.exports = express(),
    engine      = require('./server/js/engine.js'),
    ioserver    = require('http').createServer(server),
    games       = {};



/*  Configuration of express server:
    
    Makes the ejs module handle all html files.
    Sets port to 8008.
    Directs all view-requests to the views folder.
    All static files are served from the rec folder
*/
server.engine('.html', require('ejs').__express);
server.set('views', __dirname + '/client/views');
server.use(express.static(__dirname + '/client/rec'));
server.set('view engine', 'html');
server.set('port', process.env.PORT || 8008);



/*  Handle http requests:
    
    Only the '/' adress is handled, and returns the 
    index.html page that contains the canvas.
*/
server.get('/', function(request, response){
    response.render('index');
})
console.log('Server running at http://127.0.0.1:8008/');



/* Configure Socket.IO:
    
    The socket.IO server listens to a http-server that listens to the express server.
*/
ioserver.listen(server.get('port'));
var socket_listener = require('socket.io').listen(ioserver);


/*  TODO Configures the socket.io server
*/
//socket_listener.configure(function (){
//    socket_listener.set('log level', 0);
//    socket_listener.set('authorization', function //(handshakeData, callback) {
//        callback(null, true);
//    });
//});

/*  Handle client interaction through socket.io:
    
    TODO Clients are given a custom ID .
    Tells the client that it has connected.
    TODO Starts a game session with the client.
    Listens for commands and sends them to the game engine.
    TODO Listens for disconnects and ends the game associated with the disconnected player.
*/   
socket_listener.sockets.on('connection', function (client) {

    // TODO Client setup
    client.userid = 1;
    client.emit('is_connected');
    console.log('**SOCKET_LISTENER** client ' + client.userid + ' connected');

    
    //Client sent log message
    client.on('msg', function(msg) {
        console.log('**SOCKET_LISTENER** received message: '+ msg);
    });
            
    client.on('end_game', function(c) {
        console.log('**SOCKET_LISTENER** received command ' + c);
        engine.end_game(client, c);
    });
    
    client.on('create_game', function(c) {
        console.log('**SOCKET_LISTENER** received create command ' + c);
        var g = new engine(0, client);
        games[g.id] = g;
        client.game_id = g.id;
        
        g.start(client);
    });
    
    client.on('join_game', function(c) {
        console.log('**SOCKET_LISTENER** received join command ' + c);
        engine.join_game(client, c);
    });
    
    client.on('leave_game', function(c) {
        console.log('**SOCKET_LISTENER** received leave command ' + c);
        engine.leave_game(client, c);
    });
    
    client.on('reconnect_game', function(c) {
        console.log('**SOCKET_LISTENER** received reconnect command ' + c);
        engine.reconnect_game(client, c);
    });
    
    client.on('game_command', function(c) {
        console.log('**SOCKET_LISTENER** received in-game command ' + c);
        var parsed = JSON.parse(c);
        engine.command(client, parsed);
    });

    client.on('disconnect', function () {
        console.log('**SOCKET_LISTENER** client ' + client.userid + ' disconnected.');
        //engine.endGame(client.game.id, client.userid);
    });
      
});// end onConnection

   
    
    
    
