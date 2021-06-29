module.exports = {
    aliases: ['removeproduct', 'takeproduct'],
	async run(client, message, args, sendError, getUserInfo, getRobloxInfo) {
        const Discord = require("discord.js");
        let productname = args.slice(1).join(' ')

        if(!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('❌ You need the `Administrator` permission to run this command.')

        if(!args[0] && !message.mentions.users.first()) return sendError('What\'s the Roblox ID/mention of the person to revoke the product from?||revokeproduct <robloxid/mention> <productname>')
        if(!productname) return sendError('What is the product\'s name? (Case-Sensitive)||revokeproduct <robloxid/mention> <productname>')
        if(productname.includes('.')) return sendError('Product names can not contain the `.` character.||revokeproduct <robloxid/mention> <productname>')

        //Check Verification
        let userInfo = message.mentions.users.first() ?  await getRobloxInfo(message.mentions.users.first().id) : await getUserInfo(args[0])
        if(!userInfo.verified) return sendError('That\'s not a valid user. Make sure the ID is correct and that the user is verified.||revokeproduct <robloxid/mention> <productname>')

        await client.usersdb.ensure(`${userInfo.robloxID}`, {})
        await client.usersdb.ensure(`${userInfo.robloxID}.${message.guild.id}`, [])
        await client.products.ensure(message.guild.id, {})

        if(await client.products.get(`${message.guild.id}.${productname}`)){
            let theirproducts = await client.usersdb.get(`${userInfo.robloxID}.${message.guild.id}`)

            if(theirproducts.includes(productname)){
                await client.usersdb.remove(`${userInfo.robloxID}.${message.guild.id}`, productname)

                const embed = new Discord.MessageEmbed()
                .setColor('RED')
                .setTitle('Product Revoked')
                .addField('Roblox User', `${userInfo.robloxUsername} (${userInfo.robloxID})`)
                .addField('Discord User', `<@${userInfo.discordID}> (${userInfo.discordID})`)
                .addField('Product', productname)
                .setThumbnail(`https://www.roblox.com/headshot-thumbnail/image?userId=${userInfo.robloxID}&width=420&height=420&format=png`)
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
                        .setColor('RED')
                        .setTitle('Product Revoked')
                        .addField('Roblox User', `${userInfo.robloxUsername} (${userInfo.robloxID})`)
                        .addField('Discord User', `<@${userInfo.discordID}> (${userInfo.discordID})`)
                        .addField('Product', productname)
                        .setThumbnail(`https://www.roblox.com/headshot-thumbnail/image?userId=${userInfo.robloxID}&width=420&height=420&format=png`)
                        .setTimestamp()
                        message.guild.channels.cache.get(logchannel).send(logembed)
                    }
                    catch(error){
                        message.channel.send('❌ I could not log the action')
                    }
                }
            }else{
                return sendError('This user doesn\'t own this product.||revokeproduct <robloxid/mention> <productname>')
            }
        }else{
            return sendError('That\'s not a valid product. Make sure you spelt it correctly (Case-Sensitive).||revokeproduct <robloxid/mention> <productname>')
        }
    }
};