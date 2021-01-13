var express = require("express");
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

/* Pressing the 'PLAY' button, returns this page */
router.get("/auth/admin_greeting", function (req, res) {
  res.send("This data is only reached by authenticated users");
});

module.exports = router;