/******************************SET UP THE SERVER******************************/

//Import modules
var express = require("express");
var http = require("http");
var websocket = require("ws");
var indexRouter = require("./routes/index.js"); //middleware
var loginRouter = require("./routes/login.js"); //middleware
var gameStatus = require("./statTracker");
var Game = require("./game");

//Port config, create Express application an create server
var port = process.argv[2];
var app = express();
var server = http.createServer(app);

//add middleware components
//url logger
app.use(function (request, response, next) {
    console.log("%s\t%s\t%s\t%s\t", new Date(), request.ip.substr(7), request.method, request.url);
    //for Heroku use request.headers['x-forwarded-for'] for the ip
    next(); //control shifts to next middleware function (If we dont use this the user will be left hanging without a response)
});

//this one feeds all the files requested that are nested in /public folder (this saves us from having to create request handlers for images, html files, audios etc.)
app.use(express.static(__dirname + "/public"));

//Engine to render data
app.set("view engine", "ejs");

//modular example of Requests handler
app.get('/', indexRouter);
app.get("/favicon.ico", indexRouter);
app.get("/splash", indexRouter);
app.get("/play", indexRouter);
app.get('/auth*', loginRouter); //uses sessions (It's very important that this is executed before any other child of /auth/...)
app.get('/login', loginRouter); //uses sessions (if already loged in sends to homepage)
app.post('/login', loginRouter); //creates a session
app.get('/logout', loginRouter); //deletes the session
app.get('/auth/broadcast', indexRouter); //uses sessions (but does not need to be in the loginRouter as /auth* already covers it) does not serve any particular purpose, just for demonstration

//server-client cookies (no particular purpose, but could be used to set user preferences)
app.get("/cookies", loginRouter);
app.get("/fresh", loginRouter);

//not found/error handlers (this needs to be at the end otherwise you wont have access to any page)
app.use(function (req, res, next) {
    res.status(404).redirect("/images/error.jpg");
});
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).redirect("/images/error.jpg");
});

/******************************SOCKET COMMUNICATION ******************************/

//INITIALISE GAMES
var websockets = {}; //property: websocket, value: game
var connectionID = 0; //each websocket receives a unique ID
const wss = new websocket.Server({ server }); //initialise socket object
module.exports = wss;

//we start with 0 intialised games and set a currentGame variable object to be gameOver = true for the logic below.
//this is done like this so that only when there's a connection a game is initalised.
var currentGame = {
    gameOver: true,
    player2: null
};

