# Web-socket app: Ludo for 2 (lu2)
To do: Add blocks, button to toggle the chat display (automatically off), make whole board to fit the page (so it looks good on mobile too), make rules also a button to display and hide. Try to deploy to heroku without the nodue modules locally.
<ul>
<li>2 player online game assignment during my CS bachelor with express and node</li>
<li>You can check a live implementation at https://parchispara2.herokuapp.com/</li>
<li>If the player doesn't take any action the herokuapp environment will disconnect the player from the server after roughly 1 minute of inactivity.
That is a feature managed by herokuapp themselves. (A workaround could be to automatize an empty message from the client to the server every 30 seconds)</li>
<li>Local implementations do not have that feature.</li>
<li>I used inkscape and css for the graphics. For the sounds I downloaded a few free samples from pachd.com (dice) and freesound.org (the rest).</li>
<li>There are additional unused graphics available as well as the original inkscape files. Feel free to use them, there's no copyrights from my resources.</li>
</ul>
You can implement this game on your local machine. Install Node.js https://nodejs.org/en/ and git https://git-scm.com/. Then execute the following on the terminal:

```console
git clone https://github.com/skirienkopanea/lu2
cd lu2
npm start
```

You can now access the game at http://localhost:3000/ in the browser. Open another browser window on your local machine to access the game as another player. Other machines in your network may join by using the host local ip address.

![Board game screenshot](screenshot.png)
