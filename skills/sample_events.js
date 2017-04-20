module.exports = function(controller) {


  controller.on('bot_space_join', function(bot, message) {

    bot.reply(message, 'Hi, I am a Casey and I will be helping you raising Cases with GVE. \b How may I help you?');

  });

  controller.on('user_space_join', function(bot, message) {

    bot.reply(message, 'Hello, ' + message.original_message.data.personDisplayName + 'my name is Casey and I will be helping you raising Cases with GVE. \b How may I help you?');

  });


};
