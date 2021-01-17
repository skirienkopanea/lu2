//DOM object to display messages
const chatbox = document.getElementById("chatbox");
chatbox.innerHTML = "</br>";
printMessage(0); //waiting for player message
var localGame = new LocalGame(); //initalises game locally

/******************************SOCKET COMMUNICATION ******************************/
const socket = new WebSocket(document.URL.replace('http','ws'));

//New player joins a game notification
socket.onopen = function () {
   let message =
   {
      type: "CHAT",
      data: "Just joined the game!"
   };
   socket.send(JSON.stringify(message));
}

//Whole set of (socket) interactions with the server while socket connection is alive
socket.onmessage = function (message) {

   //Parse incomming messages 100% of the messages from the server have the format:
   //{type: "VARIABLE-TYPE", data: "list of game attributes and values"}
   messageObject = JSON.parse(message.data);
   let messageType = messageObject["type"];
   let messageData = messageObject["data"];
   let text = 'Console: {type: "' + messageType + '", data: "' + messageData + '"}';
   let paragraph = document.createElement('p');

   //GAME START
   //the server in name of P2 tells me that he is ready so I must be P1
   if (messageType == "P2 IS READY") {
      localGame.player = 1;
      localGame.start();
   }
   //the server in name of P1 tells me that he is ready so I must be P2
   if (messageType == "P1 IS READY") {
      localGame.player = 2;
      localGame.start();
   }

   //IMPORT DICE
   if (messageType == "DICE"){
      localGame.dice.rollDiceAnimation(messageData);
   }

   //IMPORT GAME UPDATE
   if (messageType == "UPDATE"){
      //updates are sent only when player has moved a cell before dice time ran out
      //therefore we "reset" the dice locally when we receive an update message
      localGame.import(messageData);
      localGame.dice.timeleft = -1; //"resets" dice clock locally (forces time runout and lets the turn switch by itself)
   }

   //ABORT NOTIFICAITON
   if (messageType == "GAMEOVER"){
      localGame.abortReaction();
   }

   //CHATBOX
   if (messageType == "CHAT") {
      text = messageData;
      paragraph.textContent = text;
      chatbox.appendChild(paragraph); //received message is displayed here
      document.getElementById("chatbox").scrollTop = document.getElementById("chatbox").scrollHeight; //chatbox formatting
   }

   if (client.DEBUG_MODE && messageType != "CHAT"){
      paragraph.textContent = text;
      chatbox.appendChild(paragraph); //received message is displayed here
      document.getElementById("chatbox").scrollTop = document.getElementById("chatbox").scrollHeight; //chatbox formatting
   }
  
}
//CHAT INPUT FORM
function chatSeverConsole(form) {
   if (event.key === 'Enter') {
      let message =
      {
         type: "CHAT",
         data: form.value
      };
      socket.send(JSON.stringify(message));
      setTimeout(function () {
         form.value = "";
         form.placeholder = "";
      }, 10);
   }
}

socket.onclose = function () {
   paragraph = document.createElement('p');
   paragraph.textContent = "Connection closed by the server";
   chatbox.appendChild(paragraph);
   document.getElementById("chatbox").scrollTop = document.getElementById("chatbox").scrollHeight; //chatbox formatting
}
