# lu2
<ul>
<li>2 player online game assignment for TU Delft course CSE1500</li>
<li>The tech stack comprises plain Javascript on the client side and Node.js on the server side (and html+css).</li>
<li>The home page stats are not stored in a database but in the temporary memory of the server.</li>
<li>Stats are refreshed with ejs templates.</li>
<li>In terms of users joining games, the server assigns odd players to a new game, as player 1.</li>
<li>Even players are assigned to the existing game without a 2nd player, as player 2.</li>
<li>You can check a live implementation at https://parchispara2.herokuapp.com/</li>
<li>If the player doesn't take any action the herokuapp environment will disconnect the player from the server after roughly 1 minute of inactivity.
That is a feature managed by herokuapp themselves.</li>
<li>Local implementations do not have that feature.</li>
</ul>
To implement this game on your local machine:</br>
```console
git clone https://github.com/chauff/balloons-game.git
cd balloons-game
npm install
npm start
```
