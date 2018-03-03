(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
 * anonymous function - briefing screen descriptor
 *
 * @param  {Phaser.Game} game Phaser Game object
 * @return {object}      screen descriptor
 */
module.exports = function (game) {
    return {
        preload: function() {
            game.load.image('general', 'assets/general.png');
        },

        create: function() {
            game.stage.backgroundColor = '#000';

            this.portrait = game.add.image(game.camera.view.width / 2, 50, 'general')
            this.portrait.anchor.set(0.5, 0);

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

        update: function() {

        },

        start: function() {
            game.state.start('mission');
        },

        render: function() {

        },
    };
}

},{}],2:[function(require,module,exports){

var StateMachine = require('./lib/state-machine.js');

/**
 * GameActor - abstract game actor
 *
 * @param  {Phaser.Game} game    Phaser.Game object
 * @param  {number} x       x position
 * @param  {number} y       y position
 * @return {void}
 */
function Bug(game, x, y) {
    // Bug object internal state
    this._state = {
        direction: 0,
        speed: this._getSpeed(),
        fsm: null,
        timer: 100,
    };

    Phaser.Sprite.call(this, game, x, y, 'monster_qa_bug');
    this.anchor.set(0.5, 0.5);

    // setup physic properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;

    // setup animations
    this._setupAnimations();

    // setup initial state and FSM
    this._setupState();

}

// inherit from Phaser.Sprite
Bug.prototype = Object.create(Phaser.Sprite.prototype);
Bug.prototype.constructor = Bug;

// Bug constants
Bug.prototype.CONST = {
    SPEED: 20,
    SPEED_VARIATION: 20,
    BODIES: {
        'run': {
            'default': { width: 49, height: 33 },
        },
        'idle': {
            'default': { width: 49, height: 31 },
        },
        'dmg': {
            'default': { width: 49, height: 30 },
        },
        'lose': {
            'default': { width: 49, height: 31 },
        },
        'win': {
            'default': { width: 49, height: 37 },
        },
        'fall': {
            'default': { width: 49, height: 37 },
        },
        'landing': {
            'default': { width: 49, height: 37 },
        },
    },
};

Bug.prototype._setupAnimations = function() {
    this.animations.add('run', [8, 9, 10, 11, 12], this._state.speed / 4, true);
    this.animations.add('idle', [4]);
    this.animations.add('dmg', [0, 1, 2, 3]);
    this.animations.add('lose', [4, 5, 6, 7]);
    this.animations.add('win', [13, 14, 15]);
    this.animations.add('fall', [14]);
    this.animations.add('landing', [14, 13, 15, 13]);
    this.animations.play('idle');
}

Bug.prototype._setupState = function() {
    this._state.direction = Math.random() < 0.5 ? -1 : 1;
    let bug = this;
    this._state.fsm = new StateMachine({

        init: 'idle',

        transitions: [
            { name: 'move', from: 'idle', to: 'run' },
            { name: 'stop', from: 'run', to: 'idle' }
        ],

        methods: {
            onMove: function() {
                bug._onMove();
            },
            onStop: function() {
                bug._onStop();
            },
            update: function() {
                bug._updateState();
            },
        },

    });
};

Bug.prototype.update = function() {
    this._state.fsm.update();
    this._setBody();

    if (this._state.timer !== null) {
        if (!this._state.timer) {
            this._decideNewAction();
        } else {
            this._state.timer--;
        };
    }
};

Bug.prototype._setBody = function() {
    let ani = this.animations.name;
    let sizes = this.CONST.BODIES[ani];
    let key = this.animations.frame;
    var size = sizes[key] ? sizes[key] : sizes['default'];
    this.body.setSize(size.width, size.height);
};

Bug.prototype._getSpeed = function() {
    return this.CONST.SPEED + Math.random() * this.CONST.SPEED_VARIATION;
};

Bug.prototype._decideNewAction = function() {
    let fsm = this._state.fsm;
    let curState = fsm.state;
    if (curState === 'idle') {
        fsm.move();
        this._state.timer = 400;
    } else if (curState === 'run') {
        fsm.stop();
        this._state.timer = 100;
    };
};

Bug.prototype._onMove = function() {
    this.animations.play('run');
    this._state.speed = this._getSpeed();
};

Bug.prototype._onStop = function() {
    this.animations.play('idle');
    this.body.velocity.x = 0;
};

Bug.prototype._updateState = function() {
    let fsm = this._state.fsm;
    if (!fsm) {
        return;
    }

    let state = fsm.state;
    if (state === 'idle') {
        this._updateIdle();
    } else if (state === 'run') {
        this._updateRun();
    } else {
        console.log('No handler for state ${state}');
    };
};

Bug.prototype._updateIdle = function() {
    this.scale.x = -this._state.direction;
};

Bug.prototype._updateRun = function() {
    if (this.body.blocked.left) {
        this._state.direction = 1;
    } else if (this.body.blocked.right) {
        this._state.direction = -1;
    };

    this.scale.x = -this._state.direction;
    this.body.velocity.x = this._state.direction * this._state.speed;
};

module.exports = Bug

},{"./lib/state-machine.js":6}],3:[function(require,module,exports){
var briefingScreen = require('./briefingScreen.js');
var gameoverScreen = require('./gameoverScreen.js');
var missionScreen = require('./mission.js');

window.onload = function() {
    var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'GameWindow');

    game.state.add('beginMission', briefingScreen(game));
    game.state.add('mission', missionScreen(game));
    game.state.add('gameover', gameoverScreen(game));
    game.state.start('beginMission');

    // var lives;
    // var livesCounter;
    // var face='right';
	//    var state='ggRun';
    // var playState = {
    //     preload: function() {
    //         game.load.tilemap('mario', 'assets/map/test_tiles.json', null, Phaser.Tilemap.TILED_JSON);
    //         game.load.image('tiles', 'assets/tiles/super_mario_tiles.png');
    //         game.load.image('player', 'assets/phaser-dude.png');
    //         game.load.image('bullet', 'assets/bullet.png');
    //         game.load.image('heart', 'assets/player.png');
	// 		game.load.spritesheet('ggAtack','assets/sprites/gg_atack_74x81_right.png',74,81,5);
	// 		game.load.spritesheet('ggDie','assets/sprites/gg_die_86x83_right.png',86,83,6);
	// 		game.load.spritesheet('ggDizzy','assets/sprites/gg_dizzy_75x71_right.png',75,71,3);
	// 		game.load.spritesheet('ggDmg','assets/sprites/gg_dmg_57x79_right.png',57,79,1);
	// 		game.load.spritesheet('ggIdle','assets/sprites/gg_idle_57x79_right.png',57,79,1);
	// 		game.load.spritesheet('ggJump', 'assets/sprites/gg_jump_62x76_right.png', 62, 76, 5);
	// 		game.load.spritesheet('ggRun', 'assets/sprites/gg_run_58x70_right.png', 58, 70, 7);
	// 		game.load.spritesheet('boss1Stay','assets/sprites/boss_1_stay_left_40_184.png',40,184,1);
	// 		game.load.spritesheet('boss1Atack','assets/sprites/boss1_attack_left_82_183.png',82,183,3);
	// 		game.load.spritesheet('boss1Dmg','assets/sprites/boss1_dmg_left_55_158.png',55,158,4);
	// 		game.load.spritesheet('boss1Lose','assets/sprites/boss1_lose_left_46_161.png',46,161,3);
	// 		game.load.spritesheet('boss1Walk','assets/sprites/boss1_walk_left_78_191.png',78,191,2);
	// 	      game.load.spritesheet('boss1Win','assets/sprites/boss1_win_left_90_182.png',90,182,5);
	// 		game.load.spritesheet('bugDmg','assets/sprites/bug_dmg_46x30_right.png',46,30,4);
	// 		game.load.spritesheet('bugLose','assets/sprites/bug_lose_49x31_right.png',49,31,4);
	// 		game.load.spritesheet('bugRun','assets/sprites/bug_run_48x33_right.png',48,33,5);
	// 		game.load.spritesheet('bugWin','assets/sprites/bug_win_48x37_right.png',48,37,3);
	// 		game.load.spritesheet('bike','assets/sprites/hindu_34x46_right.png',34,46,3);
	// 		game.load.spritesheet('mumy','assets/sprites/metalslug_mummy37x45.png',37,45,18);
    //         game.load.image('bug1', 'assets/bug_1.png');
    //         game.load.audio('music', 'assets/Battle_Loop.mp3');
    //         this.lives = null;
    //         this.livesCounter = 3;
    //     },
    //
    //     playerDies: function() {
    //         music.stop();
    //         game.state.start('gameover');
    //     },
    //
    //     hurtPlayer: function(player) {
    //         //enemy.play('attacking');
    //         //player.play('hit');
    //         var live = this.lives.getFirstAlive();
    //
    //         if (live) {
    //             live.kill();
    //         }
    //
    //         this.livesCounter--;
    //         console.log(this.livesCounter);
    //         if (this.livesCounter == 0) {
    //             player.kill();
    //             this.playerDies();
    //             //this.playerDies(); // Use your custom function when the player dies
    //         }
    //     },
    //
    //     create: function() {
    //
    //         music = game.add.audio('music');
    //         music.play();
    //         game.physics.startSystem(Phaser.Physics.ARCADE);
    //
    //         //  Lives
    //         this.lives = this.add.group();
    //         var x = 120; // use your values
    //         var y = 250;
    //
    //         for (var i = 0; i < 3; i++) {
    //             var yourSprite = this.lives.create(
    //                 x - 100 + 30 * i,
    //                 y,
    //                 'heart'
    //             );
    //             yourSprite.anchor.setTo(0.5, 0.5);
    //         }
    //
    //         this.lives.render = function() {
    //             this.hurtPlayer(p);
    //         };
    //         //game.stage.backgroundColor = '#787878';
    //
    //         map = game.add.tilemap('mario');
    //
    //         map.addTilesetImage('test_tiles', 'tiles');
    //
    //         map.setCollisionBetween(15, 16);
    //         map.setCollisionBetween(20, 25);
    //         map.setCollisionBetween(27, 29);
    //         map.setCollision(40);
    //
    //         layer = map.createLayer('World1');
    //
    //         layer.resizeWorld();
    //
    //         //p = game.add.sprite(32, 32, 'player');
    //         p = game.add.sprite(32, 32, state);
	// 		         p.animations.add('run', [0,1,2,3,4,5]);
	// 		            p.animations.play('run', 10, true);
    //         p.health = 100;
    //         game.physics.enable(p);
    //
    //         game.physics.arcade.gravity.y = 600;
    //
    //         p.body.bounce.y = 0.2;
    //         p.body.linearDamping = 1;
    //         p.body.collideWorldBounds = true;
    //
    //         game.camera.follow(p);
    //
    //         enemies = game.add.group();
    //         game.physics.enable(enemies);
    //         enemies.enableBody = true;
    //         enemies.physicsBodyType = Phaser.Physics.ARCADE;
    //         enemies.createMultiple(5, 'bug1');
    //         enemies.setAll('anchor.x', 0.5);
    //         enemies.setAll('anchor.y', 0.5);
    //         enemies.forEach(function(enemy) {
    //             addEnemyEmitterTrail(enemy);
    //         });
    //         game.time.events.add(1000, launchGreenEnemy);
    //         weapon = game.add.weapon(1, 'bullet');
    //
    //         weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    //
    //         //weapon.bulletAngleVariance = 3;
    //         weapon.bulletLifespan = 500;
    //         weapon.bulletSpeed = 500;
    //         weapon.fireRate = 1000;
    //         weapon.multiFire = true;
    //         weapon.fireAngle = 270;
    //         weapon.bulletGravity.y = 800;
    //         weapon.trackSprite(p, 16, 20);
    //
    //         cursors = game.input.keyboard.createCursorKeys();
    //         fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
    //     },
    //
    //     update: function() {
    //
    //         game.physics.arcade.collide(p, layer);
    //         game.physics.arcade.collide(enemies, layer);
    //         game.physics.arcade.collide(weapon, layer);
    //         p.body.velocity.x = 0;
    //         weapon.fireAngle = 355;
    //         //  Check collisions
    //         game.physics.arcade.overlap(p, enemies, shipCollide, null, this);
    //         game.physics.arcade.overlap(enemies, weapon.bullets, hitEnemy, null, this);
    //         if (cursors.up.isDown) {
	// 			if(state != 'ggJump'){
	// 				     p.loadTexture('ggJump',0,false);
	// 				          state='ggJump';
	// 				}
    //             if (p.body.onFloor()) {
    //                 p.body.velocity.y = -200;
    //             }
    //         }
    //         if (cursors.left.isDown) {
	// 			          if(state != 'ggRun'){
	// 				               p.loadTexture('ggRun',0,false);
	// 				                    state='ggRun';
	// 			          }
    //             p.body.velocity.x = -150;
    //             if (fireButton.isDown) {
    //                 weapon.fireAngle = -175;
    //                 weapon.fire();
    //             }
    //         }
    //         else if (cursors.right.isDown) {
	// 			          if(state != 'ggRun'){
	// 				               p.loadTexture('ggRun',0,false);
	// 				                    state='ggRun';
	// 				        }
    //             p.body.velocity.x = 150;
    //             if (fireButton.isDown) {
    //                 weapon.fireAngle = 355;
    //                 weapon.fire();
    //             }
    //         }
    //
    //         if (fireButton.isDown) {
    //             weapon.fire();
    //         }
    //     },
    //
    //     render: function() {
    //
    //         // game.debug.body(p);
    //         game.debug.bodyInfo(p, 32, 320);
    //
    //     }
    // }
    //
    //
    // function shipCollide(player, enemy) {
    //     enemy.kill();
    //
    //     player.damage(enemy.damageAmount);
    //     this.hurtPlayer(player);
    // }
    //
    // function hitEnemy(enemy, bullet) {
    //     enemy.kill();
    //     bullet.kill()
    // }
    //
    // function addEnemyEmitterTrail(enemy) {
    //     var enemyTrail = game.add.emitter(enemy.x, p.y - 10, 100);
    //     enemyTrail.width = 10;
    //     enemyTrail.setXSpeed(20, -20);
    //     enemy.trail = enemyTrail;
    // }
    //
    // function launchGreenEnemy() {
    //     var MIN_ENEMY_SPACING = 30;
    //     var MAX_ENEMY_SPACING = 300;
    //     var ENEMY_SPEED = 30;
    //
    //     var enemy = enemies.getFirstExists(false);
    //     if (enemy) {
    //         enemy.reset(game.rnd.integerInRange(0, game.width), -20);
    //         enemy.body.velocity.x = game.rnd.integerInRange(-300, 300);
    //         //enemy.body.velocity.y = ENEMY_SPEED;
    //         enemy.body.drag.x = 100;
    //
    //         enemy.trail.start(false, 800, 1);
    //
    //         //  Update function for each enemy ship to update rotation etc
    //         enemy.update = function() {
    //             //enemy.angle = 180 - game.math.radToDeg(Math.atan2(enemy.body.velocity.x, enemy.body.velocity.y));
    //
    //             enemy.trail.x = enemy.x;
    //             //enemy.trail.y = enemy.y -10;
    //
    //             //  Kill enemies once they go off screen
    //             if (enemy.x > game.width + 200) {
    //                 enemy.kill();
    //             }
    //         }
    //     }
    //
    //     //  Send another enemy soon
    //     greenEnemyLaunchTimer = game.time.events.add(game.rnd.integerInRange(MIN_ENEMY_SPACING, MAX_ENEMY_SPACING), launchGreenEnemy);
    // }

}

},{"./briefingScreen.js":1,"./gameoverScreen.js":4,"./mission.js":7}],4:[function(require,module,exports){

/**
 * module - game over screen
 *
 * @param  {Phaser.Game} game Phaser Game object
 * @return {object}      screen descriptor
 */
module.exports = function(game) {
    return {
        preload: function() {
            game.load.image('general', 'assets/general.png');
        },

        create: function() {
            game.stage.backgroundColor = '#000';

            this.portrait = game.add.image(game.camera.view.width / 2, 50, 'general');
            this.portrait.anchor.set(0.5, 0);

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

        update: function() {

        },

        start: function() {
            game.state.start('beginMission');
        },

        render: function() {

        },
    };

};

},{}],5:[function(require,module,exports){

var StateMachine = require('./lib/state-machine.js');

/**
 * GameActor - abstract game actor
 *
 * @param  {Phaser.Game} game    Phaser.Game object
 * @param  {number} x       x position
 * @param  {number} y       y position
 * @return {void}
 */
function Invoker(game, x, y) {
    // Invoker object internal state
    this._state = {
        direction: 0,
        speed: this._getSpeed(),
        fsm: null,
        timer: 100,
    };

    Phaser.Sprite.call(this, game, x, y, 'monster_invoker');
    this.anchor.set(0.5, 1.0);

    // setup physic properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;

    // setup animations
    this._setupAnimations();

    // setup initial state and FSM
    this._setupState();

}

// inherit from Phaser.Sprite
Invoker.prototype = Object.create(Phaser.Sprite.prototype);
Invoker.prototype.constructor = Invoker;

// Invoker constants
Invoker.prototype.CONST = {
    SPEED: 40,
    SPEED_VARIATION: 20,
    BODIES: {
        'move': {
            'default': { width: 27, height: 36 },
        },
        'idle': {
            'default': { width: 27, height: 36 },
        },
        'dmg': {
            'default': { width: 33, height: 34 },
        },
        'roar': {
            'default': { width: 29, height: 36 },
        },
    },
};

Invoker.prototype._setupAnimations = function() {
    this.animations.add('move', [5, 6, 7, 8, 9], this._state.speed / 4, true);
    this.animations.add('idle', [5]);
    this.animations.add('dmg', [0, 1, 2, 3, 4], 12);
    this.animations.add('roar', [9, 9, 10, 11, 10, 11, 10, 11, 10, 11, 10, 9], 18);
    this.animations.play('idle');
}

Invoker.prototype._setupState = function() {
    this._state.direction = Math.random() < 0.5 ? -1 : 1;
    let monster = this;
    this._state.fsm = new StateMachine({

        init: 'idle',

        transitions: [
            { name: 'move', from: 'idle', to: 'move' },
            { name: 'stop', from: 'move', to: 'idle' },
        ],

        methods: {
            onMove: function() {
                monster._onMove();
            },
            onStop: function() {
                monster._onStop();
            },
            update: function() {
                monster._updateState();
            },
        },

    });
};

Invoker.prototype.update = function() {
    this._state.fsm.update();
    this._setBody();

    if (this._state.timer !== null) {
        if (!this._state.timer) {
            this._decideNewAction();
        } else {
            this._state.timer--;
        };
    }
};

Invoker.prototype._setBody = function() {
    let ani = this.animations.name;
    let sizes = this.CONST.BODIES[ani];
    let key = this.animations.frame;
    var size = sizes[key] ? sizes[key] : sizes['default'];
    this.body.setSize(size.width, size.height);
};

Invoker.prototype._getSpeed = function() {
    return this.CONST.SPEED + Math.random() * this.CONST.SPEED_VARIATION;
};

Invoker.prototype._decideNewAction = function() {
    let fsm = this._state.fsm;
    let curState = fsm.state;
    if (curState === 'idle') {
        fsm.move();
        this._state.timer = 400;
    } else if (curState === 'move') {
        fsm.stop();
        this._state.timer = 100;
    };
};

Invoker.prototype._onMove = function() {
    this.animations.play('move');
    this._state.speed = this._getSpeed();
};

Invoker.prototype._onStop = function() {
    this.animations.play('idle');
    this.body.velocity.x = 0;
};

Invoker.prototype._updateState = function() {
    let fsm = this._state.fsm;
    if (!fsm) {
        return;
    }

    let state = fsm.state;
    if (state === 'idle') {
        this._updateIdle();
    } else if (state === 'move') {
        this._updateRun();
    } else {
        console.log('No handler for state ${state}');
    };
};

Invoker.prototype._updateIdle = function() {
    this.scale.x = this._state.direction;
};

Invoker.prototype._updateRun = function() {
    if (this.body.blocked.left) {
        this._state.direction = 1;
    } else if (this.body.blocked.right) {
        this._state.direction = -1;
    };

    this.scale.x = this._state.direction;
    this.body.velocity.x = this._state.direction * this._state.speed;
};

module.exports = Invoker

},{"./lib/state-machine.js":6}],6:[function(require,module,exports){
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("StateMachine", [], factory);
	else if(typeof exports === 'object')
		exports["StateMachine"] = factory();
	else
		root["StateMachine"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function(target, sources) {
  var n, source, key;
  for(n = 1 ; n < arguments.length ; n++) {
    source = arguments[n];
    for(key in source) {
      if (source.hasOwnProperty(key))
        target[key] = source[key];
    }
  }
  return target;
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


//-------------------------------------------------------------------------------------------------

var mixin = __webpack_require__(0);

//-------------------------------------------------------------------------------------------------

module.exports = {

  build: function(target, config) {
    var n, max, plugin, plugins = config.plugins;
    for(n = 0, max = plugins.length ; n < max ; n++) {
      plugin = plugins[n];
      if (plugin.methods)
        mixin(target, plugin.methods);
      if (plugin.properties)
        Object.defineProperties(target, plugin.properties);
    }
  },

  hook: function(fsm, name, additional) {
    var n, max, method, plugin,
        plugins = fsm.config.plugins,
        args    = [fsm.context];

    if (additional)
      args = args.concat(additional)

    for(n = 0, max = plugins.length ; n < max ; n++) {
      plugin = plugins[n]
      method = plugins[n][name]
      if (method)
        method.apply(plugin, args);
    }
  }

}

//-------------------------------------------------------------------------------------------------


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


//-------------------------------------------------------------------------------------------------

function camelize(label) {

  if (label.length === 0)
    return label;

  var n, result, word, words = label.split(/[_-]/);

  // single word with first character already lowercase, return untouched
  if ((words.length === 1) && (words[0][0].toLowerCase() === words[0][0]))
    return label;

  result = words[0].toLowerCase();
  for(n = 1 ; n < words.length ; n++) {
    result = result + words[n].charAt(0).toUpperCase() + words[n].substring(1).toLowerCase();
  }

  return result;
}

//-------------------------------------------------------------------------------------------------

camelize.prepended = function(prepend, label) {
  label = camelize(label);
  return prepend + label[0].toUpperCase() + label.substring(1);
}

//-------------------------------------------------------------------------------------------------

module.exports = camelize;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


//-------------------------------------------------------------------------------------------------

var mixin    = __webpack_require__(0),
    camelize = __webpack_require__(2);

//-------------------------------------------------------------------------------------------------

function Config(options, StateMachine) {

  options = options || {};

  this.options     = options; // preserving original options can be useful (e.g visualize plugin)
  this.defaults    = StateMachine.defaults;
  this.states      = [];
  this.transitions = [];
  this.map         = {};
  this.lifecycle   = this.configureLifecycle();
  this.init        = this.configureInitTransition(options.init);
  this.data        = this.configureData(options.data);
  this.methods     = this.configureMethods(options.methods);

  this.map[this.defaults.wildcard] = {};

  this.configureTransitions(options.transitions || []);

  this.plugins = this.configurePlugins(options.plugins, StateMachine.plugin);

}

//-------------------------------------------------------------------------------------------------

mixin(Config.prototype, {

  addState: function(name) {
    if (!this.map[name]) {
      this.states.push(name);
      this.addStateLifecycleNames(name);
      this.map[name] = {};
    }
  },

  addStateLifecycleNames: function(name) {
    this.lifecycle.onEnter[name] = camelize.prepended('onEnter', name);
    this.lifecycle.onLeave[name] = camelize.prepended('onLeave', name);
    this.lifecycle.on[name]      = camelize.prepended('on',      name);
  },

  addTransition: function(name) {
    if (this.transitions.indexOf(name) < 0) {
      this.transitions.push(name);
      this.addTransitionLifecycleNames(name);
    }
  },

  addTransitionLifecycleNames: function(name) {
    this.lifecycle.onBefore[name] = camelize.prepended('onBefore', name);
    this.lifecycle.onAfter[name]  = camelize.prepended('onAfter',  name);
    this.lifecycle.on[name]       = camelize.prepended('on',       name);
  },

  mapTransition: function(transition) {
    var name = transition.name,
        from = transition.from,
        to   = transition.to;
    this.addState(from);
    if (typeof to !== 'function')
      this.addState(to);
    this.addTransition(name);
    this.map[from][name] = transition;
    return transition;
  },

  configureLifecycle: function() {
    return {
      onBefore: { transition: 'onBeforeTransition' },
      onAfter:  { transition: 'onAfterTransition'  },
      onEnter:  { state:      'onEnterState'       },
      onLeave:  { state:      'onLeaveState'       },
      on:       { transition: 'onTransition'       }
    };
  },

  configureInitTransition: function(init) {
    if (typeof init === 'string') {
      return this.mapTransition(mixin({}, this.defaults.init, { to: init, active: true }));
    }
    else if (typeof init === 'object') {
      return this.mapTransition(mixin({}, this.defaults.init, init, { active: true }));
    }
    else {
      this.addState(this.defaults.init.from);
      return this.defaults.init;
    }
  },

  configureData: function(data) {
    if (typeof data === 'function')
      return data;
    else if (typeof data === 'object')
      return function() { return data; }
    else
      return function() { return {};  }
  },

  configureMethods: function(methods) {
    return methods || {};
  },

  configurePlugins: function(plugins, builtin) {
    plugins = plugins || [];
    var n, max, plugin;
    for(n = 0, max = plugins.length ; n < max ; n++) {
      plugin = plugins[n];
      if (typeof plugin === 'function')
        plugins[n] = plugin = plugin()
      if (plugin.configure)
        plugin.configure(this);
    }
    return plugins
  },

  configureTransitions: function(transitions) {
    var i, n, transition, from, to, wildcard = this.defaults.wildcard;
    for(n = 0 ; n < transitions.length ; n++) {
      transition = transitions[n];
      from  = Array.isArray(transition.from) ? transition.from : [transition.from || wildcard]
      to    = transition.to || wildcard;
      for(i = 0 ; i < from.length ; i++) {
        this.mapTransition({ name: transition.name, from: from[i], to: to });
      }
    }
  },

  transitionFor: function(state, transition) {
    var wildcard = this.defaults.wildcard;
    return this.map[state][transition] ||
           this.map[wildcard][transition];
  },

  transitionsFor: function(state) {
    var wildcard = this.defaults.wildcard;
    return Object.keys(this.map[state]).concat(Object.keys(this.map[wildcard]));
  },

  allStates: function() {
    return this.states;
  },

  allTransitions: function() {
    return this.transitions;
  }

});

//-------------------------------------------------------------------------------------------------

module.exports = Config;

//-------------------------------------------------------------------------------------------------


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {


var mixin      = __webpack_require__(0),
    Exception  = __webpack_require__(6),
    plugin     = __webpack_require__(1),
    UNOBSERVED = [ null, [] ];

//-------------------------------------------------------------------------------------------------

function JSM(context, config) {
  this.context   = context;
  this.config    = config;
  this.state     = config.init.from;
  this.observers = [context];
}

//-------------------------------------------------------------------------------------------------

mixin(JSM.prototype, {

  init: function(args) {
    mixin(this.context, this.config.data.apply(this.context, args));
    plugin.hook(this, 'init');
    if (this.config.init.active)
      return this.fire(this.config.init.name, []);
  },

  is: function(state) {
    return Array.isArray(state) ? (state.indexOf(this.state) >= 0) : (this.state === state);
  },

  isPending: function() {
    return this.pending;
  },

  can: function(transition) {
    return !this.isPending() && !!this.seek(transition);
  },

  cannot: function(transition) {
    return !this.can(transition);
  },

  allStates: function() {
    return this.config.allStates();
  },

  allTransitions: function() {
    return this.config.allTransitions();
  },

  transitions: function() {
    return this.config.transitionsFor(this.state);
  },

  seek: function(transition, args) {
    var wildcard = this.config.defaults.wildcard,
        entry    = this.config.transitionFor(this.state, transition),
        to       = entry && entry.to;
    if (typeof to === 'function')
      return to.apply(this.context, args);
    else if (to === wildcard)
      return this.state
    else
      return to
  },

  fire: function(transition, args) {
    return this.transit(transition, this.state, this.seek(transition, args), args);
  },

  transit: function(transition, from, to, args) {

    var lifecycle = this.config.lifecycle,
        changed   = this.config.options.observeUnchangedState || (from !== to);

    if (!to)
      return this.context.onInvalidTransition(transition, from, to);

    if (this.isPending())
      return this.context.onPendingTransition(transition, from, to);

    this.config.addState(to);  // might need to add this state if it's unknown (e.g. conditional transition or goto)

    this.beginTransit();

    args.unshift({             // this context will be passed to each lifecycle event observer
      transition: transition,
      from:       from,
      to:         to,
      fsm:        this.context
    });

    return this.observeEvents([
                this.observersForEvent(lifecycle.onBefore.transition),
                this.observersForEvent(lifecycle.onBefore[transition]),
      changed ? this.observersForEvent(lifecycle.onLeave.state) : UNOBSERVED,
      changed ? this.observersForEvent(lifecycle.onLeave[from]) : UNOBSERVED,
                this.observersForEvent(lifecycle.on.transition),
      changed ? [ 'doTransit', [ this ] ]                       : UNOBSERVED,
      changed ? this.observersForEvent(lifecycle.onEnter.state) : UNOBSERVED,
      changed ? this.observersForEvent(lifecycle.onEnter[to])   : UNOBSERVED,
      changed ? this.observersForEvent(lifecycle.on[to])        : UNOBSERVED,
                this.observersForEvent(lifecycle.onAfter.transition),
                this.observersForEvent(lifecycle.onAfter[transition]),
                this.observersForEvent(lifecycle.on[transition])
    ], args);
  },

  beginTransit: function()          { this.pending = true;                 },
  endTransit:   function(result)    { this.pending = false; return result; },
  failTransit:  function(result)    { this.pending = false; throw result;  },
  doTransit:    function(lifecycle) { this.state = lifecycle.to;           },

  observe: function(args) {
    if (args.length === 2) {
      var observer = {};
      observer[args[0]] = args[1];
      this.observers.push(observer);
    }
    else {
      this.observers.push(args[0]);
    }
  },

  observersForEvent: function(event) { // TODO: this could be cached
    var n = 0, max = this.observers.length, observer, result = [];
    for( ; n < max ; n++) {
      observer = this.observers[n];
      if (observer[event])
        result.push(observer);
    }
    return [ event, result, true ]
  },

  observeEvents: function(events, args, previousEvent, previousResult) {
    if (events.length === 0) {
      return this.endTransit(previousResult === undefined ? true : previousResult);
    }

    var event     = events[0][0],
        observers = events[0][1],
        pluggable = events[0][2];

    args[0].event = event;
    if (event && pluggable && event !== previousEvent)
      plugin.hook(this, 'lifecycle', args);

    if (observers.length === 0) {
      events.shift();
      return this.observeEvents(events, args, event, previousResult);
    }
    else {
      var observer = observers.shift(),
          result = observer[event].apply(observer, args);
      if (result && typeof result.then === 'function') {
        return result.then(this.observeEvents.bind(this, events, args, event))
                     .catch(this.failTransit.bind(this))
      }
      else if (result === false) {
        return this.endTransit(false);
      }
      else {
        return this.observeEvents(events, args, event, result);
      }
    }
  },

  onInvalidTransition: function(transition, from, to) {
    throw new Exception("transition is invalid in current state", transition, from, to, this.state);
  },

  onPendingTransition: function(transition, from, to) {
    throw new Exception("transition is invalid while previous transition is still in progress", transition, from, to, this.state);
  }

});

//-------------------------------------------------------------------------------------------------

module.exports = JSM;

//-------------------------------------------------------------------------------------------------


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


//-----------------------------------------------------------------------------------------------

var mixin    = __webpack_require__(0),
    camelize = __webpack_require__(2),
    plugin   = __webpack_require__(1),
    Config   = __webpack_require__(3),
    JSM      = __webpack_require__(4);

//-----------------------------------------------------------------------------------------------

var PublicMethods = {
  is:                  function(state)       { return this._fsm.is(state)                                     },
  can:                 function(transition)  { return this._fsm.can(transition)                               },
  cannot:              function(transition)  { return this._fsm.cannot(transition)                            },
  observe:             function()            { return this._fsm.observe(arguments)                            },
  transitions:         function()            { return this._fsm.transitions()                                 },
  allTransitions:      function()            { return this._fsm.allTransitions()                              },
  allStates:           function()            { return this._fsm.allStates()                                   },
  onInvalidTransition: function(t, from, to) { return this._fsm.onInvalidTransition(t, from, to)              },
  onPendingTransition: function(t, from, to) { return this._fsm.onPendingTransition(t, from, to)              },
}

var PublicProperties = {
  state: {
    configurable: false,
    enumerable:   true,
    get: function() {
      return this._fsm.state;
    },
    set: function(state) {
      throw Error('use transitions to change state')
    }
  }
}

//-----------------------------------------------------------------------------------------------

function StateMachine(options) {
  return apply(this || {}, options);
}

function factory() {
  var cstor, options;
  if (typeof arguments[0] === 'function') {
    cstor   = arguments[0];
    options = arguments[1] || {};
  }
  else {
    cstor   = function() { this._fsm.apply(this, arguments) };
    options = arguments[0] || {};
  }
  var config = new Config(options, StateMachine);
  build(cstor.prototype, config);
  cstor.prototype._fsm.config = config; // convenience access to shared config without needing an instance
  return cstor;
}

//-------------------------------------------------------------------------------------------------

function apply(instance, options) {
  var config = new Config(options, StateMachine);
  build(instance, config);
  instance._fsm();
  return instance;
}

function build(target, config) {
  if ((typeof target !== 'object') || Array.isArray(target))
    throw Error('StateMachine can only be applied to objects');
  plugin.build(target, config);
  Object.defineProperties(target, PublicProperties);
  mixin(target, PublicMethods);
  mixin(target, config.methods);
  config.allTransitions().forEach(function(transition) {
    target[camelize(transition)] = function() {
      return this._fsm.fire(transition, [].slice.call(arguments))
    }
  });
  target._fsm = function() {
    this._fsm = new JSM(this, config);
    this._fsm.init(arguments);
  }
}

//-----------------------------------------------------------------------------------------------

StateMachine.version  = '3.0.1';
StateMachine.factory  = factory;
StateMachine.apply    = apply;
StateMachine.defaults = {
  wildcard: '*',
  init: {
    name: 'init',
    from: 'none'
  }
}

//===============================================================================================

module.exports = StateMachine;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function(message, transition, from, to, current) {
  this.message    = message;
  this.transition = transition;
  this.from       = from;
  this.to         = to;
  this.current    = current;
}


/***/ })
/******/ ]);
});

},{}],7:[function(require,module,exports){

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

},{"./bug.js":2,"./invoker.js":5,"./player.js":8}],8:[function(require,module,exports){

var StateMachine = require('./lib/state-machine.js');

/**
 * Player - game player
 *
 * @param  {Phaser.Game} game    Phaser.Game object
 * @param  {number} x       x position
 * @param  {number} y       y position
 * @return {void}
 */
function Player(game, x, y) {
    // Player internal state
    this._state = {
        direction: 0,
        speed: 80,
        jumpVelocity: 200,
        isJumped: false,
        fsm: null,
        timer: null,
    };

    Phaser.Sprite.call(this, game, x, y, 'programmer');
    this.anchor.set(this.CONST.ANCHOR_X, this.CONST.ANCHOR_Y);

    // setup physic properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;

    // setup animations
    this._setupAnimations();

    // setup initial state and FSM
    this._setupState();

    this._cursors = game.input.keyboard.createCursorKeys();
}

// inherit from Phaser.Sprite
Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

// Bug constants
Player.prototype.CONST = {
    SPEED: 80,
    JUMP_VELOCITY: 200,
    SPEED_VARIATION: 0,
    ANCHOR_X: 0.5,
    ANCHOR_Y: 1.0,
    BODIES: {
        'walk': {
            'default': { width: 36, height: 98 },
        },
        'jump': {
            'default': { width: 36 , height: 101 },
        },
        'fall' : {
            'default': { width: 36, height: 98},
        },
        'idle': {
            'default': { width: 36, height: 98 },
        },
    },
};

Player.prototype._setupAnimations = function() {
    this.animations.add('walk', [14, 12], 4, true);
    this.animations.add('idle', [6]);
    this.animations.add('jump', [3]);
    this.animations.add('fall', [4]);
    // this.animations.add('dmg', [0, 1, 2, 3]);
    // this.animations.add('lose', [4, 5, 6, 7]);
    // this.animations.add('win', [13, 14, 15]);
    // this.animations.add('fall', [14]);
    // this.animations.add('landing', [14, 13, 15, 13]);
    this.animations.play('idle');
}

Player.prototype._setupState = function() {
    this._state.direction = 1;
    let player = this;
    this._state.fsm = new StateMachine({

        init: 'user-controlled',

        transitions: [
        ],

        methods: {
            update: function() {
                player._updateState();
            },
        },

    });
};

Player.prototype.update = function() {
    this._state.fsm.update();
    this._setBody();


    if (this._state.isJumped && this.body.blocked.down && this.body.deltaY() > 0 ) {
        this._state.isJumped = false;
    };

    if (this._state.timer !== null) {
        if (!this._state.timer) {
            this._decideNewAction();
        } else {
            this._state.timer--;
        };
    }
};

Player.prototype._setBody = function() {
    let ani = this.animations.name;
    var frame = this.animations.currentFrame;
    let sizes = this.CONST.BODIES[ani];
    let key = this.animations.frame;
    var size = sizes[key] ? sizes[key] : sizes['default'];
    let ox = (frame.width - size.width) * this.CONST.ANCHOR_X;
    let oy = (frame.height - size.height) * this.CONST.ANCHOR_Y;
    this.body.setSize(size.width, size.height, ox, oy);
};

Player.prototype._getSpeed = function() {
    return this.CONST.SPEED + Math.random() * this.CONST.SPEED_VARIATION;
};

Player.prototype._decideNewAction = function() {
    let fsm = this._state.fsm;
    let curState = fsm.state;
    if (curState === 'user-controlled') {
    };
};

Player.prototype._updateState = function() {
    let fsm = this._state.fsm;
    if (!fsm) {
        return;
    }

    let state = fsm.state;
    if (state === 'user-controlled') {
        this._updateUserControlled();
    } else {
        console.log('No handler for state ${state}');
    };
};

Player.prototype._updateUserControlled = function() {
    if (!this._cursors) return;
    let cursor = this._cursors;

    if (cursor.up.isDown) {
        if (this.body.onFloor()) {
            this.body.velocity.y = -this.CONST.JUMP_VELOCITY;
            this._state.isJumped = true;
        };
    };

    if (cursor.left.isDown) {
        if (!this.body.blocked.left) {
            this.body.velocity.x = -this._getSpeed();
        };
        this._state.direction = -1;
    }
    else if (cursor.right.isDown) {
        if (!this.body.blocked.right) {
            this.body.velocity.x = this._getSpeed();
        };
        this._state.direction = 1;
    } else {
        this.body.velocity.x = 0;
    };

    this.scale.x = this._state.direction;

    let animName = this._getAnimation();
    if (animName != this.animations.name) {
        this.animations.play(animName);
    };
};

Player.prototype._getAnimation = function() {
    let velY = Math.round(this.body.velocity.y);
    if (this._state.isJumped) {
        return 'jump';
    } else if (this.body.deltaY() > 0.4) {
        return 'fall';
    } else if (this.body.deltaX() != 0) {
        return 'walk';
    } else {
        return 'idle';
    }
};

module.exports = Player

},{"./lib/state-machine.js":6}]},{},[3]);
