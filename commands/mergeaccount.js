module.exports = {
    aliases: [],
	async run(client, message, args, sendError, getUserInfo, getRobloxInfo) {
        const Discord = require("discord.js");
        let mentions = message.mentions.users.first(2)

        if(!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('❌ You need the `Administrator` permission to run this command.')

        if(!args[0] && !mentions[0]) return sendError('What\'s the Roblox ID/mention of the source user?||mergeaccount <source robloxid/mention> <target robloxid/mention>')
        if(!args[1] && !mentions[1]) return sendError('What\'s the Roblox ID/mention of the target user?||mergeaccount <source robloxid/mention> <target robloxid/mention>')

        //Check Verification
        //Source
        let userInfo1 = mentions[0] ?  await getRobloxInfo(mentions[0].id) : await getUserInfo(args[0])
        if(!userInfo1.verified) return sendError('That\'s not a valid source user. Make sure the ID is correct and that the user is verified.||mergeaccount <source robloxid/mention> <target robloxid/mention>')
        //Target
        let userInfo2 = mentions[1] ?  await getRobloxInfo(mentions[1].id) : await getUserInfo(args[1])
        if(!userInfo2.verified) return sendError('That\'s not a valid target user. Make sure the ID is correct and that the user is verified.||mergeaccount <source robloxid/mention> <target robloxid/mention>')

        //Source ensure
        await client.usersdb.ensure(`${userInfo1.robloxID}`, {})
        await client.usersdb.ensure(`${userInfo1.robloxID}.${message.guild.id}`, [])
        //Target ensure
        await client.usersdb.ensure(`${userInfo2.robloxID}`, {})
        await client.usersdb.ensure(`${userInfo2.robloxID}.${message.guild.id}`, [])

        //Get product arrays
        let sourceproducts = await client.usersdb.get(`${userInfo1.robloxID}.${message.guild.id}`)
        let targetproducts = await client.usersdb.get(`${userInfo2.robloxID}.${message.guild.id}`)

        //Merge products
        for(product in sourceproducts){
            if(!targetproducts.includes(sourceproducts[product])){
                await client.usersdb.push(`${userInfo2.robloxID}.${message.guild.id}`, sourceproducts[product])
            }
        }
        await client.usersdb.delete(`${userInfo1.robloxID}.${message.guild.id}`)

        const embed = new Discord.MessageEmbed()
        .setColor('AQUA')
        .setTitle('Account Merged')
        .setDescription(`Merged **${sourceproducts.length}** products`)
        .addField('Source User', `**Roblox**: ${userInfo1.robloxUsername} (${userInfo1.robloxID})\n**Discord**: <@${userInfo1.discordID}> (${userInfo1.discordID})`)
        .addField('Target User', `**Roblox**: ${userInfo2.robloxUsername} (${userInfo2.robloxID})\n**Discord**: <@${userInfo2.discordID}> (${userInfo2.discordID})`)
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
                .setColor('AQUA')
                .setTitle('Account Merged')
                .setDescription(`Merged **${sourceproducts.length}** products`)
                .addField('Source User', `**Roblox**: ${userInfo1.robloxUsername} (${userInfo1.robloxID})\n**Discord**: <@${userInfo1.discordID}> (${userInfo1.discordID})`)
                .addField('Target User', `**Roblox**: ${userInfo2.robloxUsername} (${userInfo2.robloxID})\n**Discord**: <@${userInfo2.discordID}> (${userInfo2.discordID})`)
                .setTimestamp()
                message.guild.channels.cache.get(logchannel).send(logembed)
            }
            catch(error){
                message.channel.send('❌ I could not log the action')
            }
        }
    }
};