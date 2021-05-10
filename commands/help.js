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
        .setColor(client.config.mainEmbedColor)
        .setTitle(client.config.botName + ' Help')
        .addFields(
            { name: '\u200b\n**Main Commands**', value: `Products ${tick}${prefix}products${tick}\nSearch Products ${tick}${prefix}searchproducts${tick}\nYour Profile ${tick}${prefix}profile${tick}\nRetrieve Product ${tick}${prefix}retrieve${tick}\nLink Account ${tick}${prefix}link${tick}\nUnlink Account ${tick}${prefix}unlink${tick}\n\u200b` },
            { name: '\u200b\n**Admin Commands**', value: `Product Information ${tick}${prefix}productinfo${tick}\nCreate Product ${tick}${prefix}createproduct${tick}\nDelete Product ${tick}${prefix}deleteproduct${tick}\nModify Product ${tick}${prefix}modifyproduct${tick}\nGive Product ${tick}${prefix}giveproduct${tick}\nRevoke Product ${tick}${prefix}revokeproduct${tick}\nConfiguration ${tick}${prefix}config${tick}\n\u200b` })
        .setTimestamp()
        if(client.config.showHelpImage) embed.setThumbnail(client.user.avatarURL())
        message.channel.send(embed)
    }
};