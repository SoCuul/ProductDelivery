module.exports = {
  aliases: [],
	async run(client, message, args, sendError) {
    const Discord = require("discord.js");
    const tick = '`'

    //Ensure data
    await client.guildSettings.ensure(message.guild.id, {
      prefix: client.config.defaultPrefix
    })

    //Prefix fetching code
    let prefix = await client.guildSettings.get(`${message.guild.id}.prefix`)

    const embed = new Discord.MessageEmbed()
      .setTitle(client.config.botName + ' Help')
      .setColor(client.config.mainEmbedColor)
      .addFields(
        { name: '\u200b\n**Main Commands**', value: `Products ${tick}${prefix}products${tick}\nYour Profile ${tick}${prefix}profile${tick}\nRetrieve Product ${tick}${prefix}retrieve${tick}\nLink Account ${tick}${prefix}link${tick}\n\u200b` },
        { name: '\u200b\n**Admin Commands**', value: `Create Product ${tick}${prefix}createproduct${tick}\nDelete Product ${tick}${prefix}deleteproduct${tick}\nGive Product ${tick}${prefix}giveproduct${tick}\nRevoke Product ${tick}${prefix}revokeproduct${tick}\n\u200b` })
      .setTimestamp()
    message.channel.send(embed)
  }
};