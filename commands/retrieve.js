module.exports = {
  aliases: ['recieve'],
	async run(client, message, args, sendError) {
    const Discord = require("discord.js");
    let productname = args.join(' ')

    if(!productname) return sendError('What product should I retrieve for you? (Case-Sensitive)||retrieve <productname>')

    await client.usersdb.ensure(`${message.author.id}`, {})
    await client.usersdb.ensure(`${message.author.id}.${message.guild.id}`, [])
    await client.products.ensure(message.guild.id, {})

    if(await client.products.get(`${message.guild.id}.${productname}`)){
      let yourproducts = await client.usersdb.get(`${message.author.id}.${message.guild.id}`)
      if(yourproducts.includes(productname)){
        await message.channel.send('Sent.')

        const embed = new Discord.MessageEmbed()
        .setColor('BLACK')
        .setTitle(await client.products.get(`${message.guild.id}.${productname}.name`))
        .addField('Download Link:', await client.products.get(`${message.guild.id}.${productname}.file`))
        .setFooter(message.guild.name, message.guild.iconURL())
    
        await message.member.send(embed).catch(error => { message.channel.send(`❌ I could not send you the file. Make sure you dms are open, and try the command again.`) })
      }else{
        return sendError('You don\'t own this product. If you bought the product, make sure you spelt it correctly (Case-Sensitive).||giveproduct <id> <productname>')
      }
    }else{
      return sendError('That\'s not a valid product. Make sure you spelt it correctly (Case-Sensitive).||giveproduct <id> <productname>')
    }
  }
};