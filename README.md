# ProductDelivery
ProductDelivery is a Roblox Product Delivery bot. It allows products to be given to users and has a robust API for intergrating it into Roblox Hubs.

# How to download
You should always use the latest version of the bot. You can get the download the latest source code by [clicking this link](https://github.com/SoCuul/ProductDelivery/releases/latest).

# Setup
## Prerequisites
First install [node.js](https://nodejs.org/en/download/).
Before configuring the bot, you must install the npm packages. Download them manually, or run `npm install`.

* @joshdb/core
* @joshdb/mongo
* @joshdb/sqlite
* axios
* body-parser
* discord.js
* dotenv
* express

### Configuration (config.json)
Rename `sample-config.json` to `config.json`. This is the way to configure the bot.
Here's how to configure it (Please replace the tutorial values with your own):
```json
{
    "defaultPrefix": "Please enter the default prefix that will be used for the commands",
    "botName": "Please enter the name of the bot",
    "mainEmbedColor": "Please enter the HEX/HTML code that will be used for most embeds",

    "showProfileRobloxID": true/false,
    "showHelpImage": true/false,

    "ownerID": "Please enter the ID of the bot owner (this user run JavaScript code)",

    "statusType": "Please enter either PLAYING, WATCHING or LISTENING in all caps",
    "statusActivity": "Please enter the message to be shown after the status type",

    "dbType": "Please enter what database is going to be used (sqlite or mongo)"
}
```

### Configuration (.env)
Rename `sample.env` to `.env`. This is where you store sensitive data.
Here's how to configure it (Please replace the tutorial values with your own):
```
TOKEN=This is where you put your bot token

MONGOCOLLECTION=Please enter the name of your mongodb collection (If you are using MongoDB)
MONGOCLUSTERNAME=Pleae enter the name of your mongodb cluster (If you are using MongoDB)
MONGOURL=Please enter the mongodb collection url (If you are using MongoDB) (Example: mongodb+srv://<username>:<password>@cluster0.0zbvd.mongodb.net/<dbName>?retryWrites=true&w=majority)
```

## Running the bot
Run start.bat or start.sh (depending what platform you're on) and the bot should start up! (Note for using the start.sh script, before running it, do `chmod +x start.sh` and then run it with `./start.sh`)

## Hosting on repl.it [![Run on Repl.it](https://repl.it/badge/github/socuul/productdelivery)](https://repl.it/github/socuul/productdelivery)
After you've clicked the **Run on Repl.it** button, make sure that the npm packages are installed.
You will have to use MongoDB as your database, otherwise the bot won't work.

You will need to ping the API every 5 minutes to keep the bot online. We reccomend using UptimeRobot.

# API
You can view the API endpoints by visiting `yourserver:3000`.

# Commands
### <> = Required
### [] = Optional
* `help` Shows the command list.
* `profile [@user]` Shows the user's Roblox account and products.
* `retrieve <productname>` Retrieve a product that you own.
* `link <robloxname>` Links your Roblox account with the bot.
* 
* `productinfo <productname>` Shows information about the product.
* `createproduct` Creates a product.
* `deleteproduct <productname>` Deletes a product.
* `modifyproduct <productname>` Modifies a product.
* `giveproduct <robloxid/@user> <productname>` Gives a product to a user.
* `revokeproduct <robloxid/@user> <productname>` Revokes a product from a user.
* `config` Configures the bot for your server.


# Support
### Join my Discord Server for help with the bot.

<a href="https://discord.gg/AY7WHt4Nrw"><img src="https://discordapp.com/api/guilds/774121617240358932/widget.png?style=banner2"></a>
