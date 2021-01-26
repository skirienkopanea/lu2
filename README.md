# Web-socket app: Ludo for 2 (lu2)
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

Possible points of improvement:
<ul>
  <li>Change 'var' for let/const/''</li>
  <li>Add pairs of tokens of the same team blocking a cell feature</li>
  <li>buttons to toggle the chat, rules display. Improved it's aesthetics (place them on the sides of the window, i.e. chat in the right, rules in the left)</li>
  <li>Make game mobile friendly by fitting the whole board to the entire page</li>
 <ul>
Try to deploy to heroku without the nodue modules locally. (so add the npm install part to the description and add .gitignore for the nodules folder)
