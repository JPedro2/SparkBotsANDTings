module.exports = function(controller) {

// add Casey to a space
  controller.on('bot_space_join', function(bot, message) {
    bot.reply(message, 'My name is Casey 🤖 pleasure to meet you.'
                       + ' I will be helping you raise cases with GVE.       \n');

  });

// talk to Casey directly
  controller.on('user_space_join', function(bot, message) {
    bot.reply(message, 'Hello, ' + message.raw_message.data.personDisplayName
                       + '. My name is Casey 🤖 pleasure to meet you.'
                       + ' I will be helping you raise cases with GVE.       \n');
  });
};