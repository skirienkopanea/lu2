//Ideally you would host this admin script on a different server not accessible to the public

//get user name
var cookiesArray = document.cookie.split('; '); //does not include session id
let user = undefined;

for (i = 0; i < cookiesArray.length; i++) {
    var cookie = cookiesArray[i].split("=");
    if (cookie[0] == "user_nickname") {
        var dot = cookie[1].indexOf('%40'); //code for @
        //allow for unsigned, unregistered usernames
        if (dot != -1) {
            user = cookie[1].substr(4, dot - 4);
        } else {
            user = cookie[1];
        }
    }
}

let char = document.URL.indexOf('https:') == -1 ? '' : 's';
let url = document.URL.substr(document.URL.indexOf(':'));
let cleanurl = url.substring(3)
let finalurl = "ws" + char + "://" + cleanurl.substr(0,cleanurl.indexOf('/'));
const socket = new WebSocket(finalurl);

socket.onopen = function () {
    let message =
    {
        type: "ADMIN",
        data: user + ": " + prompt('Broadcast message to all players:')
    };
    socket.send(JSON.stringify(message));
}