//BEHAVIOUR DURING THE ENTIRE SOCKET CONNECTION
wss.on("connection", function connection(socket, req) {
    socket.id = connectionID++;
    var user = "";
    
    //allow for custom names (supports both signed names and unsigned names)
    if (req.headers.cookie) {
        var cookiesArray = req.headers.cookie.split('; ');
        for (i = 0; i < cookiesArray.length; i++) {
            var cookie = cookiesArray[i].split("=");
            if (cookie[0] == "user_nickname") {
                var dot = cookie[1].indexOf('%40'); //code for @
                //allow for unsigned, unregistered usernames
                if (dot != -1) {
                    user = cookie[1].substr(4, dot - 4);
                } else {
                    user = cookie[1];
                }
            }
        }
    }
    if (user == ""){
        user = "Guest" + socket.id;
    }
    //dont let admin (only user) connect to a specific game.
    if (user == 'admin') {
        let sendObject =
        {
            type: "CHAT",
            data: "You can't play with that nickname"
        };
        socket.send(JSON.stringify(sendObject));

        socket.on("message", function incoming(message) {

            //Parse text to a workable object
            let messageObject = JSON.parse(message);

            //ADMIN CHAT
            if (messageObject["type"] == "ADMIN") {
                let sendObject =
                {
                    type: "CHAT",
                    data: messageObject["data"]
                };
                //send to all players
                wss.clients.forEach(function each(client) {
                    client.send(JSON.stringify(sendObject));
                });
                console.log("%s\t%s\t%s\t%s\t", new Date(), "all games ", "CHAT", JSON.parse(JSON.stringify(sendObject))["data"]); //for server debugging
            }
        });
    } else {

        gameStatus.onlinePlayersCount++;
        // two-player game: every two players are added to the same (non-started) game
        
        if (currentGame.gameOver == true || currentGame.player2 != null) { //if it is game over (or if it doesnt exist yet), or full, then a new game object is created
            currentGame = new Game(gameStatus.gamesInitialized++);
        }
        let playerType = currentGame.addPlayer(socket); //adds player to a non-finished game with a player slot available

        //array of games, the indexes are the player's ids (i.e. websockets[0] = websockets[1] = game 0)
        //This will support multiple live games as we can now link a received socket message
        //to their respective game, and broadcast responses to that specific game only
        websockets[socket.id] = currentGame; //beware immeadeately after p2 joins this reference is overwritten by a new game object so after that point it no longer presents the "current" game, use the websockets array which contain the actual games per socket

        console.log("%s\t%s\t%s\t%s\t", new Date(), "gameroom " + currentGame.id, "PLY" + playerType, "socket", socket.id, user); //for server debugging

        if (currentGame.player2 != null) {
            //CLIENT 2 TRIGGERS GAME START
            if (playerType == 2) {
                let messageToP1 = {
                    type: "P2 IS READY"
                }
                let messageToP2 = {
                    type: "P1 IS READY"
                }
                //since currentGame has been replaced there are only empty players in that reference
                //only way to fetch the socket of player 1 is to check the websockets array
                //which contains the game objects, and get player1 socket from there
                websockets[socket.id].player1.send(JSON.stringify(messageToP1));
                websockets[socket.id].player2.send(JSON.stringify(messageToP2));
                console.log("%s\t%s\t%s\t", new Date(), "gameroom " + websockets[socket.id].id, "START"); //for server debugging
            }
        }

        //BEHAVIOUR DURING RECEIVED MESSAGES
        socket.on("message", function incoming(message) {

            //Parse text to a workable object
            let messageObject = JSON.parse(message);

            //Reference to the server game object played by this client
            let gameObject = websockets[socket.id];

            //Checks the player role of the socket
            let isPlayer1 = gameObject.player1 == socket ? true : false;

            //CHAT
            if (messageObject["type"] == "CHAT") {
                let sendObject =
                {
                    type: "CHAT",
                    data: "[" + user + (isPlayer1 ? "(red P1)]: " : "(blue P2)]: ") + messageObject["data"]
                };

                gameObject.player1.send(JSON.stringify(sendObject));
                //Games are started without P2, so until it joins this avoids nullpointer error
                if (gameObject.player2 != undefined) {
                    gameObject.player2.send(JSON.stringify(sendObject));
                }
                console.log("%s\t%s\t%s\t%s\t", new Date(), "gameroom " + gameObject.id, "CHAT", JSON.parse(JSON.stringify(sendObject))["data"]); //for server debugging
            }

            //CLIENT SENDS BOARD/DICE UPDATE
            //Server just echoes what one client sends to the other
            if (messageObject["type"] == "UPDATE" || messageObject["type"] == "DICE") {
                if (isPlayer1) {
                    gameObject.player2.send(message);
                } else {
                    gameObject.player1.send(message);
                }
                let game = JSON.parse(JSON.stringify(messageObject))["data"];
                if (messageObject["type"] == "UPDATE") {
                    console.log("%s\t%s\t%s\t%s\t", new Date(), "gameroom " + gameObject.id, messageObject.type, "score", game.scoreP1, game.scoreP2, user); //for server debugging
                } else {
                    console.log("%s\t%s\t%s\t%s\t", new Date(), "gameroom " + gameObject.id, messageObject.type, "number", JSON.parse(JSON.stringify(messageObject))["data"], user); //for server debugging
                }
            }

            //Although clients will see the game over updates on their own
            //we want to update this data for Server stats
            if (messageObject["type"] == "GAMEOVER") {
                gameObject.gameOver = true; //now mantainance can delete it from memory
                gameObject.winner = messageObject["data"];
                if (gameObject.winner != 0) { //(has a winner or is a draw) 
                    gameStatus.gamesCompleted++;
                    //we let the clients use the chat, we're not gonna kick them
                } else { //it is aborted
                    gameStatus.gamesAborted++;
                    //close remaining open connections
                    try {
                        gameObject.player1.send(message); //echo abort message to notify other player
                        gameObject.player1.close();
                        gameObject.player1 = null; //doing this allows us to reuse the game and assign players to this game if p1 quits a non started game
                    } catch (e) {
                    }

                    try {
                        gameObject.player2.send(message); //echo abort message to notify other player
                        gameObject.player2.close();
                        gameObject.player2 = null;
                    } catch (e) {
                    }
                }

                console.log("%s\t%s\t%s\t", new Date(), "gameroom " + gameObject.id, "END", JSON.parse(JSON.stringify(messageObject))["data"], user); //for server debugging
            }
        });

        //BEHAVIOUR AT CONNECTION CLOSURE
        socket.on("close", function (code) {
            let gameObject = websockets[socket.id];
            gameStatus.onlinePlayersCount--;

            // code 1001 means closing initiated by the client;
            console.log("%s\t%s\t%s\t%s\t", new Date(), "gameroom " + gameObject.id, "DSCNCT", "socket ", user); //for server debugging

            if (code == "1001") {

                // if possible, abort the game; if not, the game is already completed
                if (gameObject.gameOver == false) { //only register as aborted from the first quitter
                    gameStatus.gamesAborted++;
                    console.log("%s\t%s\t%s\t", new Date(), "gameroom " + gameObject.id, "END", 0, user); //for server debugging


                    //close remaining open connections
                    let message =
                    {
                        type: "GAMEOVER",
                        data: 0
                    };
                    try {
                        gameObject.player1.send(JSON.stringify(message));
                        gameObject.player1.close();
                        gameObject.player1 = null; //also used as conditions to delete games from memory
                    } catch (e) {
                    }

                    try {
                        gameObject.player2.send(JSON.stringify(message));
                        gameObject.player2.close();
                        gameObject.player2 = null;
                    } catch (e) {
                    }

                    gameObject.gameOver = true; //now nobody will be able to join an aborted game with half players
                }
            }
        });
    }
});

//MANTAINANCE: regularly clean up from memory the ended games (Hoisting will execute the web sockets before this function)
setInterval(function () {
    for (let i in websockets) {
        if (Object.prototype.hasOwnProperty.call(websockets, i)) {
            let gameObject = websockets[i];
            if (gameObject.gameOver && gameObject.player1 == null && gameObject.player2 == null) {
                delete websockets[i];
            }
        }
    }
}, 60000); //every minute the server will delete game objects that are finished and witout players in it (they can be chatting man!)


//Finally, after everything is set up, listen on port
server.listen(process.env.PORT || port);