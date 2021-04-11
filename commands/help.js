module.exports = {
  aliases: [],
	run(client, message, args, sendError) {
    const Discord = require("discord.js");
    const tick = '`'

    const embed = new Discord.MessageEmbed()
      .setTitle(client.config.botName + ' Help')
      .setColor(client.config.embedColor)
      .addFields(
        { name: '\u200b\n**Main Commands**', value: `Products ${tick}${client.config.prefix}products${tick}\nYour Products ${tick}${client.config.prefix}myproducts${tick}\nRetrieve Product ${tick}${client.config.prefix}retrieve${tick}\n\u200b` },
        { name: '\u200b\n**Admin Commands**', value: `Create Product ${tick}${client.config.prefix}createproduct${tick}\nDelete Product ${tick}${client.config.prefix}deleteproduct${tick}\nGive Product ${tick}${client.config.prefix}giveproduct${tick}\nRevoke Product ${tick}${client.config.prefix}revokeproduct${tick}\n\u200b` })
      .setTimestamp()
    message.channel.send(embed)
  }
};