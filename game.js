// every game has two players, identified by their WebSocket
// server mostly echoes the board and score updates of the players
// therefore it doesnt need to keep track of much data only essential
// such as id of game, id of players and status of the game
// we don't keep track of the scores in the server.
var game = function (id) {
    this.id = id;
    this.player1 = null;
    this.player2 = null;
    this.gameOver = false;
    this.winner = null;
};

//it does 2 things, adds the player to the game
//returns which player has been added to the game
//it does return an error when no player has been added to the game
game.prototype.addPlayer = function (socket) {
    if (this.player1 != null && this.player2 != null) {
        return new Error("GAME FULL"); //should never happen if server assigns players properly
    }
    if (this.player1 == null) {
        this.player1 = socket;
        return 1;
    } else {
        this.player2 = socket;
        return 2;
    }
};

module.exports = game;
//game object must have the same name as the file!
//we must use prototypes, that measn functions must be declared outside and be appended