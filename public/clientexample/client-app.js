//THIS THING THAT USES GET REQUESTS IS BASED ON AXIOS NOT SOCKETS
/*Importantly, with Ajax, the number of complete page reloads is vastly reduced.
Only the newly available (e.g. a new set of query suggestions based on the current
	query) or changed data needs to be retrieved from the server, instead of the
	complete document.*/

	/*While Ajax is a mainstay of today’s web, it has issues:

The server cannot push data to the client, it can only respond to HTTP requests, thus requiring a form of polling to simulate the desired push-based behavior (for example, a user’s Twitter timeline is updated by making requests to Twitter’s servers every few seconds). This is resource-intensive on both the client and the server-side.
Every time data is requested and sent, an entire HTTP message is required - this has a considerable amount of overhead if the data to send is only a few bytes (as an example, in a chess game, we may just send a single move such as b2b4 at a time - that’s four characters in total).
The client-side script has to track the mapping from outgoing connections to the incoming connection in cases where a client makes requests to multiple servers.*/


"use strict";

function addGamesToList(games) {
	console.log("Loading games from server.");

	let gamesList = document.querySelector("ul");
	for(let key in games){
		let game = games[key];
		let li = document.createElement("li");
		li.innerHTML = game.title + " ("+game.price+")";
		gamesList.appendChild(li);
	}
}


// THIS IS COULD BE AN EXAMPLE TO GET THE UPDATED BOARD and COIN arrays

/* 
 * retrieve the games from the server once;
 * use setInterval to do this regularly 
 */
axios.get('/psvrGames')
	.then( function(res){
		//success
		console.log(res.status);
		console.log(res.data);
		addGamesToList(res.data);
	})
	.catch(function(err){
		//error
		console.log(err);
    });