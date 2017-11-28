/*

This module demonstrates how Casey helps the requester to raise a Case with GVE.
Casey can be used in a direct interaction OR in a group chat by using direct mention (@Casey)

There are 2 mains parts:

    1. There is a webhook every time Casey hears someone saying case - e.g. "I would like to raise a Case"
        1.1. Casey then ask a few clarification questions

    2. An email is sent to GVE so that the case handling team is able to open the case on behalf of the requester
        2.1. This only works internally. The user will need to be in the internal network or using VPN

*/


//Create global dictionary to store users information and allow concurrent sessions
var case_dict = {};
var user_list = [];

module.exports = function(controller) {

    controller.hears(['^hi (.*)','^hello (.*)', '^hi','^hello'], 'direct_message,direct_mention', function(bot, message, getMessageUser) {
        //var UserName = message.original_message.data.personDisplayName
        //bot.reply(message, 'Hi '+UserName+ ', How may I help you?');
        bot.reply(message, 'Hi 😊       \n How may I help you?');
    });

    controller.hears(['^case (.*)','^case', 'case'], 'direct_message,direct_mention', function(bot, message) {
        bot.reply(message, 'Sure thing! I will happily help you with that.'
                           +' I just need to ask a few questions 🤓');
        bot.startConversation(message, askSubject);
    });

    controller.hears(['^show (.*)','^show', 'show'], 'direct_message,direct_mention', function(bot, message) {
        var user = message.user;
        //if (Object.keys(case_dict.user_list[user]).length === 0 && case_dict.user_list[user].constructor === Object) {
        if (case_dict[user_list[user]] == null) {
            bot.reply(message, 'Sorry! There is no information stored under you account 😕')
        } else {
            bot.reply(message, 'The variables I have saved for you are the following: ');
            for (var key in case_dict[user_list[user]]) {
                if (case_dict[user_list[user]].hasOwnProperty(key))
                    bot.reply(message, 'The '+key+' is :'+case_dict[user_list[user]][key]);
                    continue;
            }
        }
    });

}

    askSubject = function(response, convo) {
        convo.ask("Can you please provide a brief Subject?      \n"
                  + "Example subjects: Contact Center BoM, Prime Infrastructure Info, Customer WebEx Meeting Requested",
            function(response, convo) {
                var user = convo.source_message.user;
                user_list[user] = user;
                case_dict[user_list[user]] = {};
                var Subject = response.text;
                var userSubject = user;
                case_dict[user_list[userSubject]]["Subject"] = Subject;
                convo.say("Got it, Thank you.");
                //convo.say("The Subject is: "+case_dict[user_list[user]]["Subject"]+" and the user is: "+user);
                convo.next();
                askCustomerName(response, convo,user);
        });
    }

    askCustomerName = function(response, convo) {
        convo.ask("Can you please provide the customer name?",
            function(response, convo) {
                var userCustomerName = convo.source_message.user;
                var CustomerName = response.text;
                case_dict[user_list[userCustomerName]]["CustomerName"] = CustomerName;
                askDueDate(response, convo);
                convo.next();
        });
    }

    askDueDate = function(response, convo) {
      convo.ask("Please provide us the requested due date as [dd/mm/yyyy]",
            function(response, convo) {
                var DueDate = response.text;
                var userDueDate = convo.source_message.user;
                if(isValidDate(DueDate)){
                    if(isPresentOrFuture(DueDate)){
                        //var dateFormat = require('dateformat'); //Make the requested date more readable to send it over email
                        //DueDate = dateFormat(RequestedDate, "fullDate");
                        convo.say("Great!");
                        //convo.say("I will send this date: " +DueDatePretty);
                        queryDealID(response, convo);
                        case_dict[user_list[userDueDate]]["DueDate"] = DueDate;
                        convo.next();
                    } else {
                        convo.say("The date you requested is in the past. The date needs to be today or in the future.");
                        //convo.say("I'm seeing a date that is in the past.       \n"
                        //         + "This is the date that you requested: "+ RequestedDate +"       \n"
                        //         + "This is today's date: " +today);
                        askDueDate(response, convo);
                        convo.next();
                    }

                } else {
                    convo.say("❌ The date you provided is invalid. ❌")
                    askDueDate(response, convo);
                    convo.next();
                }
             });
    }

    //check if the requester has a dealID
    queryDealID = function(response, convo) {
     convo.ask("Do you have a deal ID?", function(response, convo) {
       var hasDealID = response.text;
       var userhasDealID = convo.source_message.user;
       if (hasDealID.toLowerCase().indexOf("yes") >= 0) {   //if it has then ask what it is
         convo.say("Great!");
         askDealID(response, convo);
         convo.next();
       }

       if (hasDealID.toLowerCase().indexOf("no") >= 0) {
         convo.say("That is no problem. You can add a deal ID later on.");
         var DealID = "The requester did not provide a deal ID";
         askTechInvolved(response, convo);
         case_dict[user_list[userhasDealID]]["DealID"] = DealID;
         convo.next();
       }

       if (hasDealID.toLowerCase().indexOf("yes") == -1 && hasDealID.toLowerCase().indexOf("no") == -1) {
         convo.say("❌ The answer you provided is invalid ❌. Please clearly specify with a ***yes*** or a ***no***.")
         queryDealID(response, convo);
         convo.next();
       }
     });
    }

    askDealID = function(response, convo) {
         convo.ask("Please provide us the deal ID", function(response, convo) {
           var DealID = response.text;
           var userDealID = convo.source_message.user;
           var isnum = /^\d+$/.test(DealID);
           if(isnum){
               if (DealID.length < 7){
                   convo.say("❌ The deal ID you provided is invalid ❌. Please provide a deal ID with ***7 digits only***.");
                   askDealID(response, convo);
                   convo.next();
               } else {
                  convo.say("Noted. Thank you!");
                  askTechInvolved(response, convo);
                  case_dict[user_list[userDealID]]["DealID"] = DealID;
                  convo.next();
               }
           } else if (!isnum){
              convo.say("❌ The deal ID you provided is invalid ❌. Please provide ***numbers*** only.");
              askDealID(response, convo);
              convo.next();
           }
         });
        }

    askTechInvolved = function(response, convo) {
     convo.ask("What are the technologies involved?", function(response, convo) {
       convo.say("Brilliant!")
       var TechInvolved = response.text;
       var userTechInvolved = convo.source_message.user;
       case_dict[user_list[userTechInvolved]]["TechInvolved"] = TechInvolved;
       askDescription(response, convo);
       convo.next();
     });
    }

    askDescription = function(response, convo) {
      convo.ask("Can you please provide us a description?      \n"
                + "Please give us as much information as possible about your customer and what help you need.",
        function(response, convo) {

        var Description = response.text;
        var userDescription = convo.source_message.user;
        case_dict[user_list[userDescription]]["Description"] = Description;
        convo.say("Brilliant! That is it, I have all the information I needed. Thank you for your cooperation. 🙌🏽");
        askSummary(response, convo);
        convo.next();
     });
    }

    askSummary = function(response, convo) {
      convo.ask("Would you like to see a summary of the case request before sending it?", function(response, convo) {

        var Summary = response.text;
        var userSummary = convo.source_message.user;

        if (Summary.toLowerCase().indexOf("yes") >= 0) {   //if it has then ask what it is
            convo.say("Below is the email that will be sent out to the GVE team that will raise the case for you.    \n\n");
            convo.say("> Dear Sir/Madam,      \n"
                      +'> The user *' +user_list[userSummary]+ '* would like to raise a case with GVE.'
                      +' Please find all the details below:      \n\n'
                      +'> - **Brief Subject: **' +case_dict[user_list[userSummary]]["Subject"]+ '      \n'
                      +'> - **Customer Name:  **' +case_dict[user_list[userSummary]]["CustomerName"]+ '      \n'
                      +'> - **Requested Due Date:  **' +case_dict[user_list[userSummary]]["DueDate"]+ '      \n'
                      +'> - **Deal ID:  **' +case_dict[user_list[userSummary]]["DealID"]+ '      \n'
                      +'> - **Technologies Involved:  **' +case_dict[user_list[userSummary]]["TechInvolved"]+ '      \n'
                      +'> - **Description:  **' +case_dict[user_list[userSummary]]["Description"]+ '      \n\n'
                      +'> Please send a confirmation email to *' +user_list[userSummary]+ '* with the case ID.      \n'
                      +'> If you have any questions please contact the requester directly using the email above.      \n\n'
                      +'> Best Regards,      \n'
                      +'> *Casey, Your personal GVE case handler*');
            convo.next();
            sendEmailout(response, convo);
        }

        if (Summary.toLowerCase().indexOf("no") >= 0) {
            convo.say("Ok, no problem!");
            convo.next();
            sendEmailout(response, convo);
        }

        if (Summary.toLowerCase().indexOf("yes") == -1 && Summary.toLowerCase().indexOf("no") == -1) {
            convo.say("❌ The answer you provided is invalid ❌. Please clearly specify with a ***yes*** or a ***no***.")
            askSummary(response, convo);
            convo.next();
        }
     });
    }

    sendEmailout = function(response, convo) {
      convo.ask("Would you like the case to be raised?", function(response, convo, message) {
           var sendEmailRequest = response.text;
           var userEmailRequest = convo.source_message.user;
           if (sendEmailRequest.toLowerCase().indexOf("yes") >= 0) {   //Send Email out
                sendEmail(userEmailRequest);
                convo.say("Thank you. That's it, all done for you 🎉🤗.     \n"
                + "Your case will now be raised with SalesForce and you will receive an email with your case ID.     \n"
                + "If you would like a demo or a call with your customer, "
                + "please wait to schedule it until a VSE is assigned to your case.");
                //delete case_dict[user_list[userEmailRequest]];
                convo.next();
           }

           if (sendEmailRequest.toLowerCase().indexOf("no") >= 0) {    //Ask the requester to restart the process
             convo.say("Sorry to hear that! 🙁 Please start the process again.");
             //delete case_dict[user_list[userEmailRequest]];
             convo.next();
           }

           if (sendEmailRequest.toLowerCase().indexOf("yes") == -1 && sendEmailRequest.toLowerCase().indexOf("no") == -1) {
             convo.say("❌ The answer you provided is invalid ❌. Please clearly specify with a ***yes*** or a ***no***.")
             sendEmailout(response, convo);
             convo.next();
           }
      });
    }
