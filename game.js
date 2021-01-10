// every game has two players, identified by their WebSocket
// server mostly echoes the board and score updates of the players
// therefore it doesnt need to keep track of much data only essential
// such as id of game, id of players and status of the game
// we don't keep track of the scores in the server, game state (-1 DRAW, 0 aborted, 1 P1 win, 2 P2 win).
function game(id) {
    this.id = id;
    this.player1 = null;
    this.player2 = null;
    this.gameOver = false;
    this.winner = null;

    //it does 2 things, adds the player to the game
    //returns which player has been added to the game
    //it does return an error when no player has been added to the game
    this.addPlayer = function (socket) {
        if (this.player1 != null && this.player2 != null && this.gameOver == false) {
            return new Error("GAME FULL"); //should never happen if server assigns players properly
        }
        if (this.player1 == null && this.gameOver == false) {
            this.player1 = socket;
            return 1;
        } else if (this.player2 == null && this.gameOver == false){
            this.player2 = socket;
            return 2;
        }
    };
};

module.exports = game;
//could have also just used module.exports.thing(1/2/3/...) = game... if we wanted to export more things.
//the name of the object does not need to match with the name of the file