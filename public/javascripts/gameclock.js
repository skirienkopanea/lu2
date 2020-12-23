/*
 * The clock manages the game duration. The 2 possible endings managed by this object are abortion and 1 hour timeout.
 * winning interrupts the game from another object
 */

function GameClock() {

    //DOM Constants
    const seconds = document.querySelector(".seconds");
    const minutes = document.querySelector(".minutes");
    const abortButton = document.querySelector('.abortButton');
    abortButton.addEventListener("click", abort);

    //Aborts game
    function abort () {
        const sound = document.querySelector('.abort');
        sound.play();
        localGame.gameOver = true;
        localGame.winner = 0;
        localGame.SendGameOverToServer();
        printMessage(5);
        localGame.dice.stop(); //Stops the dice timer
        abortButton.disabled = true; //disables abort button
    }

    let elapsedTime = 0; //start counting at 0 seconds

    //Only display integers
    function formatTime(x) { return x > 9 ? x : "0" + x; }
    
     //Starts the clock
    this.start = function () {
        if (localGame.turn == localGame.player){
            printMessage(1);
        } else {
            printMessage(2);
        }
        let startClock = setInterval(function () {
            
            //STOP THE CLOCK AT GAME OVER
            if (localGame.gameOver) {
                clearInterval(startClock); //stops the game clock
                client.GAME_ELAPSED_TIME = elapsedTime; //registers the total played time
                localGame.dice.stop(); //Stops the dice timer
                abortButton.disabled = true; //disables abort button
                if (localGame.winner == -1){
                    printMessage(6);//print game is a draw
                }

            } else {
                seconds.innerHTML = formatTime(elapsedTime % 60); //parse seconds
                minutes.innerHTML = formatTime(parseInt((elapsedTime / 60) % 60, 10)); //parse minutes
                if (elapsedTime === client.MAX_GAME_DURATION) { //finish game after 1 hour )(3600s)
                    localGame.gameOver = true;
                    client.GAME_ELAPSED_TIME = elapsedTime;
                    if (localGame.player == 1) {localGame.SendGameOverToServer();}; //enough that 1 sends the gameover
                };
            }
            elapsedTime++;
        }.bind(this), 1 * client.GAME_SPEED); //speed of the game time clock 1000ms = 1 sec
    }

    // Resets the clock
    this.reset = function () {
        localGame.gameOver = false;
        localGame.winner = -1;
        elapsedTime = 0;
        abortButton.disabled = false; //enables abort button
        this.start();
    }

    //Getter for the game time
    this.getElapsedTime = function () { return elapsedTime; };

}