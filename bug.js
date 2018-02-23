
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
