module.exports = {
  aliases: [],
	async run(client, message, args, sendError) {
    const Discord = require("discord.js");
    let name = ''
    let file = ''
    let status = ''

    if(!message.member.hasPermission('ADMINISTRATOR')){
      return message.channel.send('❌ You need the `Administrator` permission to run this command.')
    }

    async function part1(){
      await message.channel.send('> **Part 1**\n> What should the product be named?\n> Enter `cancel` to cancel.')
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
          name = collected.first().content
        }
      }).catch(() => {
        message.reply('No answer after 30 minutes, please try the command again.');
        status = 1
      })
    }
    async function part2(){
      await message.channel.send('> **Part 2**\n> Please send a download link to the product. Make sure this is not a `discordapp.com` link, otherwise the file may be deleted without prior notice.\n> Enter `cancel` to cancel.')
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
        file: file
      });

      const embed = new Discord.MessageEmbed()
      .setColor('GREEN')
      .setTitle('New Product')
      .addField('Name', name)
      .addField('File', file)
      message.channel.send(embed)
    }

    async function main(){
			await part1()
			if(status) return
			await part2()
			if(status) return
			await final()
			if(status) return
			}

			main()
  }
};