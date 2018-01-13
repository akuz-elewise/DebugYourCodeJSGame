window.onload = function() {
    var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'GameWindow');

    var startMissionState = {
        preload: function() {
            game.load.image('general', 'assets/general.png');
        },

        create: function() {
            var portrait = game.add.sprite(game.world.centerX, 50, 'general');
            portrait.anchor.set(0.5, 0);
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

    var playState = {
        preload: function() {

            game.load.tilemap('mario', 'assets/map/test_tiles.json', null, Phaser.Tilemap.TILED_JSON);
            game.load.image('tiles', 'assets/tiles/super_mario_tiles.png');
            game.load.image('player', 'assets/phaser-dude.png');
            game.load.image('bullet', 'assets/bullet.png');
        },

        create: function() {

            game.physics.startSystem(Phaser.Physics.ARCADE);

            game.stage.backgroundColor = '#787878';

            map = game.add.tilemap('mario');

            map.addTilesetImage('test_tiles', 'tiles');

            map.setCollisionBetween(15, 16);
            map.setCollisionBetween(20, 25);
            map.setCollisionBetween(27, 29);
            map.setCollision(40);

            layer = map.createLayer('World1');

            layer.resizeWorld();

            p = game.add.sprite(32, 32, 'player');

            game.physics.enable(p);

            game.physics.arcade.gravity.y = 600;

            p.body.bounce.y = 0.2;
            p.body.linearDamping = 1;
            p.body.collideWorldBounds = true;

            game.camera.follow(p);


            //������
            weapon = game.add.weapon(1, 'bullet');

            weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;

            //weapon.bulletAngleVariance = 3;
            weapon.bulletLifespan = 500;
            weapon.bulletSpeed = 700;
            weapon.fireRate = 50;
            weapon.multiFire = true;
            weapon.fireAngle = 355;
            weapon.bulletGravity.y = -500;
            weapon.trackSprite(p, 16, 20);

            cursors = game.input.keyboard.createCursorKeys();
            fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
        },

        update: function() {

            game.physics.arcade.collide(p, layer);

            p.body.velocity.x = 0;
            weapon.fireAngle = 355;
            if(p.body.y > 200)
            {
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

}
