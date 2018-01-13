window.onload = function() {
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'GameWindow', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.tilemap('mario', 'assets/map/test_tiles.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/tiles/super_mario_tiles.png');
    game.load.image('player', 'assets/phaser-dude.png');
}

var map;
var tileset;
var layer;
var p;
var cursors;

function create() {

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

    cursors = game.input.keyboard.createCursorKeys();

}

function update() {

    game.physics.arcade.collide(p, layer);

    p.body.velocity.x = 0;

    if (cursors.up.isDown)
    {
        if (p.body.onFloor())
        {
            p.body.velocity.y = -200;
        }
    }

    if (cursors.left.isDown)
    {
        p.body.velocity.x = -150;
    }
    else if (cursors.right.isDown)
    {
        p.body.velocity.x = 150;
    }

}

function render() {

    // game.debug.body(p);
    game.debug.bodyInfo(p, 32, 320);

}
}
