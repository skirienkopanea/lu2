/*
 * Contains all the local objects that define the game. Includes the attributes and mehods
 * regarding the game mechanics needed to interact with the server
 */
function LocalGame() {

    //Managed locally (mostly, dice gets updates via "DICE" and in "TURN" socket onmessage)
    this.player = 0; //it gets determined at gamestart by socket messages
    this.dice = new Dice(20);
    this.gameClock = new GameClock();
    this.turn = 1; //by default p1 starts

    //Import/Export properties
    this.board = new Board();
    this.gameOver = false;
    this.winner = -1; //-1 DRAW, 0 aborted, 1 P1, 2P2
    this.scoreP1 = 0;
    this.scoreP2 = 0;

    //Starts the game
    this.start = function () {
        this.dice.start();
        this.gameClock.reset();
    }

    //Exports game state to JSON
    this.export = function () {
        socket.send(JSON.stringify(this.getGameState()));
    }

    //Updates the local game state
    this.import = function (stateUpdate) {
        //Beware! JSON stringify will remove the functions from the objects!
        //therefore we can't do a thing such as this.board.coin = stateUpdate.coins;
        //that would break our game since we would lose the methods from coin
        //we can update the single valued variabels without worry though
        this.scoreP1 = stateUpdate.scoreP1;
        this.scoreP2 = stateUpdate.scoreP2;
        this.gameOver = this.gameOver;

        //A method at Board object takes care of a proper import
        this.board.importCells(stateUpdate.cells);
        this.board.importCoins(stateUpdate.coins);

        document.getElementById("SCORE_P1").innerHTML = this.scoreP1;
        document.getElementById("SCORE_P2").innerHTML = this.scoreP2;

        //P1 wins
        if (this.scoreP1 == 4) {
            if (localGame.player == 1) {
                printMessage(3);
            } else {
                printMessage(4);
            }  
            localGame.winner = 1;
            localGame.gameOver = true;
            showP1PathInv(); //p1 win animation
        }

        //P2 wins
        if (this.scoreP2 == 4) {
            if (localGame.player == 2) {
                printMessage(3);
            } else {
                printMessage(4);
            }  
            localGame.winner = 2;
            localGame.gameOver = true;
            showP2PathInv(); //p2 win animation
        }
    }

    //Creates game state JSON friendly object
    this.getGameState = function () {
        let gameState = {
            type: "UPDATE",
            data: {
                cells: this.board.cell,
                coins: this.board.coin,
                scoreP1: this.scoreP1,
                scoreP2: this.scoreP2,
                winner: this.winner,
                gameOver: this.gameOver
            }
        }
        return gameState
    }

    //Notifies server of game over
    this.SendGameOverToServer = function () {
        let message =
        {
            type: "GAMEOVER",
            data: this.winner
        };
        socket.send(JSON.stringify(message));
    }

    //Applies side effects of abortion locally
    this.abortReaction = function(){
        document.querySelector('.abort').play();
        localGame.gameOver = true;
        localGame.winner = 0;
        printMessage(5);
        localGame.dice.stop(); //Stops the dice timer
        document.querySelector('.abortButton').disabled = true; //disables abort button
    }
}