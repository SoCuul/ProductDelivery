module.exports = {
    aliases: ['myproducts'],
    async run(client, message, args, sendError, getUserInfo, getRobloxInfo) {
        const Discord = require("discord.js");
    
        //Ensure data
        await client.guildSettings.ensure(message.guild.id, {
            prefix: client.config.defaultPrefix
        })

        //Prefix fetching code
        let prefix = await client.guildSettings.get(`${message.guild.id}.prefix`)

        if(message.mentions.users.first()){
            var selecteduser = {
                "type": "ping",
                "username": message.mentions.users.first().username,
                "id": message.mentions.users.first().id
            }
        }else{
            var selecteduser = {
                "username": message.author.username,
                "id": message.author.id
            }
        }

        //Check Verification
        let userInfo = await getRobloxInfo(selecteduser.id)

        //Pinged User Unverified 
        if(selecteduser.type === 'ping'){
            const unverified = new Discord.MessageEmbed()
            .setTitle('Unverified')
            .setDescription(`**${selecteduser.username}** has not linked their Roblox account.`)
            if(!userInfo.verified) return message.channel.send(unverified)
        }else{
            //Message Author Unverified
            const unverified = new Discord.MessageEmbed()
            .setTitle('Unverified')
            .setDescription(`There is no Roblox account linked to this Discord account.\nRun the \`${prefix}link\` command to link your Roblox account.`)
            if(!userInfo.verified) return message.channel.send(unverified)
        }

        await client.products.ensure(message.guild.id, {})
        await client.usersdb.ensure(`${userInfo.robloxID}.${message.guild.id}`, [])
        let allproducts = await client.products.get(message.guild.id)
        let myproducts = await client.usersdb.get(`${userInfo.robloxID}.${message.guild.id}`)

        let productnames = []
        for (key in allproducts) {
            productnames.push(allproducts[key].name)
        }

        let myproductnames = []
        for (key in myproducts) {
            if(productnames.includes(myproducts[key])){
                myproductnames.push(myproducts[key])
            }
        }

        const embed = new Discord.MessageEmbed()
        .setColor(client.config.mainEmbedColor)
        .setTitle(`${selecteduser.username}'s Profile`)
        .addField('Roblox Username', userInfo.robloxUsername, true)

        if(client.config.showProfileRobloxID) embed.addField('Roblox ID', userInfo.robloxID, true)

        embed.addField('Products', myproductnames.join('\n') || '**None**', true)
        embed.setThumbnail(`https://www.roblox.com/headshot-thumbnail/image?userId=${userInfo.robloxID}&width=420&height=420&format=png`)
        embed.setTimestamp()
        message.channel.send(embed)
    }
};