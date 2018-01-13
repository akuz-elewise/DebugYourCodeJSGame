window.onload = function() {
    var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'GameWindow');

    var startMissionState = {
        preload: function() {
            game.load.image('general', 'assets/general.png');
        },

        create: function() {
            var portrait1 = game.add.sprite(game.world.centerX, 50, 'general');
            portrait1.anchor.set(0.5, 0);
            //game.stage.backgroundColor = '#000';
            var speech = "Так... тут у нас новенький!\nВот тебе задание, боец: в той задачке засели серьёзные баги!\nНадо их вычистить!";
            var speechStyle = { font: "18px Arial", fill: "#ff0044", align: "center", boundsAlignH: "center", boundsAlignV: "top" };
            var speechText = game.add.text(0, 0, speech, speechStyle);
            speechText.setTextBounds(0, 300, 800, 200);

            var msg = "Для начала игры нажмите ПРОБЕЛ";
            var msgStyle = { font: "bold 14px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
            var msgObj = game.add.text(0, 0, msg, msgStyle);

            msgObj.setTextBounds(0, 500, 800, 100);

            var spaceKey = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
            spaceKey.onDown.addOnce(this.start, this);
        },

        start: function() {
            game.state.start('play');
        }
    };

    var gameOverState = {

        preload: function() {
            game.load.image('general', 'assets/general.png');
        },

        create: function() {
            var portrait = game.add.sprite(game.world.centerX, 50, 'general');
            portrait.anchor.set(0.5, 0);
            //game.stage.backgroundColor = '#000';
            var speech = "Баги попали в релиз, боец!\nТы провалил задание!\nТы можешь попытаться ещё раз.";
            var speechStyle = { font: "18px Arial", fill: "#ff0044", align: "center", boundsAlignH: "center", boundsAlignV: "top" };
            var speechText = game.add.text(0, 0, speech, speechStyle);
            speechText.setTextBounds(0, 300, 800, 200);

            var msg = "Нажмите ПРОБЕЛ, чтобы попытаться заново";
            var msgStyle = { font: "bold 14px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
            var msgObj = game.add.text(0, 0, msg, msgStyle);

            msgObj.setTextBounds(0, 500, 800, 100);

            var spaceKey = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
            spaceKey.onDown.addOnce(this.start, this);
        },

        start: function() {
            game.state.start('beginMission');
        }
    };

    var lives;
    var livesCounter;
    var playState = {
        preload: function() {
            game.load.tilemap('mario', 'assets/map/test_tiles.json', null, Phaser.Tilemap.TILED_JSON);
            game.load.image('tiles', 'assets/tiles/super_mario_tiles.png');
            game.load.image('player', 'assets/phaser-dude.png');
            game.load.image('bullet', 'assets/bullet.png');
            game.load.image('heart', 'assets/player.png');
            game.load.image('bug1', 'assets/bug_1.png');
            this.lives = null;
            this.livesCounter = 3;
        },

        hurtPlayer: function(player) {
            //enemy.play('attacking');
            //player.play('hit');
            var live = this.lives.getFirstAlive();

            if (live) {
                live.kill();
            }

            this.livesCounter--;
            console.log(this.livesCounter);
            if (this.livesCounter == 0) {
                player.kill();
                game.state.start('gameover');
                //this.playerDies(); // Use your custom function when the player dies
            }
        },
        create: function() {

            game.physics.startSystem(Phaser.Physics.ARCADE);

            //  Lives
            this.lives = this.add.group();
            var x = 120; // use your values
            var y = 250;

            for (var i = 0; i < 3; i++) {
                var yourSprite = this.lives.create(
                    x - 100 + 30 * i,
                    y,
                    'heart'
                );
                yourSprite.anchor.setTo(0.5, 0.5);
            }

            this.lives.render = function() {
                this.hurtPlayer(p);
            };
            //game.stage.backgroundColor = '#787878';

            map = game.add.tilemap('mario');

            map.addTilesetImage('test_tiles', 'tiles');

            map.setCollisionBetween(15, 16);
            map.setCollisionBetween(20, 25);
            map.setCollisionBetween(27, 29);
            map.setCollision(40);

            layer = map.createLayer('World1');

            layer.resizeWorld();

            p = game.add.sprite(32, 32, 'player');
            p.health = 100;
            game.physics.enable(p);

            game.physics.arcade.gravity.y = 600;

            p.body.bounce.y = 0.2;
            p.body.linearDamping = 1;
            p.body.collideWorldBounds = true;

            game.camera.follow(p);

            enemies = game.add.group();
            game.physics.enable(enemies);
            enemies.enableBody = true;
            enemies.physicsBodyType = Phaser.Physics.ARCADE;
            enemies.createMultiple(5, 'bug1');
            enemies.setAll('anchor.x', 0.5);
            enemies.setAll('anchor.y', 0.5);
            enemies.forEach(function(enemy) {
                addEnemyEmitterTrail(enemy);
            });
            game.time.events.add(1000, launchGreenEnemy);
            weapon = game.add.weapon(1, 'bullet');

            weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;

            //weapon.bulletAngleVariance = 3;
            weapon.bulletLifespan = 500;
            weapon.bulletSpeed = 500;
            weapon.fireRate = 1000;
            weapon.multiFire = true;
            weapon.fireAngle = 270;
            weapon.bulletGravity.y = 800;
            weapon.trackSprite(p, 16, 20);

            cursors = game.input.keyboard.createCursorKeys();
            fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
        },

        update: function() {

            game.physics.arcade.collide(p, layer);
            game.physics.arcade.collide(enemies, layer);
            game.physics.arcade.collide(weapon, layer);
            p.body.velocity.x = 0;
            weapon.fireAngle = 355;
            //  Check collisions
            game.physics.arcade.overlap(p, enemies, shipCollide, null, this);
            game.physics.arcade.overlap(enemies, weapon.bullets, hitEnemy, null, this);
            if (p.body.y > 200) {
                game.state.start('gameover');
            }
            if (cursors.up.isDown) {
                if (p.body.onFloor()) {
                    p.body.velocity.y = -200;
                }
            }
            if (cursors.left.isDown) {
                p.body.velocity.x = -150;
                if (fireButton.isDown) {
                    weapon.fireAngle = -175;
                    weapon.fire();
                }
            } else if (cursors.right.isDown) {
                p.body.velocity.x = 150;
                if (fireButton.isDown) {
                    weapon.fireAngle = 355;
                    weapon.fire();
                }
            }

            if (fireButton.isDown) {
                weapon.fire();
            }
        },

        render: function() {

            // game.debug.body(p);
            game.debug.bodyInfo(p, 32, 320);

        }
    }

    game.state.add('beginMission', startMissionState);
    game.state.add('play', playState);
    game.state.add('gameover', gameOverState);
    game.state.start('beginMission');

    function shipCollide(player, enemy) {
        enemy.kill();

        player.damage(enemy.damageAmount);
        this.hurtPlayer(player);
    }

    function hitEnemy(enemy, bullet) {
        enemy.kill();
        bullet.kill()
    }

    function addEnemyEmitterTrail(enemy) {
        var enemyTrail = game.add.emitter(enemy.x, p.y - 10, 100);
        enemyTrail.width = 10;
        enemyTrail.setXSpeed(20, -20);
        enemy.trail = enemyTrail;
    }

    function launchGreenEnemy() {
        var MIN_ENEMY_SPACING = 30;
        var MAX_ENEMY_SPACING = 300;
        var ENEMY_SPEED = 30;

        var enemy = enemies.getFirstExists(false);
        if (enemy) {
            enemy.reset(game.rnd.integerInRange(0, game.width), -20);
            enemy.body.velocity.x = game.rnd.integerInRange(-300, 300);
            //enemy.body.velocity.y = ENEMY_SPEED;
            enemy.body.drag.x = 100;

            enemy.trail.start(false, 800, 1);

            //  Update function for each enemy ship to update rotation etc
            enemy.update = function() {
                //enemy.angle = 180 - game.math.radToDeg(Math.atan2(enemy.body.velocity.x, enemy.body.velocity.y));

                enemy.trail.x = enemy.x;
                //enemy.trail.y = enemy.y -10;

                //  Kill enemies once they go off screen
                if (enemy.x > game.width + 200) {
                    enemy.kill();
                }
            }
        }

        //  Send another enemy soon
        greenEnemyLaunchTimer = game.time.events.add(game.rnd.integerInRange(MIN_ENEMY_SPACING, MAX_ENEMY_SPACING), launchGreenEnemy);
    }

}