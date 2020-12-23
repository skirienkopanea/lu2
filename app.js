/******************************SET UP THE SERVER******************************/

//Import modules
var express = require("express");
var http = require("http");
var websocket = require("ws");

//Port config, create Express application, set root of application
var port = process.argv[2];
var app = express();
app.use(express.static(__dirname + "/public")); //reference point to make flexible urls (all html files are in 'public' folder)

//HANDLING GET REQUESTS
//not modular example, for the splash.ejs view statistics! (can be moved to index.js tho)
app.set("view engine", "ejs"); //
app.get('/', function(req, res) {
    //example of data to render; here gameStatus is an object holding this information
    res.render('splash.ejs', { gamesInitialized: gameStatus.gamesInitialized,
        gamesAborted: gameStatus.gamesAborted,
        gamesCompleted: gameStatus.gamesCompleted,
        onlinePlayersCount: gameStatus.onlinePlayersCount
    });
})
//modular example
var indexRouter = require("./routes/index.js");
app.get("/splash", indexRouter);
app.get("/play", indexRouter);


/******************************LAUNCH THE SERVER******************************/
var server = http.createServer(app);
server.listen(port);
/*****************************************************************************/

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


/******************************SOCKET COMMUNICATION ******************************/

//INITIALISE GAMES
var websockets = {}; //property: websocket, value: game
var connectionID = 0; //each websocket receives a unique ID
const wss = new websocket.Server({ server }); //initialise socket object

var gameStatus = require("./statTracker");
var Game = require("./game");
var currentGame = new Game(gameStatus.gamesInitialized++);

//BEHAVIOUR DURING THE ENTIRE SOCKET CONNECTION
wss.on("connection", function connection(socket) {
    gameStatus.onlinePlayersCount++;

    // two-player game: every two players are added to the same game
    socket.id = connectionID++;
    let playerType = currentGame.addPlayer(socket);

    //array of games, the indexes are the player's ids (i.e. websockets[0] = websockets[1] = game 0)
    //This will support multiple live games as we can now link a received socket message
    //to their respective game, and broadcast responses to that specific game only
    websockets[socket.id] = currentGame; //beware immeadeately after p2 joins this reference is overwritten by a new game object so after that point it no longer presents the "current" game, use the websockets array which contain the actual games per socket

    console.log("game " + currentGame.id + " P" + playerType + " assigned to: socket number " + socket.id); //for server debugging

    // once we have two players a new game object is created
    if (currentGame.player2 != null) {
        currentGame = new Game(gameStatus.gamesInitialized++);
        //Therefore the first 2 players are sent to game 0
        //The next 2 will be sent to game 1, and so forth
        //By replacing the currentGame reference to a new entity
        //We make sure to not send all the players to the same game

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
            console.log("game " + websockets[socket.id].id + " has started")
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
                data: "Player " + (isPlayer1 ? "1 (red)" : "2 (blue)") + ": " + messageObject["data"]
            };

            gameObject.player1.send(JSON.stringify(sendObject));

            //Games are started without P2, so until it joins this avoids nullpointer error
            if (gameObject.player2 != undefined) {
                gameObject.player2.send(JSON.stringify(sendObject));
            }

            console.log("game " + gameObject.id + " chat - " + JSON.parse(JSON.stringify(sendObject))["data"]); //for server debugging
        }

        //CLIENT SENDS BOARD/DICE UPDATE
        //Server just echoes what one client sends to the other
        if (messageObject["type"] == "UPDATE" || messageObject["type"] == "DICE") {
            if (isPlayer1) {
                gameObject.player2.send(message);
                console.log(message); //for server debugging
            } else {
                gameObject.player1.send(message);
                console.log(message); //for server debugging
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
                console.log("game " + gameObject.id + " aborted")

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

            console.log(message); //for server debugging
        }
    });

    //BEHAVIOUR AT CONNECTION CLOSURE
    socket.on("close", function (code) {
        gameStatus.onlinePlayersCount--;

        // code 1001 means closing initiated by the client;
        console.log("socket " + socket.id + " disconnected ...");

        if (code == "1001") {

            // if possible, abort the game; if not, the game is already completed
            let gameObject = websockets[socket.id];

            if (gameObject.gameOver == false) { //indeed unfinished game with 1001 = abortion
                gameStatus.gamesAborted++;
                gameObject.gameOver = true //now it will be deleted by the setInterval mantienance
                console.log("game " + gameObject.id + " aborted")

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
            }
        }
    });
});
