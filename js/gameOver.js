
var gameOver = function (game) {}
 
gameOver.prototype = {
  create: function () {
    this.game.add.text(240, 180, 'Game Over', { fill: 'red', fontsize: '40px' });
    this.game.add.button (200, 240, 'player', this.startGame, this);
  },
  startGame: function () {
    this.game.state.start('Game');
  }
}