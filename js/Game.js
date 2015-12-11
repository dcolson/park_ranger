var RPGGame = RPGGame || {};

var bullets;
var nextFire = 0;

//title screen
RPGGame.Game = function () {};

RPGGame.Game.prototype = {
  create: function () {
    this.map = this.game.add.tilemap('map');

    //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
    this.map.addTilesetImage('tiles', 'gameTiles');
    this.map.addTilesetImage('hyptosis_sprites-and-tiles-for-you', 'gameTiles2');

    //create layer
    this.backgroundlayer = this.map.createLayer('backgroundLayer');
    this.backgroundlayer2 = this.map.createLayer('backgroundLayer2');
    this.blockedLayer = this.map.createLayer('blockedLayer');

    //collision on blockedLayer
    this.map.setCollisionBetween(1, 3000, true, 'blockedLayer');

    //resizes the game world to match the layer dimensions
    this.backgroundlayer.resizeWorld();

    //create player
    var result = this.findObjectsByType('playerStart', this.map, 'objectsLayer');
    this.player = this.game.add.sprite(result[0].x, result[0].y, 'player');
    this.game.physics.arcade.enable(this.player);
    this.game.state.add('GameOver', gameOver);
    this.game.state.add('victory', victory);

    this.player.frame = 4;

    // create enemies
    var enemyResult = this.findObjectsByType('enemy', this.map, 'objectsLayer');
    enemies = this.add.group();
    this.game.physics.arcade.enable(enemies);
    enemies.enableBody = true;

    for (var i = 0; i < enemyResult.length; i++) {
      var goblin = enemies.create(enemyResult[i].x, enemyResult[i].y, 'goblin');
    }

    // add projectiles
    bullets = this.game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    bullets.createMultiple(500, 'bullet');
    bullets.setAll('checkWorldBounds', true);
    bullets.setAll('outOfBoundsKill', true);

    //the camera will follow the player in the world
    this.game.camera.follow(this.player);

    //move player with cursor keys
    this.cursors = this.game.input.keyboard.createCursorKeys();

    //add player health
    this.player.healthText = this.game.add.text(16, 5, '<3 <3 <3', { fontSize: '32px', fill: '#C00000' });
    this.player.healthText.fixedToCamera = true;
    this.player.healthNumber = 3;
    this.player.hit = false;
    this.player.hitTime = Date.now();

    //add goblin kill count
    this.player.killText = this.game.add.text(155, 5, 'Goblins Killed: 0/12', { fontSize: '32px', fill: 'white' });
    this.player.killText.fixedToCamera = true;
    this.player.killCount = 0;
  },

  //find objects in a Tiled layer that containt a property called 'type' equal to a certain value
  findObjectsByType: function (type, map, layer) {
    var result = new Array();
    map.objects['objectsLayer'].forEach(function (element) {
      if (element.properties.type === type) {
        element.y -= map.tileHeight;
        result.push(element);
      }      
    });
    return result;
  },
  //create a sprite from an object
  createFromTiledObject: function (element, group) {
    var sprite = group.create(element.x, element.y, element.properties.sprite);

      //copy all properties to the sprite
      Object.keys(element.properties).forEach(function (key) {
        sprite[key] = element.properties[key];
      });
  },
  decreaseHealth: function () {
    if (!--this.player.healthNumber) {
      this.game.state.start('GameOver', true, false);
    }
    this.player.healthText.text = '<3 '.repeat(this.player.healthNumber);
    this.player.hit = true;
    this.player.hitTime = Date.now();
  },
  shoot: function () {
     if (this.game.time.now > nextFire && bullets.countDead() > 0) {
        nextFire = this.game.time.now + 600;
        var bullet = bullets.getFirstDead();
        bullet.reset(this.player.x, this.player.y + 20);
        this.game.physics.arcade.moveToPointer(bullet, 300);
    }
  },
  killEnemy: function (enemy, projectile) {
    enemy.kill();
    projectile.kill();
    this.player.killText.text = 'Goblins Killed: ' + ++this.player.killCount + '/12';
    if (this.player.killCount === 11) {
      this.game.state.start('victory', true, false);
    }
  },
  update: function () {
    var goblinSpeed = 350;
    //collision
    this.game.physics.arcade.collide(this.player, this.blockedLayer);
    this.game.physics.arcade.overlap(enemies, bullets, this.killEnemy, null, this);
    this.game.physics.arcade.collide(bullets, this.blockedLayer);

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
      this.shoot();
    }


    //player movement
    
    this.player.body.velocity.x = 0;

    if (this.cursors.up.isDown) {
      if (this.player.body.velocity.y == 0)
      this.player.body.velocity.y -= 100;
    } else if (this.cursors.down.isDown) {
      if (this.player.body.velocity.y == 0)
      this.player.body.velocity.y += 100;
    } else {
      this.player.body.velocity.y = 0;
    } if (this.cursors.left.isDown) {
      this.player.body.velocity.x -= 100;
    } else if (this.cursors.right.isDown) {
      this.player.body.velocity.x += 100;
    }

    // enemy movement
    enemies.forEachAlive(function (goblin) {
      if (!(goblin.move > this.game.time.now) || this.game.physics.arcade.collide(goblin, this.blockedLayer)) {
        // have the goblin move in a direction for between .5 and 2 seconds
        goblin.body.velocity.x = 0;
        goblin.body.velocity.y = 0;
        goblin.move = this.game.time.now + (Math.random() * 5 + 5) * 20;
        // pick a direction
        var direction = Math.floor(Math.random() * 4);
        switch (direction) {
          case 0:
            goblin.body.velocity.x = -goblinSpeed;
            break;
          case 1:
            goblin.body.velocity.y = goblinSpeed;
            break;
          case 2:
            goblin.body.velocity.x = goblinSpeed;
            break;
          case 3:
            goblin.body.velocity.y = -goblinSpeed;
            break;
        }
      }
    }, this);

  }
};