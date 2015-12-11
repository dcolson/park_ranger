
var victory = function (game) {}
 
victory.prototype = {
  create: function () {
    this.game.add.text(240, 180, 'Congratulations!', 
      { fill: 'yellow', fontsize: '28px' });
    this.game.add.button (200, 240, 'player', this.startGame, this);
  },
  startGame: function () {
    this.game.state.start('Game');
  }
}

var RPGGame = RPGGame || {};

      RPGGame.game = new Phaser.Game(480, 360, Phaser.AUTO, '', { preload: preload});

      RPGGame.game.state.add('Game', RPGGame.Game);
      RPGGame.game.state.add('menu', RPGGame.Game);
      RPGGame.game.state.add('victory', RPGGame.Game);
      RPGGame.game.state.add('gameOver', RPGGame.Game);

      function preload () {
        //scaling options
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

        //physics system
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        //load game assets
        this.load.tilemap('map', 'assets/tilemaps/map.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('gameTiles', 'assets/tilemaps/tile1.png');
        this.load.image('gameTiles2', 'assets/tilemaps/hyptosis_sprites-and-tiles-for-you.png');
        this.load.image('goblin', 'assets/images/enemy1.png');
        this.load.image('bullet', 'assets/images/projectile.png');
        this.load.spritesheet('player', 'assets/images/dude.png', 32, 48);

        this.state.start('Game', true, false);
      }