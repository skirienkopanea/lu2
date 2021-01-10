var express = require("express");
var router = express.Router();

/* GET home page */
router.get("/splash", function(req, res) {
  res.redirect('/');
});

/* Pressing the 'PLAY' button, returns this page */
router.get("/play", function(req, res) {
  res.sendFile("game.html", { root: "./public" });
});

module.exports = router;

/*3.2) Your first routes
In the next step, let’s make our two HTML files available via routes:

URLs ending in *.html are considered old-fashioned, modern web frameworks avoid this and use routes instead.
Add a route (i.e. app.get("/",...)) so that splash.html is served for the URL http://localhost:3000/.
You can make use of res.sendFile("splash.html", {root: "./public"});.
A click on the Play button (or your equivalent) in the splash screen will return the game.html content.
If you are using the HTML <button> element here, you can enclose it in an HTML <form> with an appropriate action attribute.
Together with the app.use(express.static(__dirname + "/public")); line in your server,
this is sufficient to serve your HTML and client-side JavaScript.

In our boilerplate setup, a folder routes was generated; you can store your routes in files within this folder.
The demo game shows you how to do this and how to import the routes in app.js. This is typically done to make the code more maintainable.
You can also write out all routes directly in app.js as we often do in the toy code examples presented in the lecture transcripts.
*/