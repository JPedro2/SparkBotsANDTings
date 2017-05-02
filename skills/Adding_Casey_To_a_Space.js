module.exports = function(controller) {

  controller.on('bot_space_join', function(bot, message) {
    bot.reply(message, 'Hi, my name is Casey 🤖 and I will be helping you raising Cases with GVE.       \n'
                        + 'How may I help you?');

  });

  controller.on('user_room_join', function(bot, message) {
      bot.reply(message, 'Hi, my name is Casey 🤖 and I will be helping you raising Cases with GVE.       \n'
                          + 'How may I help you?');
  });
};