/*
 * Dice object manages the generation of a number for the player move depth as well as triggers for enabling/disabling the board
 */

function Dice(startNumber) {

    //DOM constants
    const rollDiceButton = document.querySelector('.rollDiceButton'); //link rollDiceButton to DOM element
    const dicePic = document.querySelector('.dicePic'); //link dicePic to DOM element
    const sound = document.querySelector('.diceAudio'); //link sound to diceAudio DOM element
    const bell = document.querySelector('.bell'); //link sound to diceAudio DOM element
    const timer = document.querySelector('.timer'); //link timer to DOM element

    this.number = startNumber; //dice number
    this.timeleft = client.TIME_TURN;
    this.interval = undefined;
    dicePic.src = 'images/dice' + this.number + '.png'; //assign dice image    
    rollDiceButton.disabled = true; //disable dice butotn
    rollDiceButton.addEventListener("click", enableCoins); //assign event listener to rollDiceButton


    //Getter for the dice number
    this.getNumber = function () { return this.number; };

    //Just the animation of rolling the dice
    this.rollDiceAnimation = function(number) {

        if (number==0){ //executed locally, this P determines (and sends) the dice number
            this.number = client.DICE_GOD ? 20 : Math.floor(Math.random() * 6) + 1;
            
            let diceMessage = {
                type: "DICE",
                data: localGame.dice.number
            }
            socket.send(JSON.stringify(diceMessage));
        } else {
            this.number = number;
        }

           let roll = setInterval(function () {
            //This "Interval" repeats the 'rolling the dice' function (random dice frame) every 300 miliseconds
            sound.play(); //ticking sound for each dice number preview
            dicePic.src = 'images/dice' + (Math.floor(Math.random() * 6) + 1) + '.png'; //Update the dice image for this preview number (dice animation is local to reduce the number of messages)
        }, 0.3 * client.GAME_SPEED); //0.3 seconds (in total 10 frames if run for 3 seconds)

        setTimeout(function () {
            clearInterval(roll);
            dicePic.src = 'images/dice' + this.number + '.png';
        }.bind(this), 3 * client.GAME_SPEED); //3 game seconds

    };

    //Disables the roll dice button, plays click sound and assigns a new number and dice pic every 0.3 seconds
    //Stops after 3 seconds 
    //Then enables the coins of the player
    function enableCoins () {
        rollDiceButton.disabled = true; //disable the dice button right after clicking it

        localGame.dice.rollDiceAnimation(0);

        //There is a delay of 3000 miliseconds (3 sec) until the "Interval" is stopped (cleared)
        //the last dice number is chosen
        //after the dice number is displayed all coins are enabled, except coins at home cells
        setTimeout(function () {
            client.DICE_NUMBER = this.number;
            /*prob send some sockets here*/ /*and also refresh the dice at the other terminal (or maybe send it each time so the animation is seen live*/

            //enable P1 coins
            if (localGame.player == 1 && localGame.turn == 1) {
                for (let i = 0; i < 4; i++) {
                    if (localGame.board.coin[i].position != 19) { //using the coin position was simpler than using cell type, make sure to keep track of the cell position for these home cells if you decide to change the layout of the board.
                        localGame.board.coin[i].enable();
                    }
                }
            }

            //enable P2 coins
            if (localGame.player == 2 && localGame.turn == 2) {
                for (let i = 4; i < 8; i++) {
                    if (localGame.board.coin[i].position != 23) { //P2 home exception
                        localGame.board.coin[i].enable();
                    }
                }
            }
        }, 3 * client.GAME_SPEED); //3 game seconds
    }


    //Starts the countdown to make a move
    this.start = function () {
        if (!localGame.gameOver) {
            if (localGame.turn == localGame.player){
                printMessage(1);
            } else {
                printMessage(2);
            } 
        }
        setTimeout(function () {
            localGame.turn == localGame.player ? rollDiceButton.disabled = false : rollDiceButton.disabled = true;
        }, 1 * client.GAME_SPEED);
        this.interval = setInterval(function () {

            if (!localGame.gameOver && this.timeleft >= 0) {
                timer.innerHTML = "P" + localGame.turn + " Timeout</br>" + this.timeleft;
                this.timeleft--;
            } else {


                //switch players locally
                localGame.turn = localGame.turn == 1 ? 2 : 1;

                //updates the time for the other player locally
                this.timeleft = client.TIME_TURN;

                //there is no need to send an update message since the board remains the same

                //graphic update
                bell.play();
                timer.innerHTML = "P" + localGame.turn + " Timeout</br></br>";
                if (!localGame.gameOver) {
                    if (localGame.turn == localGame.player){
                        printMessage(1);
                    } else {
                        printMessage(2);
                    } 
                }

                //enable after 1 sec depending on the localGame player type
                if (localGame.turn == localGame.player && !localGame.gameOver) {
                    setTimeout(function () { rollDiceButton.disabled = false; }, 1 * client.GAME_SPEED);
                } else {
                    this.disable();
                }

            }

        }.bind(this), 1 * client.GAME_SPEED);

    }


    //disables the dice clickability and the board clickability
    this.disable = function () {

        //disable button
        rollDiceButton.disabled = true;

        //time's run out, so all coins are disabled
        for (let i = 0; i < localGame.board.coin.length; i++) {
            localGame.board.coin[i].disable();
        }

        //time's run out, so all cells are disabled
        for (let i = 0; i < localGame.board.cell.length; i++) {
            localGame.board.cell[i].disable();
        }


    }


    //Changes player turns
    this.switch = function () {

        localGame.export(); //sends new game state to the other player

        this.timeleft = -1; //"resets" dice clock locally (forces time runout and lets the turn switch by itself)

        localGame.dice.disable(); //locally turns off the dice clickability and the board clickability
    }

    //Stops the dice timer (only used at game over!)
    this.stop = function () {
        clearInterval(this.interval); //freezes the timer loop.
        this.disable();
    }
}