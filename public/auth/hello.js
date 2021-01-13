//Ideally you would host this admin script on a different server not accessible to the public

//get admin name
var cookiesArray = document.cookie.split('; ');
var cookie = cookiesArray[0].split("=");
var dot = cookie[1].indexOf('%40'); //code for @
var user = cookie[1].substr(4, dot - 4);

const socket = new WebSocket("ws://localhost:3000"); //"wss://parchispara2.herokuapp.com/"

socket.onopen = function () {
    let message =
    {
        type: "ADMIN",
        data: user + ": " + prompt('Broadcast message to all players:')
    };
    socket.send(JSON.stringify(message));
}


