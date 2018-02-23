
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
