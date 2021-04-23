module.exports = {
  aliases: [],
	async run(client, message, args, sendError) {
    const Discord = require("discord.js");
    let name = ''
    let description = ''
    let productid = ''
    let file = ''
    let status = ''

    if(!message.member.hasPermission('ADMINISTRATOR')){
      return message.channel.send('❌ You need the `Administrator` permission to run this command.')
    }

    //Get existing products
    await client.products.ensure(message.guild.id, {})
    let currentproducts = await client.products.get(message.guild.id)

    async function part1(){
      await message.channel.send('> **Part 1**\n> What should the product be named?\n> Enter `cancel` to cancel.')
      await message.channel.awaitMessages(m => m.author.id == message.author.id,
      {max: 1, time: 1800000}).then(collected => {
        //Verify Product Doesn't Exist
        if(currentproducts[collected.first().content]){
          message.channel.send('A product already exists under this name. Please try another name.')
          status = 1
          return
        }else if(collected.first().content.length > 30) {
          message.channel.send('Sorry, but your response must be under 30 characters. Please restart the command.')
          status = 1
          return
        }else if (collected.first().content.toLowerCase() == 'cancel') {
          message.channel.send('**Product Creation Canceled**')
          status = 1
          return
        }else{
          name = collected.first().content
        }
      }).catch((error) => {
        console.log(error)
        message.reply('No answer after 30 minutes, please try the command again.');
        status = 1
      })
    }
    async function part2(){
      await message.channel.send('> **Part 2**\n> What should the product description be?\n> Enter `cancel` to cancel.')
      await message.channel.awaitMessages(m => m.author.id == message.author.id,
      {max: 1, time: 1800000}).then(collected => {
        if(collected.first().content.length > 2000) {
          message.channel.send('Sorry, but your response must be under 2000 characters. Please restart the command.')
          status = 1
          return
        }else if (collected.first().content.toLowerCase() == 'cancel') {
          message.channel.send('**Product Creation Canceled**')
          status = 1
          return
        }else{
          description = collected.first().content
        }
      }).catch(() => {
        message.reply('No answer after 30 minutes, please try the command again.');
        status = 1
      })
    }
    async function part3(){
      await message.channel.send('> **Part 3**\n> What is the developer product ID?\n> https://developer.roblox.com/en-us/articles/Developer-Products-In-Game-Purchases\n> Enter `cancel` to cancel.')
      await message.channel.awaitMessages(m => m.author.id == message.author.id,
      {max: 1, time: 1800000}).then(collected => {
        if(collected.first().content.length > 30) {
          message.channel.send('Sorry, but your response must be under 30 characters. Please restart the command.')
          status = 1
          return
        }else if (collected.first().content.toLowerCase() == 'cancel') {
          message.channel.send('**Product Creation Canceled**')
          status = 1
          return
        }else{
          productid = collected.first().content
        }
      }).catch(() => {
        message.reply('No answer after 30 minutes, please try the command again.');
        status = 1
      })
    }
    async function part4(){
      await message.channel.send('> **Part 4**\n> Please send a download link to the product. Make sure this is not a `discordapp.com` link, otherwise the file may be deleted without prior notice.\n> Enter `cancel` to cancel.')
      await message.channel.awaitMessages(m => m.author.id == message.author.id,
      {max: 1, time: 1800000}).then(collected => {
        if (collected.first().content.toLowerCase() == 'cancel') {
          message.channel.send('**Product Creation Canceled**')
          status = 1
          return
        }else{
          file = collected.first().content
        }
      }).catch(() => {
        message.reply('No answer after 30 minutes, please try the command again.');
        status = 1
      })
    }
    async function final(){
      await client.products.ensure(message.guild.id, {})

      await client.products.set(`${message.guild.id}.${name}`, {
        name: name,
        description: description,
        productid: productid,
        file: file
      });

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

    async function main(){
			await part1()
			if(status) return
			await part2()
			if(status) return
      await part3()
			if(status) return
      await part4()
			if(status) return
			await final()
			if(status) return
			}

			main()
  }
};