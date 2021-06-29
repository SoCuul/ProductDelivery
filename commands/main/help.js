module.exports = {
    aliases: [],
	async run(client, message, args, sendError) {
        const Discord = require("discord.js");

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
            { name: '\u200b\n**Main Commands**', value: `Products \`${prefix}products\`\nSearch Products \`${prefix}searchproducts\`\nYour Profile \`${prefix}profile\`\nRetrieve Product \`${prefix}retrieve\`\nLink Account \`${prefix}link\`\nUnlink Account \`${prefix}unlink\`\n\u200b` },
            { name: '\u200b\n**Admin Commands**', value: `Product Information \`${prefix}productinfo\`\nCreate Product \`${prefix}createproduct\`\nDelete Product \`${prefix}deleteproduct\`\nModify Product \`${prefix}modifyproduct\`\nGive Product \`${prefix}giveproduct\`\nRevoke Product \`${prefix}revokeproduct\`\nTransfer Product \`${prefix}transferproduct\`\nMerge Account \`${prefix}mergeaccount\`\nConfiguration \`${prefix}config\`\n\u200b` },
            { name: '\u200b\n**Other Commands**', value: `Product Embed \`${prefix}productembed\`\n\u200b` })
        .setTimestamp()
        if(client.config.showHelpImage) embed.setThumbnail(client.user.avatarURL())
        message.channel.send(embed)
    }
};