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
var hasDealID;
var DealID;
var TechInvolved;
var Description;
var UserRequester;
var RequestedDate;
var today;
var DueDatePretty;

module.exports = function(controller) {

    controller.hears(['^hi (.*)','^hello (.*)', '^hi','^hello'], 'direct_message,direct_mention', function(bot, message) {
      //var UserName = message.original_message.data.personDisplayName
      //bot.reply(message, 'Hi '+UserName+ ', How may I help you?');
      bot.reply(message, 'Hi 😊       \n How may I help you?');
    });

    controller.hears(['case'] , 'direct_message,direct_mention', function(bot, message) {
      UserRequester = message.user;
      bot.reply(message, 'Sure thing! I will happily help you with that.'
                         +' I just need to ask a few questions');
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
      convo.ask("Please provide us the requested due date as [dd/mm/yyyy]", function(response, convo) {
        DueDate = response.text;
        if(isValidDate(DueDate)){
            if(isPresentOrFuture(DueDate)){
                var dateFormat = require('dateformat'); //Make the requested date more readable to send it over email
                DueDatePretty = dateFormat(RequestedDate, "fullDate");
                convo.say("Great!");
                //convo.say("I will send this date: " +DueDatePretty);
                queryDealID(response, convo);
                convo.next();
            } else {
                convo.say("The date you requested is in the past. The date needs to be today or in the future.");
                convo.say("I'm seeing the date as past.       \n"
                         + "This is the date that you requested: "+ RequestedDate +"       \n"
                         + "This is today's date: " +today);
                askDueDate(response, convo);
                convo.next();
            }

        } else {
            convo.say("The date you provided is invalid.")
            askDueDate(response, convo);
            convo.next();
        }
      });
    }

    //check if the requester has a dealID
    queryDealID = function(response, convo) {
     convo.ask("Do you have a deal ID?", function(response, convo) {
       hasDealID = response.text;
       if (hasDealID.toLowerCase().indexOf("yes") >= 0) {   //if it has then ask what it is
         convo.say("Great!");
         askDealID(response, convo);
         convo.next();
       }

       if (hasDealID.toLowerCase().indexOf("no") >= 0) {
         convo.say("That is no problem. You can add a deal ID later on.");
         DealID = "The requester did not provide a deal ID";
         askTechInvolved(response, convo);
         convo.next();
       }

       if (hasDealID.toLowerCase().indexOf("yes") == -1 && hasDealID.toLowerCase().indexOf("no") == -1) {
         convo.say("The answer you provided is invalid. Please clearly specify with a yes or a no.")
         queryDealID(response, convo);
         convo.next();
       }
     });
    }

    askDealID = function(response, convo) {
         convo.ask("Please provide us the deal ID", function(response, convo) {
           convo.say("Noted. Thank you!")
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

    askDescription = function(response, convo, message) {
      convo.ask("Can you please provide us a description?      \n"
                + "Please give us as much information as possible about your customer and what help you need.",
                     function(response, convo, message) {
        convo.say("Thank you. That's it, all done for you. "
                + "Your case will now be raised with SalesForce and you will receive an email with your case ID.     \n"
                + "If you would like a demo or a call with your customer, "
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



    //Casey only sends an email out when it hears the word email
    controller.hears(['email'], 'direct_message,direct_mention', function(bot, message) {
        var mail = require("nodemailer").mail;

        mail({
            from: "iknain@cisco.com",   // sender address
            cc: UserRequester,          // always CC the requester so that he can keep a copy of the request
            to: "peolivei@cisco.com , iknain@cisco.com , pflorido@cisco.com", // list of receivers
            subject: "Raise a case with GVE", // Subject line
            //text: "", // plaintext body
            html: 'Dear Sir/Madam,<br>'
                  +'The user ' +UserRequester+ ' would like to raise a case with GVE.'
                  +'Please find all the details below:<br><br>'
                  +'<b>Brief Subject:</b> ' +Subject+ '<br>'
                  +'<b>Customer Name:</b> ' +CustomerName+ '<br>'
                  +'<b>Requested Due Date:</b> ' +DueDatePretty+ '<br>'
                  +'<b>Deal ID:</b> ' +DealID+ '<br>'
                  +'<b>Technologies Involved:</b> ' +TechInvolved+ '<br>'
                  +'<b>Description:</b> ' +Description+ '<br><br>'
                  +'Please send a confirmation email to ' +UserRequester+ ' with the case ID.<br>'
                  +'If you have any questions please contact the requester directly using the email above.<br><br>'
                  +'Best Regards,<br>'
                  +'Casey, Your personal GVE case handler'
                   //'Tips:%0D%0A
                   //•Example subjects: Contact Center BoM, Prime Infrastructure Info, Customer WebEx Meeting Requested.%0D%0A
                   //•Please give us as much information as possible about your customer and what help you need.%0D%0A
                   //•Don’t forget to attach documents if needed.%0D%0A
                   //•If you would like a demo or call with your customer, please wait to schedule until a VSE is assigned." "
                   //"<b>Hello world ✔</b>" // html body
        });
    });
};

//Date Validation Function
function isValidDate(dateString)
{
/*  // Get Today's Date
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;     //January is 0
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd='0'+dd
    }
    if(mm<10) {
        mm='0'+mm
    }
    today = mm+'/'+dd+'/'+yyyy;
*/

    // First check for the pattern
    if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[1], 10);
    var month = parseInt(parts[0], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
};

 //Check if the requested date is today or in the future
function isPresentOrFuture(dateString)
{
    today = new Date();
    today = today.setHours(0,0,0,0);                //Ignore hours, minutes, seconds and mseconds

    //Change the format from dd/mm/yyyy to mm/dd/yyyy to be able to compare dates and use dateformat capabilities
    RequestedDate = (dateString).toString().split('/');
    var RequestedDateDay   = RequestedDate[0];
    var RequestedDateMonth = RequestedDate[1];
    var RequestedDateYear  = RequestedDate[2];
    RequestedDate = RequestedDateMonth+'/'+RequestedDateDay+'/'+RequestedDateYear;

    RequestedDate = new Date(RequestedDate);        //Make today and RequestedDate the same format for comparison
    if (RequestedDate >= today) {
        return true;
    } else {
        return false
    }
};