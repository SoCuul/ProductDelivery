const fs = require('fs');

const Discord = require('discord.js');
const client = new Discord.Client();

//Load config
const config = require('./config.json');
client.config = config;

//Load env
require('dotenv').config()

//Load events
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

//Load main commands
fs.readdir('./commands/main/', (_err, files) => {
	files.forEach(file => {
		if (!file.endsWith('.js')) return;
		let props = require(`./commands/main/${file}`);
		let commandName = file.split('.')[0];
		client.commands.set(commandName, props);
		console.log(`Main command loaded: ${commandName}`);
	});
});

//Load admin commands
fs.readdir('./commands/admin/', (_err, files) => {
	files.forEach(file => {
		if (!file.endsWith('.js')) return;
		let props = require(`./commands/admin/${file}`);
		let commandName = file.split('.')[0];
		client.commands.set(commandName, props);
		console.log(`Admin command loaded: ${commandName}`);
	});
});

//Load other commands
fs.readdir('./commands/other/', (_err, files) => {
	files.forEach(file => {
		if (!file.endsWith('.js')) return;
		let props = require(`./commands/other/${file}`);
		let commandName = file.split('.')[0];
		client.commands.set(commandName, props);
		console.log(`Other command loaded: ${commandName}`);
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
    		collection: 'products',
			dbName: process.env.MONGODBNAME,
    		url: process.env.MONGOURL
  		}
	});
	client.usersdb = new Josh({
		name: 'users',
		provider: JoshMongo,

  		providerOptions: {
    		collection: 'users',
			dbName: process.env.MONGODBNAME,
    		url: process.env.MONGOURL
  		}
	});
	client.robloxLink = new Josh({
		name: 'robloxLink',
		provider: JoshMongo,

  		providerOptions: {
    		collection: 'robloxLink',
			dbName: process.env.MONGODBNAME,
    		url: process.env.MONGOURL
  		}
	});
	client.guildSettings = new Josh({
		name: 'guildSettings',
		provider: JoshMongo,

  		providerOptions: {
    		collection: 'guildSettings',
			dbName: process.env.MONGODBNAME,
    		url: process.env.MONGOURL
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
	console.log(`Connected to roblox link database, there are ${await client.robloxLink.size} linked users.`);
	console.log(`Connected to guild settings database, there are ${await client.products.size} configured servers.`);

	try{
		//Client Login
		await client.login(process.env.TOKEN)

		//Update Checker
		if(client.config.updateCheck === true){
			async function updateChecker () {
				const axios = require('axios');

				try{
					//Make GitHub API Request
					let updaterequest = await axios.get('https://api.github.com/repos/SoCuul/ProductDelivery/releases/latest', {
						"headers": {'accept': 'application/vnd.github.v3+json'}
					})

					//Compare versions
					//Current Version
					let unparsedcurrentversion = require('./package.json').version
					let currentversion = unparsedcurrentversion.replace(/\./g, "")
					//Repo Version
					let unparsedrepoversion = updaterequest.data.tag_name
					let repoversion = unparsedrepoversion.replace(/\./g, "")

					//Check for numbers
					if(isNaN(currentversion) || isNaN(repoversion)){
						console.log('[Update Checker] Could not parse version numbers. Make sure the package.json file is untouched.')
					}else{
						if(Number(repoversion) > Number(currentversion)){
							console.log('[Update Checker] There is a new version. Download it from: https://github.com/SoCuul/ProductDelivery/releases/latest')
							console.log(`[Update Checker] Current Version: ${unparsedcurrentversion}`)
							console.log(`[Update Checker] New Version: ${unparsedrepoversion}`)

							//Notify owner
							if(client.config.ownerID && !isNaN(client.config.ownerID)){
								try{
									//Fetch bot owner
									let botOwner = await client.users.fetch(client.config.ownerID)
									const reminderEmbed = new Discord.MessageEmbed()
									.setColor(client.config.mainEmbedColor)
									.setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
									.setTitle('Update Available')
									.addField('Current Version', unparsedcurrentversion)
									.addField('New Version', unparsedrepoversion)
									.addField('Download', 'https://github.com/SoCuul/ProductDelivery/releases/latest')
									.setTimestamp()
									botOwner.send(reminderEmbed)
								}
								catch(error){
									console.log('[Update Reminder] Could not notify bot owner')
								}
							}
						}else{
							console.log('[Update Checker] You are up to date!')
						}
					}
				}
				catch(error){
					if(error.response && error.response.data && error.response.data.message){
						console.log('[Update Checker] No releases could be found. Please try again later.')
					}
					else{
						console.log('[Update Checker] There was an error checking for updates')
					}
				}
				//Try again in 24 hours
				setTimeout(updateChecker, 86400000)
			}
			updateChecker()
		}
	}
	catch(error){
		console.log('[Error] Could not login. Please make sure the token is valid.')
		process.exit(1)
	}
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
app.get('/', API_Docs)
app.get('/whitelist/', API_ProductWhitelist)
app.get('/products/guild/', API_GuildProducts)
app.get('/products/user/', API_UserProducts)
app.get('/information/user/', API_UserDiscordInfo)
app.get('/information/guild/', API_GuildDiscordInfo)
app.post('/purchase/', API_CreatePurchase)

async function API_Docs (request, response) {
	response.redirect('https://productdelivery.socuul.dev/api/endpoints/')
}

async function API_ProductWhitelist (request, response) {
	if(!request.query.robloxid){
		response.status(400)
		return response.send({
			"error": "robloxid is missing"
		})
	}
	else if(!request.query.guildid){
		response.status(400)
		return response.send({
			"error": "guildid is missing"
		})
	}
	else if(!request.query.productname){
		response.status(400)
		return response.send({
			"error": "productname is missing"
		})
	}

	//Check types
	if(typeof request.query.robloxid !== "string"){
		response.status(400)
		return response.send({
			"error": "robloxid must be a string"
		})
	}
	else if(typeof request.query.guildid !== "string"){
		response.status(400)
		return response.send({
			"error": "guildid must be a string"
		})
	}
	else if(typeof request.query.productname !== "string"){
		response.status(400)
		return response.send({
			"error": "productname must be a string"
		})
	}

	//Validate user
	let robloxInfo = await client.getUserInfo(request.query.robloxid)
	if(robloxInfo.verified === false){
		response.status(404)
		return response.send({
			"error": "user is not verified"
		})
	}
	//Validate guild
	if(!client.guilds.cache.get(request.query.guildid)){
		response.status(404)
		return response.send({
			"error": "guild does not exist"
		})
	}

	//Fetch all products from DB
	await client.products.ensure(request.query.guildid, {})
	let allproducts = await client.products.get(request.query.guildid)
	//Fetch user products from DB
	await client.usersdb.ensure(`${request.query.robloxid}.${request.query.guildid}`, [])
	let myproducts = await client.usersdb.get(`${request.query.robloxid}.${request.query.guildid}`)

	//Check if requested product exists
	if(!allproducts[request.query.productname]){
		response.status(404)
		return response.send({
			"error": "product does not exist"
		})
	}

	//Get valid products
	let productnames = []
	for(product in myproducts){
		if(allproducts[myproducts[product]]){
			productnames.push(myproducts[product])
		}
	}

	//Check if user owns product
	if(productnames.includes(request.query.productname)){
		response.status(200)
		return response.send(true)
	}
	else{
		response.status(200)
		return response.send(false)
	}
}

async function API_GuildProducts (request, response) {
	//Check for missing data
	if(!request.headers.token){
		response.status(400)
		return response.send({
			"error": "token is missing"
		})
	}
	if(!request.query.guildid){
		response.status(400)
		return response.send({
			"error": "guildid is missing"
		})
	}

	//Check types
	if(typeof request.headers.token !== "string"){
		response.status(400)
		return response.send({
			"error": "token must be a string"
		})
	}
	else if(typeof request.query.guildid !== "string"){
		response.status(400)
		return response.send({
			"error": "guildid must be a string"
		})
	}

	//Validate token
	await client.guildSettings.ensure(`${request.query.guildid}.token`, '')
	if(request.headers.token !== await client.guildSettings.get(`${request.query.guildid}.token`)){
		response.status(404)
		return response.send({
			"error": "token is invalid"
		})
	}
	//Validate guild
	if(!client.guilds.cache.get(request.query.guildid)){
		response.status(404)
		return response.send({
			"error": "guild does not exist"
		})
	}

	//Fetch products from DB
	await client.products.ensure(request.query.guildid, {})
    let allproducts = await client.products.get(request.query.guildid)

	//Create object
	let products = {}
	for (i in allproducts) {
		products[i] = {
			name: allproducts[i].name,
			description: allproducts[i].description,
			productid: allproducts[i].productid,
			stock: allproducts[i].stock
		}
		//Add stock amount
		if(allproducts[i].stock){
			products[i].stockamount = allproducts[i].stockamount
		}
		//Add image
		if(allproducts[i].image){
			products[i].image = allproducts[i].image
		}
	}

	//Send Response
	response.status(200)
	return response.send(products)
}

async function API_UserProducts (request, response) {
	//Check for missing data
	if(!request.headers.token){
		response.status(400)
		return response.send({
			"error": "token is missing"
		})
	}
	if(!request.query.robloxid){
		response.status(400)
		return response.send({
			"error": "robloxid is missing"
		})
	}
	else if(!request.query.guildid){
		response.status(400)
		return response.send({
			"error": "guildid is missing"
		})
	}

	//Check types
	if(typeof request.headers.token !== "string"){
		response.status(400)
		return response.send({
			"error": "token must be a string"
		})
	}
	if(typeof request.query.robloxid !== "string"){
		response.status(400)
		return response.send({
			"error": "robloxid must be a string"
		})
	}
	else if(typeof request.query.guildid !== "string"){
		response.status(400)
		return response.send({
			"error": "guildid must be a string"
		})
	}

	//Validate token
	await client.guildSettings.ensure(`${request.query.guildid}.token`, '')
	if(request.headers.token !== await client.guildSettings.get(`${request.query.guildid}.token`)){
		response.status(404)
		return response.send({
			"error": "token is invalid"
		})
	}
	//Validate user
	let robloxInfo = await client.getUserInfo(request.query.robloxid)
	if(robloxInfo.verified === false){
		response.status(404)
		return response.send({
			"error": "user is not verified"
		})
	}
	//Validate guild
	if(!client.guilds.cache.get(request.query.guildid)){
		response.status(404)
		return response.send({
			"error": "guild does not exist"
		})
	}

	//Fetch all products from DB
	await client.products.ensure(request.query.guildid, {})
	let allproducts = await client.products.get(request.query.guildid)
	//Fetch user products from DB
	await client.usersdb.ensure(`${request.query.robloxid}.${request.query.guildid}`, [])
	let myproducts = await client.usersdb.get(`${request.query.robloxid}.${request.query.guildid}`)

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

async function API_UserDiscordInfo (request, response) {
	//Check for missing data
	if(!request.query.robloxid){
		response.status(400)
		return response.send({
			"error": "robloxid is missing"
		})
	}

	//Check types
	if(typeof request.query.robloxid !== "string"){
		response.status(400)
		return response.send({
			"error": "robloxid must be a string"
		})
	}

	//Validate user
	let userInfo = await client.getUserInfo(request.query.robloxid)
	if(userInfo.verified === false){
		response.status(404)
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
        	"avatar": user.displayAvatarURL({ "format": "jpg" })
		})
	}
	catch(error){
		response.status(404)
		return response.send({
			"error": "could not find fetch user discord information"
		})
	}
}

async function API_GuildDiscordInfo (request, response) {
	//Check for missing data
	if(!request.query.guildid){
		response.status(400)
		return response.send({
			"error": "guildid is missing"
		})
	}

	//Check types
	else if(typeof request.query.guildid !== "string"){
		response.status(400)
		return response.send({
			"error": "guildid must be a string"
		})
	}

	//Validate guild
	let guild = client.guilds.cache.get(request.query.guildid)
	if(!guild){
		response.status(404)
		return response.send({
			"error": "guild does not exist"
		})
	}

	//Fetch guild information
	try{
		response.status(200)
		return response.send({
			"id": guild.id,
			"name": guild.name,
			"memberCount": guild.memberCount,
			"ownerID": guild.ownerID,
			"icon": guild.iconURL()
		})
	}
	catch(error){
		response.status(404)
		return response.send({
			"error": "could not find fetch guild discord information"
		})
	}
}

async function API_CreatePurchase (request, response) {
	//Check for missing data
	if(!request.headers.token){
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

	//Check types
	if(typeof request.headers.token !== "string"){
		response.status(400)
		return response.send({
			"error": "token must be a string"
		})
	}
	if(typeof request.body.robloxid !== "string"){
		response.status(400)
		return response.send({
			"error": "robloxid must be a string"
		})
	}
	else if(typeof request.body.guildid !== "string"){
		response.status(400)
		return response.send({
			"error": "guildid must be a string"
		})
	}
	else if(typeof request.body.productname !== "string"){
		response.status(400)
		return response.send({
			"error": "productname must be a string"
		})
	}

	//Validate token
	await client.guildSettings.ensure(`${request.body.guildid}.token`, '')
	if(request.headers.token !== await client.guildSettings.get(`${request.body.guildid}.token`)){
		response.status(404)
		return response.send({
			"error": "token is invalid"
		})
	}
	//Validate user
	let userInfo = await client.getUserInfo(request.body.robloxid)
	if(userInfo.verified === false){
		response.status(404)
		return response.send({
			"error": "user is not verified"
		})
	}
	//Validate guild
	if(!client.guilds.cache.get(request.body.guildid)){
		response.status(404)
		return response.send({
			"error": "guild does not exist"
		})
	}

	//Validate product
	//Fetch products from DB
	await client.products.ensure(request.body.guildid, {})

	let product = await client.products.get(`${request.body.guildid}.${request.body.productname}`)
	if(!product){
		response.status(404)
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
		response.status(404)
		return response.send({
			"error": "user already owns product"
		})
	}

	//Check for stock
	if(product.stock && !isNaN(product.stockamount)){
		if(product.stockamount < 1){
			response.status(404)
			return response.send({
				"error": "no product stock is left"
			})
		}else{
			await client.products.dec(`${request.body.guildid}.${request.body.productname}.stockamount`)
		}
	}

	//Add product to user's db
	await client.usersdb.push(`${request.body.robloxid}.${request.body.guildid}`, request.body.productname)

	//Notify user
	let dmerror = false
	try{
		let user = await client.users.fetch(userInfo.discordID)
		let guild = client.guilds.cache.get(request.body.guildid)

		const embed = new Discord.MessageEmbed()
        .setColor(client.config.mainEmbedColor)
        .setTitle('You have purchased: ' + product.name)
        .addField('Download Link:', product.file)
        .setFooter(guild.name, guild.iconURL())
		await user.send(embed)
	}
	catch(error){
		dmerror = true
	}

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
			let guild = client.guilds.cache.get(request.body.guildid)

			const logembed = new Discord.MessageEmbed()
			.setColor('BLUE')
			.setTitle('Product Purchased')
			.addField('Roblox User', `${userInfo.robloxUsername} (${userInfo.robloxID})`)
			.addField('Discord User', userInfo.discordID)
			.addField('Product', product.name)
			.setThumbnail(`https://www.roblox.com/headshot-thumbnail/image?userId=${userInfo.robloxID}&width=420&height=420&format=png`)
			.setTimestamp()
			guild.channels.cache.get(logchannel).send(logembed)
		}
		catch(error){
			console.log(`I could not log the purchase of "${product.name}" in guild "${request.body.guildid}"`)
		}
	}

	//Send response
	response.status(201)
	return response.send({
		"status": "ok",
		"dmerror": dmerror || false
	})
}