var express = require("express");
var url = require("url");
var gameStatus = require("../statTracker");


var router = express.Router();

router.get('/', function (req, res) {
  //example of data to render; here gameStatus is an object holding this information
  res.render('splash.ejs', {
    gamesInitialized: gameStatus.gamesInitialized,
    gamesAborted: gameStatus.gamesAborted,
    gamesCompleted: gameStatus.gamesCompleted,
    onlinePlayersCount: gameStatus.onlinePlayersCount
  });
});

router.get("/favicon.ico", function (req, res) {
  res.sendFile("/images/favicon.png", { root: "./public" });
});

/* GET home page */
router.get("/splash", function (req, res) {
  res.redirect('/');
});

/* Pressing the 'PLAY' button, returns this page */
router.get("/play", function (req, res) {
  res.sendFile("game.html", { root: "./public" });
});

//Login page
router.get("/login", function (req, res) {
  //Demo of log in based on url paramaters (not secure at all)
  var query = url.parse(req.url, true).query;
  var user = query["user"] != undefined ? query["user"] : ""
  var password = query["password"] != undefined ? query["password"] : "";

  if (user === "admin" && password === "1234") {
    console.log("%s\t%s\t%s\t", new Date(), req.ip.substr(7), "LOGIN", "Params", user, password);
    res.send("Url auth is not secure");
  } else {
    //Real intention
    res.sendFile("login.html", { root: "./public" });
  }
});


var authenticate = function (req, res) {
  var auth = req.headers.authorization;
  var auth = req.headers.authorization;
  var parts = auth.split(' ');
  var buf = new Buffer.from(parts[1], 'base64');
  var login = buf.toString().split(':');
  var user = login[0];
  var password = login[1];

//hardcoded for demonstration purposes
if (user === "admin" && password === "1234") {
  console.log("%s\t%s\t%s\t", new Date(), req.ip.substr(7), "LOGIN", auth);
  
  //this is actually a client side cookie. It will never be sent back to the server. Should not be used to verify accounts
  //This is used to keep a local copy of the user firstname to greet him every time he goes to the home page.
  var text = '<script>document.cookie = "user_firstname='+user+'";document.cookie = "login="+new Date();window.location.replace("./");</script>';
  res.send(text);
} else {
  console.log("%s\t%s\t%s\t", new Date(), req.ip.substr(7), "WRNGPW", auth);
  res.send("Wrong credentials");
}
};

//login post request
router.post('/login', authenticate);

//basic auth requiring pages
router.get('/*auth*', function (req, res, next) {
  var auth = req.headers.authorization;
  if (!auth) {
    res.redirect("/login");
  } else {
    next();
  }
});

module.exports = router;