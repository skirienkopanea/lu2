const topText = document.querySelector(".topText"); //DOM object to display messages

//List of possible messages
const text = [
    "WAIT FOR OPPONENT",
    "YOUR TURN",
    "OPPONENT'S TURN",
    "YOU WIN",
    "YOU LOSE",
    "GAME ABORTED",
    "GAME DRAW"
]

//Prints message from array id
function printMessage(id) {
    topText.innerHTML = text[id];
}
