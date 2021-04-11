module.exports = {
  aliases: [],
	async run(client, message, args, sendError) {
    const Discord = require("discord.js");

    await client.products.ensure(message.guild.id, {})
    let allproducts = await client.products.get(message.guild.id)

    let productnames = []
    for (key in allproducts) {
      productnames.push(allproducts[key].name)
    }

    const embed = new Discord.MessageEmbed()
    .setColor('BLACK')
    .setTitle('Products')
    .setDescription(productnames.join('\n') || '**None**')
    .setTimestamp()
    message.channel.send(embed)
  }
};