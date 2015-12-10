
var gameOver = function(game){}
 
gameOver.prototype = {
 	create: function(){
  	this.game.add.text(240, 180, 'Game Over', { fill: "red", fontsize: "40px" });
	}
}