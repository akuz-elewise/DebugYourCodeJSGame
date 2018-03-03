
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
