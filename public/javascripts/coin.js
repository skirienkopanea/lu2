/*
 * Coin represent a token. The id of a coin is composed by 2 parts pn (where n is the player number) and a letter [a-d]
 * From the id we retrieve the player the coin belongs to.
 * The constructor requires therefore a valid id as parameter.
 * Works closely with cell for the moves.
 */

function Coin(id) {

    //constructor
    this.id = id; //coin id
    this.dom = document.getElementById(id); //HTML dom object
    this.player = id.charAt(1); //coin owner
    this.dom.src = 'images/coinp' + this.player + '.png'; //con icon
    this.dom.disabled = true; //cannot be selected
    this.position = -1; //current position
    this.prevPosition = -1; //previous position
    this.spawn = 's' + id.substring(1,3); //DOM object id for the base

    //Getter for coin id
    this.getId = function () {
        return this.id;
    }

    //Getter for coin spawn id
    this.getSpawn = function () {
        return this.spawn;
    }

    //Getter for coin DOM object
    this.getDom = function () {
        return this.dom;
    }

    //Getter for cell coin position
    this.getPosition = function (x) {
        return this.position;
    }

    //Setter for cell coin position
    this.setPosition = function (x) {
        this.position = x;
    }

    //Getter for previous cell coin position
    this.getPrevPosition = function (x) {
        return this.prevPosition;
    }

    //Setter for previous cell coin position
    this.setPrevPosition = function (x) {
        this.prevPosition = x;
    }

    //Enables coin selection for moves
    this.enable = function () {
        if (this.player == localGame.player){
            this.dom.disabled = false;
            this.dom.addEventListener("click", this.highlight);
        }
        
    }

    //Disables coin selection for moves
    this.disable = function () {
        this.dom.src = 'images/coinp' + this.player + '.png'; //unselected icon
        this.dom.disabled = true;
    }

    //(After clicking the coin) Highlights this coin and un-higlights all other coins,
    //highlights and enables allowed cell for a move as well
    this.highlight = function () {

        //un-higlight all other coins (graphically)
        for (let i = 0; i < 4; i++) {
            document.querySelectorAll(".coinp1")[i].src = 'images/coinp1.png';
            document.querySelectorAll(".coinp2")[i].src = 'images/coinp2.png';
        }

        //highlights this (selected, as this is used in a click event) coin (darkens icon)
        document.getElementById(id).src = 'images/coinp' + this.player + 'selected.png';

        //updates LAST_COIN value
        client.LAST_COIN = this.id;

        //Highlights the available cell move and enables it for possible selection (and move execution)
        let maxCell = undefined;

        //P1 Logic
        if (this.player == 1){
        maxCell = localGame.board.cell[Math.min(this.position + localGame.dice.number,19)].getId();
        }

        //P2 Logic
        if (this.player == 2){
            let pos = (this.position == -1) ? -1 : localGame.board.cellIdtoRouteP2Position[this.position];
            maxCell = localGame.board.routeP2[Math.min(pos + localGame.dice.number, 19)].getId();
        }
        
        //remove previous coin cell highlights and selectibility
        for (let i = 0; i < 24; i++) {
            localGame.board.cell[i].disable();
        }
        
        //enables the coin's max cell and so highlights it
        localGame.board.cell[maxCell].enable();

    }.bind(this); //necessary to bind 'this' for proper 'this' functionality. (as it is a callback function?)
}