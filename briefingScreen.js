
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
