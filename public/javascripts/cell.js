/*
 * A cell from the board table. Manages the update of graphics. And the update of data.
 * Works closely with Coin (for coin movements)
 */

function Cell(id, type, color) { //type 0 = empty, 1 = red arrow, 2 = blue arrow, 3 = black arrow (start), 4 = star

    //constructor
    this.id = id; //cell id
    this.type = type; //cell type (used for star graphic and for not "eating" other tokens behaviour)
    this.color = color; //needs to match either "white", "blue" or "red"
    this.dom = document.getElementById(id); //HTML dom object
    this.occupiedBy = -1; //coin sitting at the cell, -1 = empty cell

    //cell image
    this.dom.style.backgroundImage = "url('images/cell" + this.type + this.color + ".png')";
    this.dom.style.backgroundRepeat = "no-repeat";
    this.dom.style.backgroundPosition = "center";


    //Cell color setter (unused if color assigned properly at object constructor)
    this.setColor = function (x) {
        this.color = x;
    }

    //Returns the coin occupying the cell
    this.getCoin = function () {
        return this.occupiedBy;
    }

    //"Empties the cell", partially. Will update only the cell "coin occupation" data. Not graphics. Used with other methods.
    this.leaveCoin = function () {

        let position = localGame.board.coin[client.LAST_COIN.charAt(2)].getPosition();

        if (position != -1) {
            localGame.board.cell[position].occupiedBy = -1;
        }
    }

    //Moves the coin to this cell (both graphically and "coin occupation data"),
    //sends back to the base the coins that were at the cell (if any)
    //Updates the score if this cell is home.
    this.setCoin = function () {

        //if the possible move cell is the same that the coin is occuping you can't make a move to the same cell
        //so the whole setCoin method is aborted.
        if (this.occupiedBy == client.LAST_COIN) { //without blocks this will never happen. This is useful if blocking the path feature is implemented.
            return;
        }

        //dealing with occupied coins (does not apply at home type cells)
        if (this.occupiedBy != -1 && this.type != 4) {

            let spawn = localGame.board.coin[this.occupiedBy.charAt(2)].getSpawn(); //base DOM object
            let coinDom = localGame.board.coin[this.occupiedBy.charAt(2)].getDom(); //current coin at cell DOM object

            //graphically send current occupying coin to base
            document.getElementById(spawn).appendChild(coinDom);

            //update sent to base coin data with current cell position = base (-1)
            localGame.board.coin[this.occupiedBy.charAt(2)].setPosition(-1);
        }

        //update "coin occupation" cell data:
        this.occupiedBy = client.LAST_COIN; //new occupying cell
        let coinDom = localGame.board.coin[client.LAST_COIN.charAt(2)].getDom(); //new occupying cell DOM object

        //graphically move the new coin to this cell
        this.dom.appendChild(coinDom);

        //update just moved coin data of curent cell position and previous cell position
        localGame.board.coin[client.LAST_COIN.charAt(2)].setPrevPosition(localGame.board.coin[client.LAST_COIN.charAt(2)].getPosition());
        localGame.board.coin[client.LAST_COIN.charAt(2)].setPosition(this.id);

        //graphically update the selected coin from dark to normal
        document.getElementById(this.occupiedBy).src = 'images/coinp' + this.occupiedBy.charAt(1) + '.png'

        //if red home cell give points to P1 (and end the game if 4/4)
        if (this.id == 19) {
            document.getElementById("SCORE_P1").innerHTML = ++localGame.scoreP1;
            if (localGame.scoreP1 == 4) {
                localGame.winner = 1;
                localGame.gameOver = true;
                if (localGame.player == 1) {
                    printMessage(3);
                    localGame.SendGameOverToServer(); //only winner client sends the game over message to client
                } else {
                    printMessage(4);
                }                
                showP1PathInv(); //p1 win animation
                
            }
        }

        //if blue home cell give points to P2 (and end the game if 4/4)
        if (this.id == 23) {
            document.getElementById("SCORE_P2").innerHTML = ++localGame.scoreP2;
            if (localGame.scoreP2 == 4) {
                localGame.winner = 2;
                localGame.gameOver = true;
                if (localGame.player == 2) {
                    printMessage(3);
                    localGame.SendGameOverToServer(); //only winner client sends the game over message to client
                } else {
                    printMessage(4);
                }
                showP2PathInv(); //p2 win animation
            }
        }
    }

    //Getter for cell ID
    this.getId = function () {
        return this.id;
    }

    //"Updater" for cell Image. Doesn't take paramaters, color and type must be specified in their own setters, and then use this "updater" (unused if proper object construction).
    this.updateImage = function () {
        this.dom.style.backgroundImage = "url('images/cell" + this.type + this.color + ".png')";
        this.dom.style.backgroundRepeat = "no-repeat";
        this.dom.style.backgroundPosition = "center";
    }

    //Highlights the cell and enables cell selection to make a move.
    this.enable = function () {
        client.LAST_CELL = -1;
        this.dom.style.backgroundColor = 'yellow';
        this.dom.style.cursor = "pointer";
        this.dom.onclick = this.move;
    }

    //Moves LAST_COIN to LAST_CELL (it does not take parameters, it makes this cell LAST_CELL and moves LAST_COIN)
    this.move = function () {

        client.LAST_CELL = this.id;
        this.disable(); //after clicking disables the higlight (and the "buttonability") of the cell.

        //con leaves the previous cell (data wise)
        this.leaveCoin();

        //con moves to this cell (data and graphics wise)
        this.setCoin();

        //switches turns locally (maybe add timout to allow for socket lag?)
        localGame.dice.switch();

    }.bind(this); //bind function necessary for proper 'this' functionality (as it is a callback function?)

    //disables cell selection
    this.disable = function () {
        this.dom.style.backgroundColor = 'white';
        this.dom.style.cursor = "default";
        this.dom.onclick = null;
    }
}
