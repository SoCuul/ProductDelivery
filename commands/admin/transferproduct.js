module.exports = {
    aliases: [],
	async run(client, message, args, sendError, getUserInfo, getRobloxInfo) {
        const Discord = require("discord.js");
        let mentions = message.mentions.users.first(2)
        let productname = args.slice(2).join(' ')

        if(!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('❌ You need the `Administrator` permission to run this command.')

        if(!args[0] && !mentions[0]) return sendError('What\'s the Roblox ID/mention of the source user?||transferproduct <source robloxid/mention> <target robloxid/mention> <productname>')
        if(!args[1] && !mentions[1]) return sendError('What\'s the Roblox ID/mention of the target user?||transferproduct <source robloxid/mention> <target robloxid/mention> <productname>')
        
        if(!productname) return sendError('What is the product\'s name? (Case-Sensitive)||transferproduct <source robloxid/mention> <target robloxid/mention> <productname>')
        if(productname.includes('.')) return sendError('Product names can not contain the `.` character.||transferproduct <source robloxid/mention> <target robloxid/mention> <productname>')

        //Check Verification
        //Source
        let userInfo1 = mentions[0] ?  await getRobloxInfo(mentions[0].id) : await getUserInfo(args[0])
        if(!userInfo1.verified) return sendError('That\'s not a valid source user. Make sure the ID is correct and that the user is verified.||transferproduct <source robloxid/mention> <target robloxid/mention> <productname>')
        //Target
        let userInfo2 = mentions[1] ?  await getRobloxInfo(mentions[1].id) : await getUserInfo(args[1])
        if(!userInfo2.verified) return sendError('That\'s not a valid target user. Make sure the ID is correct and that the user is verified.||transferproduct <source robloxid/mention> <target robloxid/mention> <productname>')

        //Source ensure
        await client.usersdb.ensure(`${userInfo1.robloxID}`, {})
        await client.usersdb.ensure(`${userInfo1.robloxID}.${message.guild.id}`, [])
        //Target ensure
        await client.usersdb.ensure(`${userInfo2.robloxID}`, {})
        await client.usersdb.ensure(`${userInfo2.robloxID}.${message.guild.id}`, [])

        //Get product arrays
        let sourceproducts = await client.usersdb.get(`${userInfo1.robloxID}.${message.guild.id}`)
        let targetproducts = await client.usersdb.get(`${userInfo2.robloxID}.${message.guild.id}`)

        await client.products.ensure(message.guild.id, {})

        if(await client.products.get(`${message.guild.id}.${productname}`)){
            //Check for products
            if(sourceproducts.includes(productname)){
                if(targetproducts.includes(productname)) return sendError('The target user already owns the product.||transferproduct <source robloxid/mention> <target robloxid/mention> <productname>')

                await client.usersdb.push(`${userInfo2.robloxID}.${message.guild.id}`, productname)
                await client.usersdb.remove(`${userInfo1.robloxID}.${message.guild.id}`, productname)

                const embed = new Discord.MessageEmbed()
                .setColor('AQUA')
                .setTitle('Product Transfered')
                .addField('Source User', `**Roblox**: ${userInfo1.robloxUsername} (${userInfo1.robloxID})\n**Discord**: <@${userInfo1.discordID}> (${userInfo1.discordID})`)
                .addField('Target User', `**Roblox**: ${userInfo2.robloxUsername} (${userInfo2.robloxID})\n**Discord**: <@${userInfo2.discordID}> (${userInfo2.discordID})`)
                .addField('Product', productname)
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
                        .setTitle('Product Transfered')
                        .addField('Source User', `**Roblox**: ${userInfo1.robloxUsername} (${userInfo1.robloxID})\n**Discord**: <@${userInfo1.discordID}> (${userInfo1.discordID})`)
                        .addField('Target User', `**Roblox**: ${userInfo2.robloxUsername} (${userInfo2.robloxID})\n**Discord**: <@${userInfo2.discordID}> (${userInfo2.discordID})`)
                        .addField('Product', productname)
                        .setTimestamp()
                        message.guild.channels.cache.get(logchannel).send(logembed)
                    }
                    catch(error){
                        message.channel.send('❌ I could not log the action')
                    }
                }
            }
            else{
                return sendError('The source user does not own the product.||transferproduct <source robloxid/mention> <target robloxid/mention> <productname>')
            }
        }else{
            return sendError('That\'s not a valid product. Make sure you spelt it correctly (Case-Sensitive).||transferproduct <source robloxid/mention> <target robloxid/mention> <productname>')
        }
    }
};