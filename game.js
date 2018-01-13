window.onload = function() {

    var game = new Phaser.Game(800, 600, Phaser.AUTO, 'GameWindow', {
        preload: preload,
        create: create,
        update: update
    });

    function preload() {
        game.load.image('player', 'assets/player.png');
        game.load.image('wall', 'assets/wall.png');
    }

    function create() {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.time.desiredFps = 30;
        game.physics.arcade.gravity.y = 250;

        this.player = game.add.sprite(70, 100, 'player');
        game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.body.bounce.y = 0.2;
        this.player.body.collideWorldBounds = true;
        this.player.body.setSize(20, 20);

        this.cursor = game.input.keyboard.createCursorKeys();
        this.jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.jumpTimer = 0;

        createLevel();
    }

    function createLevel() {
        var level = [
            'xxxxxxxxxxxxxxx',
            'x             x',
            'x             x',
            'x             x',
            'x             x',
            'x             x',
            'x             x',
            'xxxxxxxxxxxxxxx'
        ];

        this.walls = game.add.group();

        for (var i = 0; i < level.length; i++) {
            for (var j = 0; j < level[i].length; j++) {
                if (level[i][j] == 'x') {
                    var wall = game.add.sprite(30 + 20 * j, 30 + 20 * i, 'wall');
                    game.physics.enable(wall, Phaser.Physics.ARCADE);
                    wall.body.allowGravity = false;
                    wall.body.setSize(20, 20);
                    wall.body.immovable = true;
                    this.walls.add(wall);
                }
            }
        }
    }

    function update() {
        game.physics.arcade.collide(this.player, this.walls);

        if (this.cursor.left.isDown) {
            this.player.body.velocity.x = -200;
        } else if (this.cursor.right.isDown) {
            this.player.body.velocity.x = 200;
        } else {
            this.player.body.velocity.x = 0;
        }

        if (this.jumpButton.isDown && this.player.body.onFloor() && game.time.now > this.jumpTimer) {
            this.player.body.velocity.y = -250;
            this.jumpTimer = game.time.now + 750;
        }
    }
};