/*
 * Generates the board
 */
function Board() {

    //Updates local coin data with socket coin data
    this.importCoins = function (socketCoin) {

        for (let i = 0; i < 8; i++) {
            //UPDATE DATA
            this.coin[i].position = socketCoin[i].position;
            this.coin[i].prevPosition = socketCoin[i].prevPosition;

            //UPDATE GRAPHICS
            if (this.coin[i].position == -1) {
                let spawn = this.coin[i].getSpawn(); //base DOM object
                let coinDom = this.coin[i].getDom(); //current coin at cell DOM object
                document.getElementById(spawn).appendChild(coinDom);
            } else {
                let cell = this.coin[i].position
                let coinDom = this.coin[i].getDom();
                document.getElementById(cell).appendChild(coinDom);
            }
        }
    }

    //Updates local cell data with socket cell data
    this.importCells = function (socketCells) {
        for (let i = 0; i < 24; i++) {
            //UPDATE DATA
            this.cell[i].occupiedBy = socketCells[i].occupiedBy;
        }
    }

    //Generates the cells
    //Cell(id,type,color,) { //type 0 = empty, 1 = red arrow, 2 = blue arrow, 3 = black arrow (start), 4 = star
    cell0 = new Cell(0, 3, "red");
    cell1 = new Cell(1, 0, "white");
    cell2 = new Cell(2, 0, "white");
    cell3 = new Cell(3, 0, "white");
    cell4 = new Cell(4, 0, "white");
    cell5 = new Cell(5, 0, "white");
    cell6 = new Cell(6, 0, "white");
    cell7 = new Cell(7, 2, "white");
    cell8 = new Cell(8, 0, "white");
    cell9 = new Cell(9, 3, "blue");
    cell10 = new Cell(10, 0, "white");
    cell11 = new Cell(11, 0, "white");
    cell12 = new Cell(12, 0, "white");
    cell13 = new Cell(13, 0, "white");
    cell14 = new Cell(14, 0, "white");
    cell15 = new Cell(15, 0, "white");
    cell16 = new Cell(16, 1, "white");
    cell17 = new Cell(17, 0, "red");
    cell18 = new Cell(18, 0, "red");
    cell19 = new Cell(19, 4, "red"); //red home
    cell20 = new Cell(20, 0, "white");
    cell21 = new Cell(21, 0, "blue");
    cell22 = new Cell(22, 0, "blue");
    cell23 = new Cell(23, 4, "blue"); //blue home

    //cell array for references
    this.cell = [
        cell0,
        cell1,
        cell2,
        cell3,
        cell4,
        cell5,
        cell6,
        cell7,
        cell8,
        cell9,
        cell10,
        cell11,
        cell12,
        cell13,
        cell14,
        cell15,
        cell16,
        cell17,
        cell18,
        cell19,
        cell20,
        cell21,
        cell22,
        cell23
    ]

    //cell array order of p2 path
    this.routeP2 = [
        cell9,
        cell10,
        cell11,
        cell12,
        cell13,
        cell14,
        cell15,
        cell16,
        cell20,
        cell0,
        cell1,
        cell2,
        cell3,
        cell4,
        cell5,
        cell6,
        cell7,
        cell21,
        cell22,
        cell23
    ]

    //Converts the cell position to p2 route position
    this.cellIdtoRouteP2Position = [
        9,    //cell 0 is player 2 9th route position
        10,   //1
        11,   //2
        12,   //3
        13,   //4
        14,   //5
        15,   //6
        16,   //7
        null, //8
        0,    //9
        1,    //10
        2,    //11
        3,    //12
        4,    //13
        5,    //14
        6,    //15
        7,    //16
        null, //17
        null, //18
        null, //19
        8,    //20
        17,   //21
        18,   //22
        19    //23
    ]

    //Generates the coins
    //coins player1 (declared without var/let so they are global)
    coinp10 = new Coin("c10");
    coinp11 = new Coin("c11");
    coinp12 = new Coin("c12");
    coinp13 = new Coin("c13");
    //coins player2
    coinp24 = new Coin("c24");
    coinp25 = new Coin("c25");
    coinp26 = new Coin("c26");
    coinp27 = new Coin("c27");

    //coin array for references, naming style p(player)(arrayid)
    this.coin = [
        coinp10,
        coinp11,
        coinp12,
        coinp13,
        coinp24,
        coinp25,
        coinp26,
        coinp27
    ]
}