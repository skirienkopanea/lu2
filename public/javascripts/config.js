//Shared values (only at gamestart) between client and server
(function (exports) {
  exports.DEBUG_MODE = false; //toggle all socket messages in the chatbox
  exports.DICE_GOD = false; //dice cheat
  exports.GAME_SPEED = 1/1 * 1000; // 1/k makes it k times faster
  exports.TIME_TURN = 30; //seconds
  exports.MAX_GAME_DURATION = 3600; //1 hour
  exports.LAST_COIN = undefined; //last clicked cloin on the board, this coin will be moved if a cell is clicked on time
  exports.LAST_CELL = -1; //last cell clicked on the board, if clicked on time the last clicked coin will be moved there
})(typeof exports === "undefined" ? (this.client = {}) : exports);
  //if exports is undefined, we are on the client; else the server