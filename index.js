const fs = require('fs');

const Discord = require('discord.js');
const client = new Discord.Client();

const config = require('./config.json');
client.config = config;

/* Load all events */
fs.readdir('./events/', (_err, files) => {
	files.forEach(file => {
		if (!file.endsWith('.js')) return;
		const event = require(`./events/${file}`);
		let eventName = file.split('.')[0];
		console.log(`👌 Event loaded: ${eventName}`);
		client.on(eventName, event.bind(null, client));
	});
});

client.commands = new Discord.Collection();

/* Load commands */
fs.readdir('./commands/', (_err, files) => {
	files.forEach(file => {
		if (!file.endsWith('.js')) return;
		let props = require(`./commands/${file}`);
		let commandName = file.split('.')[0];
		client.commands.set(commandName, props);
		console.log(`👌 Command loaded: ${commandName}`);
	});
});

//Database
const Josh = require("@joshdb/core");

if(client.config.dbType.toLowerCase() === 'sqlite'){
	//SQLite
	const provider = require("@joshdb/sqlite");

	client.products = new Josh({
		name: 'products',
		provider,
	});
	client.usersdb = new Josh({
		name: 'users',
		provider,
	});
	client.robloxLink = new Josh({
		name: 'robloxLink',
		provider,
	});
}else
if(client.config.dbType.toLowerCase() === 'mongo'){
	//MongoDB
	const JoshMongo = require('@joshdb/mongo');

	client.products = new Josh({
		name: 'products',
		provider: JoshMongo,

  		providerOptions: {
    		collection: client.config.mongoCollection,
    		dbName: client.config.mongoClusterName,
    		url: client.config.mongoURL
  		}
	});
	client.usersdb = new Josh({
		name: 'users',
		provider: JoshMongo,

  		providerOptions: {
    		collection: client.config.mongoCollection,
    		dbName: client.config.mongoClusterName,
    		url: client.config.mongoURL
  		}
	});
	client.robloxLink = new Josh({
		name: 'robloxLink',
		provider: JoshMongo,

  		providerOptions: {
    		collection: client.config.mongoCollection,
    		dbName: client.config.mongoClusterName,
    		url: client.config.mongoURL
  		}
	});
}else{
	console.log('Configuration Error: "DBType" must be either sqlite or mongo')
	process.exit(0)
}

//Products Database
(async () => {
    console.log(`Connected to products database, there are ${await client.products.size} active servers.`);
    console.log(`Connected to users database, there are ${await client.usersdb.size} active users.`);

    //Client Login
    await client.login(client.config.token);
})();