# GVE Casey - A virtual assistant that helps you create and manage GVE cases using Spark.

CASEY helps you create and manage GVE cases, anywhere and on the go using Spark.<br/>
Our mission is to make the process of creating a case as natural and intuitive as possible.<br/>

Using Casey to open and manage GVE cases gives the case creator the capability to do it through an application 
used in all aspects of the working day - Spark. <br/>

Most importantly this saves time and reduce much of the complexity and manual tasks behind opening a case. <br/>

Currently, you can interact with Casey on an individual basis or you can add her to a team space,
where you will have to do a _direct mention `(@Casey)`_ every time you want to interact or answer her clarification
questions.
As of this moment, Casey is able to raise a case with GVE for the sender by sending and email to the GVE case handler
team with all the required information.

You can find the overview video of the project below:

[Casey, Your personal GVE case handler](https://studio.botkit.ai/)


### Dependencies
The code uses [NodeJS](https://nodejs.org/en/) and the [Botkit](https://github.com/howdyai/botkit) framework. 
So you need to install these first before running Casey. <br/>

* Botkit is available via NPM.

```bash
npm install --save botkit
```
* To send emails Casey uses NodeMailer, which can be installed via NPM. 

```bash
npm install nodemailer@0.7.1
```

* To connect your bot to Cisco Spark, [get an access token here](https://developer.ciscospark.com/add-bot.html).

* Cisco Spark requires your application be available at an SSL-enabled endpoint. To expose an endpoint during development, we recommend using [localtunnel.me](http://localtunnel.me) or [ngrok](http://ngrok.io), either of which can be used to temporarily expose Casey to the internet.

```bash
ngrok http 3000
```

### Run Casey
Clone this repository:

```bash
git clone https://github.com/JPedro2/SparkBotsANDTings.git
```

Run Casey from the command line with the new tokens:

```bash
***REMOVED***<SPARK_BOT_ACCESS_TOKEN> ***REMOVED***<HTTPS_ADDRESS_FROM_NGROK_OR_OTHER> node bot.js'```


