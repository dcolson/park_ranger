var RPGGame = RPGGame || {};

var nextShot = 0;
var projectiles;

//title screen
RPGGame.Game = function(){};

RPGGame.Game.prototype = {
  create: function() {
    this.map = this.game.add.tilemap('map');

    //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
    this.map.addTilesetImage('tiles', 'gameTiles');

    //create layer
    this.backgroundlayer = this.map.createLayer('backgroundLayer');
    this.backgroundlayer2 = this.map.createLayer('backgroundLayer2');
    this.blockedLayer = this.map.createLayer('blockedLayer');

    //collision on blockedLayer
    this.map.setCollisionBetween(1, 3000, true, 'blockedLayer');

    //resizes the game world to match the layer dimensions
    this.backgroundlayer.resizeWorld();

    this.createItems();

    //create player
    var result = this.findObjectsByType('playerStart', this.map, 'objectsLayer');
    this.player = this.game.add.sprite(result[0].x, result[0].y, 'player');
    this.game.physics.arcade.enable(this.player);
    this.game.state.add("GameOver", gameOver);

    this.player.frame = 4;

    // create enemies
    var enemyResult = this.findObjectsByType('enemy', this.map, 'objectsLayer');
    enemies = this.add.group();
    this.game.physics.arcade.enable(enemies);
    enemies.enableBody = true;

    // add projectiles
    projectiles = this.game.add.group();
    projectiles.enableBody = true;
    this.game.physics.arcade.enable(projectiles);
    projectiles.physicsBodyType = Phaser.Physics.ARCADE;

    projectiles.createMultiple(50, 'shot');
    projectiles.setAll('checkWorldBounds', true);
    projectiles.setAll('outOfBoundsKill', true);

    for (var i = 0; i < enemyResult.length; i++) {
      var goblin = enemies.create(enemyResult[i].x, enemyResult[i].y, 'goblin');
    }

    //the camera will follow the player in the world
    this.game.camera.follow(this.player);

    //move player with cursor keys
    this.cursors = this.game.input.keyboard.createCursorKeys();

    //add player health
    this.player.healthText = this.game.add.text(16, 16, '<3 <3 <3', { fontSize: '32px', fill: '#C00000' });
    this.player.healthText.fixedToCamera = true;
    this.player.healthNumber = 3;
    this.player.hit = false;
    this.player.hitTime = Date.now();

  },
  createItems: function() {
    //create items
    this.items = this.game.add.group();
    this.items.enableBody = true;
    var item;    
    result = this.findObjectsByType('item', this.map, 'objectsLayer');
    result.forEach(function(element){
      this.createFromTiledObject(element, this.items);
    }, this);
  },

  //find objects in a Tiled layer that containt a property called "type" equal to a certain value
  findObjectsByType: function(type, map, layer) {
    var result = new Array();
    map.objects['objectsLayer'].forEach(function(element){
      if(element.properties.type === type) {
        //Phaser uses top left, Tiled bottom left so we have to adjust
        //also keep in mind that the cup images are a bit smaller than the tile which is 16x16
        //so they might not be placed in the exact position as in Tiled
        element.y -= map.tileHeight;
        result.push(element);
      }      
    });
    return result;
  },
  //create a sprite from an object
  createFromTiledObject: function(element, group) {
    var sprite = group.create(element.x, element.y, element.properties.sprite);

      //copy all properties to the sprite
      Object.keys(element.properties).forEach(function(key){
        sprite[key] = element.properties[key];
      });
  },
  decreaseHealth: function() {
    if (!--this.player.healthNumber) {
      this.game.state.start('GameOver', true, false);
    }
    console.log(this.player.healthText);
    this.player.healthText.text = '<3 '.repeat(this.player.healthNumber);
    this.player.hit = true;
    this.player.hitTime = Date.now();
  },
  endGame: function() {

  },
  shoot: function() {
    if (Date.now() > nextShot && projectiles.countDead() > 0) {
        nextShot = Date.now() + 200;
        var shot = projectiles.getFirstDead();
        shot.reset(sprite.x - 8, sprite.y - 8);
        game.physics.arcade.moveToPointer(shot, 300);
      }
  },
  update: function() {
    //collision
    this.game.physics.arcade.collide(this.player, this.blockedLayer);

    // only have player take hit if hasn't been hit in last 1.5 seconds
    if (this.player.hit) {
      if (Date.now() > this.player.hitTime + 1500) {
        this.player.hit = false;
        this.game.physics.arcade.overlap(this.player, enemies, this.decreaseHealth, null, this);
      }
    } else {
      this.game.physics.arcade.overlap(this.player, enemies, this.decreaseHealth, null, this);
    }

    if (this.game.input.activePointer.isDown) {
      this.shoot;
    }

    //player movement
    
    this.player.body.velocity.x = 0;

    if(this.cursors.up.isDown) {
      if(this.player.body.velocity.y == 0)
      this.player.body.velocity.y -= 100;
    }
    else if(this.cursors.down.isDown) {
      if(this.player.body.velocity.y == 0)
      this.player.body.velocity.y += 100;
    }
    else {
      this.player.body.velocity.y = 0;
    }
    if(this.cursors.left.isDown) {
      this.player.body.velocity.x -= 100;
    }
    else if(this.cursors.right.isDown) {
      this.player.body.velocity.x += 100;
    }
  },
  collect: function(player, collectable) {
    console.log('yummy!');

    //remove sprite
    collectable.destroy();
  }
};