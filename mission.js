

/**
 * module - mission screen
 *
 * @param  {Phaser.Game} game Phaser Game object
 * @return {object}      screen descriptor
 */
module.exports = function(game) {
    return {
        cursors: null,
        monster: null,
        background: null,
        player: null,

        preload: function() {
            game.load.tilemap('mario', 'assets/map/test_tiles.json', null, Phaser.Tilemap.TILED_JSON);
            game.load.image('tiles', 'assets/tiles/super_mario_tiles.png');
            game.load.image('player', 'assets/phaser-dude.png');
            game.load.atlasJSONHash('monster_worm', 'assets/sprites/worm1.png', 'assets/sprites/worm_sprite.json')
            game.load.image('background', 'assets/code-bg.png')
        },

        create: function() {
            game.physics.startSystem(Phaser.Physics.ARCADE);

            background = game.add.tileSprite(0, 0, game.camera.width, game.camera.height, 'background');
            background.fixedToCamera = true;

            map = game.add.tilemap('mario');

            map.addTilesetImage('test_tiles', 'tiles');

            map.setCollisionBetween(15, 16);
            map.setCollisionBetween(20, 25);
            map.setCollisionBetween(27, 29);
            map.setCollision(40);

            layer = map.createLayer('World1');

            layer.resizeWorld();

            var startingPoints = this.getObjectsOfType('start', map, 'Objects1');
            this.player = game.add.sprite(startingPoints[0].x, startingPoints[0].y, 'player');
            game.physics.enable(this.player);

            game.physics.arcade.gravity.y = 400;

            this.player.body.bounce.y = 0.2;
            this.player.body.linearDamping = 1;
            this.player.body.collideWorldBounds = true;

            game.camera.follow(this.player);

            worm = game.add.sprite(512, 32, 'monster_worm');
            worm.anchor.set(0.5, 0.0);
            worm.localState = {
                direction: 1,
            };
            worm.animations.add('move');
            worm.animations.play('move', 6, true);
            game.physics.enable(worm);
            worm.body.velocity.x = -50;
            worm.body.bounce.y = 0.2;
            worm.body.linearDamping = 1;
            this.monster = worm;

            this.cursors = game.input.keyboard.createCursorKeys();
            fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);

            var exitKey = game.input.keyboard.addKey(Phaser.KeyCode.Q);
            exitKey.onDown.addOnce(this.gameover, this);
        },

        update: function() {
            game.physics.arcade.collide(this.player, layer);
            game.physics.arcade.collide(this.monster, layer, this.monsterWormCollideCallback);

            background.tilePosition.set(-0.2 * game.camera.x, -0.2 * game.camera.y);

            if (this.cursors.up.isDown) {
                if (this.player.body.onFloor()) {
                    this.player.body.velocity.y = -200;
                }
            }
            if (this.cursors.left.isDown) {
                this.player.body.velocity.x = -150;
            }
            else if (this.cursors.right.isDown) {
                this.player.body.velocity.x = 150;
            } else {
                this.player.body.velocity.x = 0;
            };

        },

        gameover: function() {
            game.state.start('gameover');
        },


        /**
         * monsterWormCollideCallback - action, when worm collides with the wall
         *
         * @param  {Phaser.Sprite} worm worm instance
         * @return {void}      void
         */
        monsterWormCollideCallback: function(worm) {
            if (worm.body.blocked.left) {
                worm.localState.direction = -1;
            } else if (worm.body.blocked.right) {
                worm.localState.direction = 1;
            };

            worm.scale.x = worm.localState.direction;
            worm.body.velocity.x = -worm.localState.direction * 50;
        },


        /**
         * getObjectsOfType - find object in object layer by its type
         *
         * @param  {string} type  object type
         * @param  {Phaser.Tilemap} map   Phaser.Tilemap object
         * @param  {string} layer layer name
         * @return {Array}       array of objects
         */
        getObjectsOfType: function(type, map, layer) {
            return map.objects[layer].filter(function (value, index, ar) {
                return value.type === type;
            });
          },

          render: function() {
            // game.debug.body(this.monster);
            // game.debug.bodyInfo(this.monster, 32, 300);
        },
    };
};
