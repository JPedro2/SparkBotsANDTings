/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                                 ____
                                /\  _`\
                                \ \ \/\_\     __      ____     __   __  __
                                 \ \ \/_/_  /'__`\   /',__\  /'__`\/\ \/\ \
                                  \ \ \L\ \/\ \L\.\_/\__, `\/\  __/\ \ \_\ \
                                   \ \____/\ \__/.\_\/\____/\ \____\\/`____ \
                                    \/___/  \/__/\/_/\/___/  \/____/ `/___/> \
                                                                        /\___/
                                                                        \/__/

Run CASEY from the command line:
    access_token=<CASEY ACCESS TOKEN> public_address=<MY PUBLIC HTTPS URL> node bot.js

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

if (!process.env.access_token) {
    console.log('Error: Specify a Cisco Spark access_token in environment.');
    usage_tip();
    process.exit(1);
}

if (!process.env.public_address) {
    console.log('Error: Specify an SSL-enabled URL as this bot\'s public_address in environment.');
    usage_tip();
    process.exit(1);
}

var Botkit = require('botkit');
var debug = require('debug')('botkit:main');

// Create the Botkit controller, which controls all instances of the bot.
var controller = Botkit.sparkbot({
    // debug: true,
    public_address: process.env.public_address,
    ciscospark_access_token: process.env.access_token,
    studio_token: process.env.studio_token, // get one from studio.botkit.ai to enable content management, stats, message console and more
    secret: process.env.secret, // this is an RECOMMENDED but optional setting that enables validation of incoming webhooks
    webhook_name: 'Casey Webhook',
    studio_command_uri: process.env.studio_command_uri,
});

// Set up an Express-powered webserver to expose oauth and webhook endpoints
var webserver = require(__dirname + '/components/express_webserver.js')(controller);

// Tell Cisco Spark to start sending events to this application
require(__dirname + '/components/subscribe_events.js')(controller);

// Enable Dashbot.io plugin
require(__dirname + '/components/plugin_dashbot.js')(controller);

// Enable Dashbot.io plugin
// require(__dirname + '/components/email_api.js')(controller);

var normalizedPath = require("path").join(__dirname, "skills");
require("fs").readdirSync(normalizedPath).forEach(function(file) {
  require("./skills/" + file)(controller);
});


// This captures and evaluates any message sent to Casey as a DM
// or in the form "@bot message" and passes it to Botkit Studio
// to evaluate for trigger words and patterns.
// If a trigger is matched, the conversation will automatically fire!
if (process.env.studio_token) {
    controller.on('direct_message,direct_mention', function(bot, message) {
        if (message.text) {
            controller.studio.runTrigger(bot, message.text, message.user, message.channel).then(function(convo) {
                if (!convo) {
                    // no trigger was matched
                    // If you want your bot to respond to every message,
                    // define a 'fallback' script in Botkit Studio
                    // and uncomment the line below.
                    controller.studio.run(bot, 'fallback', message.user, message.channel);
                } else {
                    // set variables here that are needed for EVERY script
                    // use controller.studio.before('script') to set variables specific to a script
                    convo.setVar('current_time', new Date());
                }
            }).catch(function(err) {
                if (err) {
                    bot.reply(message, 'I experienced an error with a request to Botkit Studio: ' + err);
                    debug('Botkit Studio: ', err);
                }
            });
        }
    });
} else {
    console.log('~~~~~~~~~~');
    console.log('NOTE: Botkit Studio functionality has not been enabled');
    console.log('To enable, pass in a studio_token parameter with a token from https://studio.botkit.ai/');
}