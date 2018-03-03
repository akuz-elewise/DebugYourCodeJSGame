
var Bug = require('./bug.js');
var Player = require('./player.js');
var Invoker = require('./invoker.js');

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
        bugs: null,
        user: null,
        invoker: null,

        init: function() {
            game.renderer.renderSession.roundPixels = true;
        },

        preload: function() {
            game.load.tilemap('mario', 'assets/map/test_tiles.json', null, Phaser.Tilemap.TILED_JSON);
            game.load.image('tiles', 'assets/tiles/super_mario_tiles.png');
            game.load.image('player', 'assets/phaser-dude.png');
            game.load.atlasJSONHash('programmer', 'assets/sprites/player_tilesheet.png', 'assets/sprites/player-atlas.json');
            game.load.atlasJSONHash('monster_worm', 'assets/sprites/worm1.png', 'assets/sprites/worm_sprite.json');
            game.load.atlasJSONHash('monster_qa_bug', 'assets/sprites/bug_atlas.png', 'assets/sprites/bug_atlas.json');
            game.load.atlasJSONHash('monster_invoker', 'assets/sprites/invoker-atlas.png', 'assets/sprites/invoker-atlas.json');
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
            game.physics.arcade.gravity.y = 400;

            this.player = new Player(game, startingPoints[0].x, startingPoints[0].y);
            game.add.existing(this.player);
            game.camera.follow(this.player);

            this.bugs = game.add.group();

            var worm = game.add.sprite(512, 32, 'monster_worm');
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

            var bug = new Bug(game, 256, 32);
            this.bugs.add(bug);

            var invoker = new Invoker(game, 128, 32);
            this.bugs.add(invoker);

            fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);

            var exitKey = game.input.keyboard.addKey(Phaser.KeyCode.Q);
            exitKey.onDown.addOnce(this.gameover, this);
        },

        update: function() {
            game.physics.arcade.collide(this.player, layer);
            //game.physics.arcade.collide(this.user, layer);
            game.physics.arcade.collide(this.monster, layer, this.monsterCollidesWallsCallback);
            // game.physics.arcade.collide(this.bug, layer, this.monsterCollidesWallsCallback);
            game.physics.arcade.collide(this.bugs, layer);

            background.tilePosition.set(-0.2 * game.camera.x, -0.2 * game.camera.y);
        },

        gameover: function() {
            game.state.start('gameover');
        },


        /**
         * monsterCollidesWallsCallback - action, when monster collides with the wall
         *
         * @param  {Phaser.Sprite} worm worm instance
         * @return {void}      void
         */
        monsterCollidesWallsCallback: function(monster) {
            if (monster.body.blocked.left) {
                monster.localState.direction = -1;
            } else if (monster.body.blocked.right) {
                monster.localState.direction = 1;
            };

            monster.scale.x = monster.localState.direction;
            monster.body.velocity.x = -monster.localState.direction * 50;
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
            //game.debug.physicsGroup(this.bugs);
            game.debug.bodyInfo(this.player, 32, 300);
            //game.debug.spriteInfo(this.player, 32, 300);
            game.debug.body(this.player);
        },
    };
};
