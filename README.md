# lu2
<ul>
<li>2 player online game assignment for TU Delft course CSE1500 <a href="https://chauff.github.io/Web-Teaching/">Web Technology part</a> taught by <a href="https://github.com/chauff">Claudia Hauff</a></li>
<li>The tech stack comprises plain Javascript on the client side and Node.js on the server side (and html+css).</li>
<li>The home page stats are not stored in a database but in the temporary memory of the server.</li>
<li>Stats are refreshed with ejs templates.</li>
<li>In terms of users joining games, the server assigns odd players to a new game, as player 1.</li>
<li>Even players are assigned to the existing game without a 2nd player, as player 2.</li>
<li>You can check a live implementation at https://parchispara2.herokuapp.com/</li>
<li>If the player doesn't take any action the herokuapp environment will disconnect the player from the server after roughly 1 minute of inactivity.
That is a feature managed by herokuapp themselves.</li>
<li>Local implementations do not have that feature.</li>
<li>I used inkscape and css for the graphics. For the sounds I downloaded a few free samples from pachd.com (dice) and freesound.org (the rest).</li>
</ul>
You can implement this game on your local machine. Install Node.js https://nodejs.org/en/ and git https://git-scm.com/. Then execute the following on the terminal:

```console
git clone https://github.com/skirienkopanea/lu2
cd lu2
npm start
```

You can now access the game at http://localhost:3000/ in the browser. Open another browser window to access the game as another player.
