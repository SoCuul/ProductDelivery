module.exports = {
  aliases: ['makeproduct'],
	async run(client, message, args, sendError) {
    const Discord = require("discord.js");
    let productname = args.join(' ')

    if(!message.member.hasPermission('ADMINISTRATOR')){
      return message.channel.send('❌ You need the `Administrator` permission to run this command.')
    }

    if(!productname) return sendError('What product should I delete? (Case-Sensitive)||deleteproduct <productname>')

    await client.products.ensure(message.guild.id, {})

    if(await client.products.get(`${message.guild.id}.${productname}`)){

      const embed = new Discord.MessageEmbed()
      .setColor('RED')
      .setTitle('Product Deleted')
      .addField('Name', await client.products.get(`${message.guild.id}.${productname}.name`))
      .addField('File', await client.products.get(`${message.guild.id}.${productname}.file`))
      await message.channel.send(embed)

      await client.products.delete(`${message.guild.id}.${productname}`)
    }else{
      return sendError('That\'s not a valid product. Make sure you spelt it correctly (Case-Sensitive).||deleteproduct <name>')
    }
  }
};