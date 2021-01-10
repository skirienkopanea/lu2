/******************************SET UP THE SERVER******************************/

//Import modules
var express = require("express");
var http = require("http");
var websocket = require("ws");

//Port config, create Express application, set root of application
var port = process.argv[2];
var app = express();

//a middleware logger component
function logger(request, response, next) {
    console.log("%s\t%s\t%s\t%s\t", new Date(), request.ip.substr(7), request.method, request.url);
    //substring to remove ipv6 format
    //for Heroku use request.headers['x-forwarded-for'] 
    next(); //control shifts to next middleware function (If we dont use this the user will be left hanging without a response)
}

app.use(logger); //register middleware component
//The reason we use this other middleware component after the logger is because otherwise the server will respond to the client
//with the request resource i.e. /favicon.ico and once the request is send that closes the cycle the request-response cycle
//so the following middelware components don't get to receive anything
app.use(express.static(__dirname + "/public")); //reference point to make flexible urls (all html files are in 'public' folder)


//HANDLING GET REQUESTS
//not modular example, for the splash.ejs view statistics! (can be moved to index.js tho)
app.set("view engine", "ejs"); //
app.get('/', function (req, res) {
    //example of data to render; here gameStatus is an object holding this information
    res.render('splash.ejs', {
        gamesInitialized: gameStatus.gamesInitialized,
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
server.listen(process.env.PORT || port);
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

//we start with 0 intialised games and set a currentGame variable object to be gameOver = true for the logic below.
//this is done like this so that only when there's a connection a game is initalised.
var currentGame = {
    gameOver: true,
    player2: null
 };

//BEHAVIOUR DURING THE ENTIRE SOCKET CONNECTION
wss.on("connection", function connection(socket) {
    gameStatus.onlinePlayersCount++;

    // two-player game: every two players are added to the same (non-started) game
    socket.id = connectionID++;
    if (currentGame.gameOver == true || currentGame.player2 != null ){ //if it is game over (or if it doesnt exist yet), or full, then a new game object is created
        currentGame = new Game(gameStatus.gamesInitialized++);
    }
    let playerType = currentGame.addPlayer(socket); //adds player to a non-finished game with a player slot available

    //array of games, the indexes are the player's ids (i.e. websockets[0] = websockets[1] = game 0)
    //This will support multiple live games as we can now link a received socket message
    //to their respective game, and broadcast responses to that specific game only
    websockets[socket.id] = currentGame; //beware immeadeately after p2 joins this reference is overwritten by a new game object so after that point it no longer presents the "current" game, use the websockets array which contain the actual games per socket

    console.log("%s\t%s\t%s\t%s\t", new Date(), "game " + currentGame.id, "\tPLY" + playerType, "socket ", socket.id); //for server debugging

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
            console.log("%s\t%s\t%s\t", new Date(), "game " + websockets[socket.id].id, "\tSTART"); //for server debugging
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

            console.log("%s\t%s\t%s\t%s\t", new Date(), "game " + gameObject.id, "\tCHAT",JSON.parse(JSON.stringify(sendObject))["data"] ); //for server debugging
            
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
            if  (messageObject["type"] == "UPDATE"){
                console.log("%s\t%s\t%s\t%s\t", new Date(), "game " + gameObject.id, "\t" + messageObject.type,"score",game.scoreP1,game.scoreP2); //for server debugging
            } else {
                console.log("%s\t%s\t%s\t%s\t", new Date(), "game " + gameObject.id, "\t" + messageObject.type,"number",JSON.parse(JSON.stringify(messageObject))["data"]); //for server debugging
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

            console.log("%s\t%s\t%s\t", new Date(), "game " + gameObject.id, "\t" + messageObject.type,JSON.parse(JSON.stringify(messageObject))["data"]); //for server debugging
        }
    });

    //BEHAVIOUR AT CONNECTION CLOSURE
    socket.on("close", function (code) {
        let gameObject = websockets[socket.id];
        gameStatus.onlinePlayersCount--;

        // code 1001 means closing initiated by the client;
        console.log("%s\t%s\t%s\t%s\t", new Date(), "game " + gameObject.id, "\tDSCNCT", "socket ", socket.id); //for server debugging

        if (code == "1001") {

            // if possible, abort the game; if not, the game is already completed
            if (gameObject.gameOver == false) { //only register as aborted from the first quitter
                gameStatus.gamesAborted++;
                console.log("%s\t%s\t%s\t", new Date(), "game " + gameObject.id, "\tGAMEOVER",0); //for server debugging


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
});
