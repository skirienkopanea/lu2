//DICE CHEAT CODE
function GOD() {
    client.DICE_GOD = true;
}

//P1 win animation
function showP1PathInv() {
    let i = 19;
    var path = setInterval(function () {
        if (i == 0) {
            let i = 20;
            setTimeout(function () {
                localGame.board.cell[i].dom.style.backgroundImage = "url('images/cell4red.png')";
            }, 100)

            insidePath = setInterval(function () {
                if (i == 23) {
                    clearInterval(insidePath);
                }
                localGame.board.cell[i++].dom.style.backgroundImage = "url('images/cell4red.png')";
            }, 100)

            clearInterval(path);
        }
        localGame.board.cell[i].dom.style.backgroundImage = "url('images/cell4red.png')";
        i--;
    }, 100);

    setTimeout(function () {
        document.querySelector('.win').play();
    }, 2500);

}

//P2 win animation
function showP2PathInv() {
    let i = 19;
    var path = setInterval(function () {
        if (i == 0) {
            setTimeout(function () {
                localGame.board.cell[8].dom.style.backgroundImage = "url('images/cell4blue.png')";
            }, 100)
            let i = 17;
            insidePath = setInterval(function () {
                if (i == 19) {
                    clearInterval(insidePath);
                }
                localGame.board.cell[i++].dom.style.backgroundImage = "url('images/cell4blue.png')";
            }, 100)

            clearInterval(path);
        }
        localGame.board.routeP2[i].dom.style.backgroundImage = "url('images/cell4blue.png')";
        i--;
    }, 100);
    setTimeout(function () {
        document.querySelector('.win').play();
    }, 2500);
}
