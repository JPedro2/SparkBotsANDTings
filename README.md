# GVE Casey

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Features

### Create SFDC cases via Spark

Casey is a virtual assistant that helps you create and manage GVE cases, anywhere and on the go using Spark.<br/>
Our mission is to make the process of raising a case with GVE as natural and intuitive as possible.<br/>

Using Casey to open and manage GVE cases gives the case creator the capability to do it through an application 
used in all aspects of the working day - [*Cisco Spark*](https://www.ciscospark.com/). <br/>

The ultimate goal is to save time and reduce much of the complexity and manual tasks behind opening a case with GVE. <br/>

### Interact with Casey on Spark

Currently, you can interact with Casey on an individual basis or you can add her to a team space. For the latter,
you will have to do a _direct mention `(@Casey)`_ every time you want to interact with her or answer her clarification
questions.
As of this moment, Casey is able to raise a case with GVE by sending an email to the GVE case handler
team with all the required information.
All you need to do is tell Casey that you wish to open a case. For example: <br/>

_`Hi Casey, I would like to open a case with GVE`_

Casey will then ask you further clarification questions and send an email out to the GVE case handler team `tsn-request@cisco.com` with the requester in CC.

## Configure and Deploy Casey

1. Create a bot in the Spark Developer portal

	1. Follow the instructions to create a [*new bot*](https://developer.ciscospark.com/add-bot.html) in the Cisco Spark Developer Portal. <br/>

	2. Cisco requires you to choose an avatar for your bot before you can create it in their portal. This needs to be a 512x512px image icon. - this can be changed later. <br/>
	You can either choose one of their default icons or you can [*download this one*](https://s-media-cache-ak0.pinimg.com/originals/bb/c1/2b/bbc12bff3a544b88c3d408669231073a.png) to your machine and upload it to the portal. <br/>

	3. Take note of the bot `username` and the `access token` that is specific to your bot. Store the `access token` somewhere as you won't be able to see this later - but you will be able to revoke it and create a new one.

2. Set the following environment variables. If developing locally, you can put these in the `.env` file:

    | Environment variable         | Description                                                                                                                                                                                                                                                                                                                                                                                                         |
    | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | `access_token`               | The bot's access token that you have created on Cisco Spark Developers page  (**required**)                                                                                                                                                                                                                                                                                                                                                                 |
    | `public_address`             | The address at which your bot can be reached (**required**)                                                                                                                                                                                                                                                                                                                                                                 |
    | `secret`     				   | [User-defined string to validate the origin of webhooks  and for encrypting cookies](https://developer.ciscospark.com/webhooks-explained.html#auth). Generate a random string for this value. (**required**)                                                                                                                               			  																						  																										|
    | `studio_token` | [Botkit Studio](https://studio.botkit.ai)  API token (optional)                                                                                                                                                                                                                                                                                                                                                                  	|

3. Deploy Casey

    Once you have all the variables above [you can run Casey on Heroky by clicking here](https://heroku.com/deploy?template=https://github.com/JPedro2/SparkBotsANDTings/master) or by clicking in the icon at the top of this page.

## Development

### Work on Casey

1. Clone this repository:

    ```
    git clone https://github.com/JPedro2/SparkBotsANDTings.git
    ```

2. Install all dependencies, including [Botkit](https://github.com/howdyai/botkit)
    ```
    cd SparkBotsANDTings
    npm install
    ```

3. Create a public address 
    Cisco Spark requires your application be available at an SSL-enabled endpoint. During development it is recommend to use [ngrok](http://ngrok.io), which can be used to temporarily expose Casey to the internet. Feel free to use others, such as [localtunnel.me](http://localtunnel.me).
    Once ngrok is set up, run it in order to get Casey's public address. You will need to copy the `https://` address.

    ```
    ngrok http 3000
    ```


4. Run Casey from the command line:
    ```
    access_token=<SPARK_BOT_ACCESS_TOKEN> public_address=<HTTPS_ADDRESS_FROM_NGROK_OR_OTHER> node bot.js
    ```

    **Please Note** that during development the `secret` variable can be ignored.

## Additional resources
The code uses [NodeJS](https://nodejs.org/en/) and the [Botkit](https://github.com/howdyai/botkit) framework. You can find full documentation for Botkit on this [GitHub page](https://github.com/howdyai/botkit/blob/master/readme.md).
Read more about making Spark bots in the [Cisco Developer Portal](https://developer.ciscospark.com/bots.html).
