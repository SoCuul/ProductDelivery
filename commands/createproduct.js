module.exports = {
    aliases: [],
	async run(client, message, args, sendError) {
        const Discord = require("discord.js");
        let name = ''
        let description = ''
        let productid = ''
        let file = ''

        if(!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('❌ You need the `Administrator` permission to run this command.')

        //Ensure Products
        await client.products.ensure(message.guild.id, {})
        let currentproducts = await client.products.get(message.guild.id)

        //Prompts
        try{
            //Prompt 1
            await message.channel.send('> **Part 1**\n> What should the product be named?\n> Note: This can not be modified after product creation.\n> Enter `cancel` to cancel.')
            let prompt1 = await message.channel.awaitMessages(m => m.author.id == message.author.id, {max: 1, time: 1800000})
            //Verify Product Doesn't Exist
            if(!prompt1.first().content){
                message.channel.send('Sorry, but your response must contain text. Please restart the command.')
                return
            }
            else if(currentproducts[prompt1.first().content]){
                message.channel.send('A product already exists under this name. Please try another name.')
                return
            }
            else if(prompt1.first().content.length > 30) {
                message.channel.send('Sorry, but your response must be under 30 characters. Please restart the command.')
                return
            }
            else if (prompt1.first().content.toLowerCase() == 'cancel') {
                return message.channel.send('**Product Creation Canceled**')
            }
            else{
                name = prompt1.first().content
            }

            //Prompt 2
            await message.channel.send('> **Part 2**\n> What should the product description be?\n> Enter `cancel` to cancel.')
            let prompt2 = await message.channel.awaitMessages(m => m.author.id == message.author.id, {max: 1, time: 1800000})
            if(!prompt2.first().content){
                message.channel.send('Sorry, but your response must contain text. Please restart the command.')
                return
            }
            else if(prompt2.first().content.length > 2000) {
                message.channel.send('Sorry, but your response must be under 2000 characters. Please restart the command.')
                return
            }
            else if (prompt2.first().content.toLowerCase() == 'cancel') {
                return message.channel.send('**Product Creation Canceled**')
            }
            else{
                description = prompt2.first().content
            }

            //Prompt 3
            await message.channel.send('> **Part 3**\n> What is the developer product ID?\n> https://developer.roblox.com/en-us/articles/Developer-Products-In-Game-Purchases\n> Enter `cancel` to cancel.')
            let prompt3 = await message.channel.awaitMessages(m => m.author.id == message.author.id, {max: 1, time: 1800000})
            if(!prompt3.first().content){
                message.channel.send('Sorry, but your response must contain text. Please restart the command.')
                return
            }
            else if(prompt3.first().content.length > 30) {
                message.channel.send('Sorry, but your response must be under 30 characters. Please restart the command.')
                return
            }
            else if (prompt3.first().content.toLowerCase() == 'cancel') {
                return message.channel.send('**Product Creation Canceled**')
            }
            else{
                productid = prompt3.first().content
            }

            //Prompt 4
            await message.channel.send('> **Part 4**\n> Please send a download link to the product. Make sure this is not a `discordapp.com` link, otherwise the file may be deleted without prior notice.\n> Enter `cancel` to cancel.')
            let prompt4 = await message.channel.awaitMessages(m => m.author.id == message.author.id, {max: 1, time: 1800000})
            if(!prompt4.first().content){
                message.channel.send('Sorry, but your response must contain text. Please restart the command.')
                return
            }
            else if (prompt4.first().content.toLowerCase() == 'cancel') {
                return message.channel.send('**Product Creation Canceled**')
            }
            else{
                file = prompt4.first().content
            }

            //Create Product
            await client.products.ensure(message.guild.id, {})

            await client.products.set(`${message.guild.id}.${name}`, {
                name: name,
                description: description,
                productid: productid,
                file: file
            })

            const embed = new Discord.MessageEmbed()
            .setColor('GREEN')
            .setTitle('New Product')
            .addField('Name', name)
            .addField('Description', description)
            .addField('Developer Product ID', productid)
            .addField('File', file)
            .setTimestamp()
            message.channel.send(embed)

            //Log
            //Ensure data
            await client.guildSettings.ensure(message.guild.id, {
                logchannel: ''
            })

            //Get Channel
            let logchannel = await client.guildSettings.get(`${message.guild.id}.logchannel`)

            if(logchannel){
                //Send Log Message
                try{
                    const logembed = new Discord.MessageEmbed()
                    .setColor(client.config.mainEmbedColor)
                    .setTitle('Product Created')
                    .addField('Name', name)
                    .addField('Description', description)
                    .addField('Developer Product ID', productid)
                    .addField('File', file)
                    .setTimestamp()
                    message.guild.channels.cache.get(logchannel).send(logembed)
                }
                catch(error){
                    message.channel.send('❌ I could not log the action')
                }
            }
        }
        catch(error){
            return message.reply('No answer after 30 minutes, please try the command again.')
        }
    
    }
};