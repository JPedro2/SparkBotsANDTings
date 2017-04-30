/*

This module demonstrates how Casey helps the requester to raise a Case with GVE.
Casey can be used in a direct interaction OR in a group chat by using direct mention (@Casey)

There are 2 mains parts:

    1. There is a webhook every time Casey hears someone saying case - e.g. "I would like to raise a Case"
        1.1. Casey then ask a few clarification questions

    2. An email is sent to GVE so that the case handling team is able to open the case on behalf of the requester
        2.1. This only works internally. The user will need to be in the internal network or using VPN

*/

var Subject;
var CustomerName;
var DueDate;
var DealID;
var TechInvolved;
var Description;

module.exports = function(controller) {

    controller.hears(['case'] , 'direct_message,direct_mention', function(bot, message) {
      bot.startConversation(message, askSubject);
    });

    askSubject = function(response, convo, message, bot) {
        convo.ask("Can you please provide a brief Subject?      \n"
                  + "Example subjects: Contact Center BoM, Prime Infrastructure Info, Customer WebEx Meeting Requested",
                  function(response, convo, message) {
            convo.say("Got it, Thank you.");
            Subject = response.text;
            askCustomerName(response, convo);
            convo.next();
      });
    }

        askCustomerName = function(response, convo, message, bot) {
            convo.ask("Can you please provide the customer name?",
                      function(response, convo, message) {
                convo.say("Noted, Thank you.");
                CustomerName = response.text;
                askDueDate(response, convo);
                convo.next();
          });
        }

    askDueDate = function(response, convo) {
      convo.ask("Please provide us the requested due date", function(response, convo) {
        convo.say("Great!")
        DueDate = response.text;
        askDealID(response, convo);
        convo.next();
      });
    }

    askDealID = function(bot, response, convo, message) {
     convo.ask("Please provide us the deal ID, if you have one", function(response, convo) {
       convo.say("Thank you!")
       DealID = response.text;
       askTechInvolved(response, convo);
       convo.next();
     });
    }

    askTechInvolved = function(response, convo) {
     convo.ask("What are the technologies involved?", function(response, convo) {
       convo.say("Brilliant!")
       TechInvolved = response.text;
       askDescription(response, convo);
       convo.next();
     });
    }

    askDescription = function(response, convo) {
      convo.ask("Can you please provide us a description?      \n"
                + "Please give us as much information as possible about your customer and what help you need.",
                     function(response, convo) {
        convo.say("Thank you. That's it, all done for you.
                + "Your case will now be raised with SalesForce and you will receive an email with your case ID.     \n"
                + "If you would like a demo or a call with your customer,"
                + "please wait to schedule it until a VSE is assigned to your case.");
        Description = response.text;
        //DisplaySummary(response, convo);
        convo.next();
      });
    }

    /*
    DisplaySummary = function(response, convo){
        convo.say("Below is the email that will be sent out to the GVE team that will raise the case for you.    \n\n");
        convo.say("Dear Sir/Madam,      \n"
                  +'The user ' +UserRequester+ ' would like to raise a case with GVE.'
                  +'Please find all the details below:      \n\n'
                  +'Brief Subject:' +Subject+ '      \n'
                  +'Customer Name: ' +CustomerName+ '      \n'
                  +'Requested Due Date: ' +DueDate+ '      \n'
                  +'Deal ID: ' +DealID+ '      \n>'
                  +'Technologies Involved: ' +TechInvolved+ '      \n'
                  +'Description: ' +Description+ '      \n\n>'
                  +'Please send a confirmation email to ' +UserRequester+ ' with the case ID.      \n'
                  +'If you have any questions please contact the requester directly using the email above.      \n\n'
                  +'Best Regards,      \n'
                  +'Casey'
        convo.next();
      });
    }*/

    controller.hears(['email'], 'direct_message,direct_mention', function(bot, message) {
        var UserRequester = message.user;

        var mail = require("nodemailer").mail;

        mail({
            from: "iknain@cisco.com", // sender address
            //to: "peolivei@cisco.com", // list of receivers
            //to: "peolivei@cisco.com", // list of receivers
            cc: "UserRequester",        // always CC the requester so that he can keep a copy of the initial request
            to: "peolivei@cisco.com , iknain@cisco.com , pflorido@cisco.com", // list of receivers
            subject: "Raise a case with GVE", // Subject line
            //text: "", // plaintext body
            html: 'Dear Sir/Madam,<br>'
                  +'The user ' +UserRequester+ ' would like to raise a case with GVE.
                  +'Please find all the details below:<br><br>'
                  +'<b>Brief Subject:</b> ' +Subject+ '<br>'
                  +'<b>Customer Name:</b> ' +CustomerName+ '<br>'
                  +'<b>Requested Due Date:</b> ' +DueDate+ '<br>'
                  +'<b>Deal ID:</b> ' +DealID+ '<br>'
                  +'<b>Technologies Involved:</b> ' +TechInvolved+ '<br>'
                  +'<b>Description:</b> ' +Description+ '<br><br>'
                  +'Please send a confirmation email to ' +UserRequester+ ' with the case ID.<br>'
                  +'If you have any questions please contact the requester directly using the email above.<br><br>'
                  +'Best Regards,<br>'
                  +'Casey'
                   //'Tips:%0D%0A
                   //•Example subjects: Contact Center BoM, Prime Infrastructure Info, Customer WebEx Meeting Requested.%0D%0A
                   //•Please give us as much information as possible about your customer and what help you need.%0D%0A
                   //•Don’t forget to attach documents if needed.%0D%0A
                   //•If you would like a demo or call with your customer, please wait to schedule until a VSE is assigned." "
                   //"<b>Hello world ✔</b>" // html body
        });
    });
};