/*
    //Casey only sends an email out when it hears the word email
    controller.hears(['email'], 'direct_message,direct_mention', function(bot, message) {
        var UserRequester = message.user;
        sendEmail();
    });
};
*/

//Date Validation Function
function isValidDate(dateString)
{
    // First check for the pattern
    if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
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
    today = today.setHours(0,0,0,0);                //Ignore hours, minutes, seconds and miliseconds

    //Change the format from dd/mm/yyyy to mm/dd/yyyy to be able to compare dates and use dateformat capabilities
    var RequestedDate = (dateString).toString().split('/');
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

//send email out
function sendEmail(user_email)
{
    var mail = require("nodemailer").mail;
    mail({
        from: user_email,   // sender address
        cc: user_email,     // always CC the requester so that he can keep a copy of the request
        to: (user_email, /*"tsn-request@cisco.com"*/ "peolivei@cisco.com"),
        subject: "Raising a case with GVE", // Subject line
        //text: "", // plaintext body
        html: 'Dear Sir/Madam,<br>'
              +'The user ' +user_list[user_email]+ ' would like to raise a case with GVE.'
              +' Please find all the details below:<br><br>'
              +'<li><b>Brief Subject:</b> ' +case_dict[user_list[user_email]]["Subject"]+ '</li><br>'
              +'<li><b>Customer Name:</b> ' +case_dict[user_list[user_email]]["CustomerName"]+ '</li><br>'
              +'<li><b>Requested Due Date:</b> ' +case_dict[user_list[user_email]]["DueDate"]+ '</li><br>'
              +'<li><b>Deal ID:</b> ' +case_dict[user_list[user_email]]["DealID"]+ '</li><br>'
              +'<li><b>Technologies Involved:</b> ' +case_dict[user_list[user_email]]["TechInvolved"]+ '</li><br>'
              +'<li><b>Description:</b> ' +case_dict[user_list[user_email]]["Description"]+ '</li><br><br>'
              +'Please send a confirmation email to ' +user_list[user_email]+ ' with the case ID.<br>'
              +'If you have any questions please contact the requester directly using the email above.<br><br>'
              +'Best Regards,<br>'
              +'<i>Casey, Your personal GVE case handler</i>'
    });
}