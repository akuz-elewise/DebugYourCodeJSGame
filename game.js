window.onload = function() {

    var game = new Phaser.Game(800, 600, Phaser.AUTO, 'GameWindow', {
        preload: preload,
        create: create,
        update: update
    });

    //var logo;

    function preload() {
        //game.load.image('logo', 'phaser.png');
        game.load.image('player', 'assets/player.png');
        game.load.image('wall', 'assets/wall.png');
    }

    function create() {
        //logo = game.add.sprite(game.world.centerX, game.world.centerY, 'logo');
        //logo.anchor.setTo(0.5, 0.5);
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.world.enableBody = true;

        this.cursor = game.input.keyboard.createCursorKeys();
        this.player = game.add.sprite(70, 100, 'player');
        this.player.body.gravity.y = 800;

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
                    this.walls.add(wall);
                    wall.body.immovable = true;
                }
            }
        }
    }

    function update() {
        //logo.angle += 1;
        game.physics.arcade.collide(this.player, this.walls);
    }
};