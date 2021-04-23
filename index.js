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
	client.guildSettings = new Josh({
		name: 'guildSettings',
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
	client.guildSettings = new Josh({
		name: 'guildSettings',
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

//Functions
//Get User Information from Roblox ID
client.getUserInfo = async function getUserInfo (inputRobloxID) {
	let userInfo = await client.robloxLink.find(value => value.robloxID === inputRobloxID)
	let discordID = ''
    if(userInfo){
    	discordID = Object.keys(userInfo)[0]
    }else{
    	return {
    		"verified": false
      	}
    }

    await client.robloxLink.ensure(discordID, {})

    let robloxID = await client.robloxLink.get(`${discordID}.robloxID`)
    let robloxUsername = await client.robloxLink.get(`${discordID}.robloxUsername`)

    if(robloxID && robloxUsername){
      	return {
        	"verified": true,
        	"discordID": discordID,
        	"robloxID": await client.robloxLink.get(`${discordID}.robloxID`),
        	"robloxUsername": await client.robloxLink.get(`${discordID}.robloxUsername`)
      	}
    }else{
      	return {
        	"verified": false
      	}
    }
  }

//Get Roblox Information from Discord ID
client.getRobloxInfo = async function getRobloxInfo (discordID) {
	await client.robloxLink.ensure(discordID, {})

    let robloxID = await client.robloxLink.get(`${discordID}.robloxID`)
    let robloxUsername = await client.robloxLink.get(`${discordID}.robloxUsername`)

    if(robloxID && robloxUsername){
      	return {
        	"verified": true,
        	"robloxID": await client.robloxLink.get(`${discordID}.robloxID`),
        	"robloxUsername": await client.robloxLink.get(`${discordID}.robloxUsername`)
      	}
    }else{
      	return {
        	"verified": false
      	}
    }
}

//API
const express = require('express')
const bodyParser = require('body-parser');
const { response } = require('express');

const app = express()
app.use(bodyParser.json())

const port = 3000

app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`)
})

//Recive Requests
app.get('/', express.static('html'))
app.get('/products/guild/', API_GuildProducts)
app.get('/products/user/', API_UserProducts)
app.get('/information/', API_DiscordInfo)
app.post('/purchase/', API_CreatePurchase)

async function API_GuildProducts (request, response) {
	//Check for missing data
	if(!request.body.guildid){
		response.status(400)
		return response.send({
			"error": "guildid is missing"
		})
	}

	//Validate guild
	if(!client.guilds.cache.get(request.body.guildid)){
		response.status(400)
		return response.send({
			"error": "guild does not exist"
		})
	}

	//Fetch products from DB
	await client.products.ensure(request.body.guildid, {})
    let allproducts = await client.products.get(request.body.guildid)

	//Send Response
	response.status(200)
	return response.send(allproducts)
}

async function API_UserProducts (request, response) {
	//Check for missing data
	if(!request.body.robloxid){
		response.status(400)
		return response.send({
			"error": "robloxid is missing"
		})
	}
	else if(!request.body.guildid){
		response.status(400)
		return response.send({
			"error": "guildid is missing"
		})
	}

	//Validate user
	let robloxInfo = await client.getUserInfo(request.body.robloxid)
	if(robloxInfo.verified === false){
		response.status(400)
		return response.send({
			"error": "user is not verified"
		})
	}
	//Validate guild
	if(!client.guilds.cache.get(request.body.guildid)){
		response.status(400)
		return response.send({
			"error": "guild does not exist"
		})
	}

	//Fetch all products from DB
	await client.products.ensure(request.body.guildid, {})
	let allproducts = await client.products.get(request.body.guildid)
	//Fetch user products from DB
	await client.usersdb.ensure(`${request.body.robloxid}.${request.body.guildid}`, [])
	let myproducts = await client.usersdb.get(`${request.body.robloxid}.${request.body.guildid}`)

	//Get valid products
	let productnames = []
	for(product in myproducts){
		if(allproducts[myproducts[product]]){
			productnames.push(myproducts[product])
		}
	}

	//Send Response
	response.status(200)
	return response.send(productnames)
}

async function API_DiscordInfo (request, response) {
	//Check for missing data
	if(!request.body.robloxid){
		response.status(400)
		return response.send({
			"error": "robloxid is missing"
		})
	}

	//Validate user
	let userInfo = await client.getUserInfo(request.body.robloxid)
	if(userInfo.verified === false){
		response.status(400)
		return response.send({
			"error": "user is not verified"
		})
	}

	//Fetch user information
	try{
		let user = await client.users.fetch(userInfo.discordID)
		
		response.status(200)
		return response.send({
			"id": user.id,
        	"username": user.username,
        	"descrim": user.discriminator,
        	"tag": user.tag,
        	"avatar": user.displayAvatarURL({"format": "jpg"})
		})
	}
	catch(error){
		response.status(400)
		return response.send({
			"error": "could not find fetch discord information"
		})
	}
}

async function API_CreatePurchase (request, response) {
	//Check for missing data
	if(!request.body.token){
		response.status(400)
		return response.send({
			"error": "token is missing"
		})
	}
	else if(!request.body.guildid){
		response.status(400)
		return response.send({
			"error": "guildid is missing"
		})
	}
	else if(!request.body.robloxid){
		response.status(400)
		return response.send({
			"error": "robloxid is missing"
		})
	}
	else if(!request.body.productname){
		response.status(400)
		return response.send({
			"error": "productname is missing"
		})
	}

	//Validate token
	if(request.body.token !== 'test'){
		response.status(400)
		return response.send({
			"error": "token is invalid"
		})
	}
	//Validate user
	let userInfo = await client.getUserInfo(request.body.robloxid)
	if(userInfo.verified === false){
		response.status(400)
		return response.send({
			"error": "user is not verified"
		})
	}
	//Validate guild
	if(!client.guilds.cache.get(request.body.guildid)){
		response.status(400)
		return response.send({
			"error": "guild does not exist"
		})
	}
	//Validate product name
	//Fetch products from DB
	await client.products.ensure(request.body.guildid, {})

	let product = await client.products.get(`${request.body.guildid}.${request.body.productname}`)
	if(!product){
		response.status(400)
		return response.send({
			"error": "product does not exist"
		})
	}

	//Give user product
	await client.usersdb.ensure(`${request.body.robloxid}`, {})
    await client.usersdb.ensure(`${request.body.robloxid}.${request.body.guildid}`, [])
	let usersproducts = await client.usersdb.get(`${request.body.robloxid}.${request.body.guildid}`)

	//Check if user already owns product
	if(usersproducts.includes(request.body.productname)){
		response.status(400)
		return response.send({
			"error": "user already owns product"
		})
	}

	//Add product to user's db
	await client.usersdb.push(`${request.body.robloxid}.${request.body.guildid}`, request.body.productname)

	//Notify user
	let dmerror = false
	try{
		let user = await client.users.fetch(userInfo.discordID)
		let guild = client.guilds.cache.get(request.body.guildid)

		const embed = new Discord.MessageEmbed()
        .setColor('BLACK')
        .setTitle('You have purchased: ' + product.name)
        .addField('Download Link:', product.file)
        .setFooter(guild.name, guild.iconURL())
		await user.send(embed)

		//Log
    	//Ensure data
    	await client.guildSettings.ensure(request.body.guildid, {
			logchannel: ''
		})
  
		//Get Channel
		let logchannel = await client.guildSettings.get(`${request.body.guildid}.logchannel`)
  
		if(logchannel){
			//Send Log Message
			try{
				const logembed = new Discord.MessageEmbed()
				.setColor(client.config.mainEmbedColor)
				.setTitle('Product Purchased')
				.addField('Roblox User', `${userInfo.robloxUsername} (${userInfo.robloxID})`)
				.addField('Discord User', userInfo.discordID)
				.addField('Product', product.name)
				.setTimestamp()
				guild.channels.cache.get(logchannel).send(logembed)
			}
			catch(error){
				console.log(`I could not log the purchase of "${product.name}" in guild "${request.body.guildid}"`)
			}
		}
	}
	catch(error){
		dmerror = true
	}

	//Send response
	response.status(201)
	return response.send({
		"status": "ok",
		"dmerror": dmerror || false
	})
}