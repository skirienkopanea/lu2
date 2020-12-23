//Shared values (only at gamestart) between client and server
(function (exports) {
  exports.DEBUG_MODE = false; //toggle all socket messages in the chatbox
  exports.DICE_GOD = false; //dice cheat
  exports.GAME_SPEED = 1/1 * 1000; // 1/k makes it k times faster
  exports.TIME_TURN = 30; //Keep
  exports.MAX_GAME_DURATION = 3600; //keep
  exports.LAST_COIN = undefined;
  exports.LAST_CELL = -1;
})(typeof exports === "undefined" ? (this.client = {}) : exports);
  //if exports is undefined, we are on the client; else the server