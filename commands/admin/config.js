module.exports = {
    aliases: ['settings', 'configuration'],
    async run(client, message, args, sendError, getUserInfo) {
        const Discord = require("discord.js");
  
        if(!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('❌ You need the `Administrator` permission to run this command.')
      
        //Ensure data
        const defaultSettings = {
        prefix: client.config.defaultPrefix,
        token: '',
        logchannel: '',
        }
        await client.guildSettings.ensure(message.guild.id, defaultSettings)

        //Settings fetching code
        let settings = await client.guildSettings.get(message.guild.id)
  
        if(args[0] === 'modify'){
            //Prompt
            const embed1 = new Discord.MessageEmbed()
            .setColor(client.config.mainEmbedColor)
            .setTitle(client.config.botName + ' Configuration')
            .setDescription('Please select an option:\n\n1️⃣ Prefix\n2️⃣ Token\n3️⃣ Log Channel')
            const msg1 = await message.channel.send(embed1)

            try{
                await msg1.react('1️⃣')
                await msg1.react('2️⃣')
                await msg1.react('3️⃣')
            }
            catch(error){
                message.channel.send('❌ There was an error reacting to the message')
            }

            try{
                const filter = (reaction, user) => {
                    return ['1️⃣', '2️⃣', '3️⃣'].includes(reaction.emoji.name) && user.id === message.author.id;
                }
                let reactioncollected = await msg1.awaitReactions(filter, { max: 1, time: 120000, errors: ['time'] })

                if(reactioncollected.first().emoji.name === '1️⃣'){
                    //Collect message
                    const embed2 = new Discord.MessageEmbed()
                    .setColor(client.config.mainEmbedColor)
                    .setTitle(client.config.botName + ' Prefix Configuration')
                    .setDescription(`Please enter a new server prefix.`)
                    .setFooter(`Respond with "cancel" to cancel the prompt.`, '')
                    await msg1.reactions.removeAll().catch(error => message.channel.send('Could not clear reactions. Continue with the prompt.'));
                    await msg1.edit(embed2)

                    let messagecollected = await message.channel.awaitMessages(m => m.author.id == message.author.id, {max: 1, time: 600000})
                    
                    if(!messagecollected.first().content){
                        const notvalid = new Discord.MessageEmbed()
                        .setColor('RED')
                        .setTitle('Modification Error')
                        .setDescription('The response must contain text.\nPlease run the command again to restart the prompt.')
                        return message.channel.send(notvalid)
                    }
                    else if(messagecollected.first().content.toLowerCase() === 'cancel'){
                        const canceled = new Discord.MessageEmbed()
                        .setColor('RED')
                        .setTitle(client.config.botName + ' Configuration Canceled')
                        .setDescription('Please run the command again to restart the prompt.')
                        return message.channel.send(canceled)
                    }
                    else if(messagecollected.first().content.length > 20){
                        const toolong = new Discord.MessageEmbed()
                        .setColor('RED')
                        .setTitle(client.config.botName + ' Configuration Error')
                        .setDescription('The prefix has to contain less than 20 characters.\nPlease run the command again to restart the prompt.')
                        return message.channel.send(toolong)
                    }else{
                        //Set data to db
                        await client.guildSettings.set(`${message.guild.id}.prefix`, messagecollected.first().content)

                        //Notify user
                        const success = new Discord.MessageEmbed()
                        .setColor('GREEN')
                        .setTitle(client.config.botName + ' Configuration Success')
                        .setDescription(`The bot will now respond to messages starting with \`${messagecollected.first().content}\`.`)
                        return message.channel.send(success)
                    }
                }
                else if(reactioncollected.first().emoji.name === '2️⃣'){
                    //Collect message
                    const embed2 = new Discord.MessageEmbed()
                    .setColor(client.config.mainEmbedColor)
                    .setTitle(client.config.botName + ' Token Configuration')
                    .setDescription(`Please enter a custom API token that will be used to authenticate guild-specific API requests or \`none\`.`)
                    .setFooter(`Respond with "cancel" to cancel the prompt.`, '')
                    await msg1.reactions.removeAll().catch(error => message.channel.send('Could not clear reactions. Continue with the prompt.'));
                    await msg1.edit(embed2)

                    let messagecollected = await message.channel.awaitMessages(m => m.author.id == message.author.id, {max: 1, time: 600000})
                    
                    if(!messagecollected.first().content){
                        const notvalid = new Discord.MessageEmbed()
                        .setColor('RED')
                        .setTitle('Modification Error')
                        .setDescription('The response must contain text.\nPlease run the command again to restart the prompt.')
                        return message.channel.send(notvalid)
                    }
                    else if(messagecollected.first().content.toLowerCase() === 'cancel'){
                        const canceled = new Discord.MessageEmbed()
                        .setColor('RED')
                        .setTitle(client.config.botName + ' Configuration Canceled')
                        .setDescription('Please run the command again to restart the prompt.')
                        return message.channel.send(canceled)
                    }
                    else if(messagecollected.first().content.toLowerCase() === 'none'){
                        const success = new Discord.MessageEmbed()
                        .setColor('GREEN')
                        .setTitle(client.config.botName + ' Configuration Success')
                        .setDescription('Guild-specific API requests have been disabled.')
                        await client.guildSettings.delete(`${message.guild.id}.token`)
                        return message.channel.send(success)
                    }
                    else if(messagecollected.first().content.length > 100){
                        const toolong = new Discord.MessageEmbed()
                        .setColor('RED')
                        .setTitle(client.config.botName + ' Configuration Error')
                        .setDescription('The token has to contain less than 100 characters.\nPlease run the command again to restart the prompt.')
                        return message.channel.send(toolong)
                    }else{
                        //Set data to db
                        await client.guildSettings.set(`${message.guild.id}.token`, messagecollected.first().content)

                        //Notify user
                        const success = new Discord.MessageEmbed()
                        .setColor('GREEN')
                        .setTitle(client.config.botName + ' Configuration Success')
                        .setDescription(`The bot will only allow guild-specific API requests with the \`${messagecollected.first().content}\` token.`)
                        return message.channel.send(success)
                    }
                }
                else if(reactioncollected.first().emoji.name === '3️⃣'){
                    //Collect message
                    const embed2 = new Discord.MessageEmbed()
                    .setColor(client.config.mainEmbedColor)
                    .setTitle(client.config.botName + ' Log Channel Configuration')
                    .setDescription(`Please ping which channel you would like to use for logs or \`none\`.`)
                    .setFooter(`Respond with "cancel" to cancel the prompt.`, '')
                    await msg1.reactions.removeAll().catch(error => message.channel.send('Could not clear reactions. Continue with the prompt.'));
                    await msg1.edit(embed2)

                    let messagecollected = await message.channel.awaitMessages(m => m.author.id == message.author.id, {max: 1, time: 600000})
                    
                    if(!messagecollected.first().content){
                        const notvalid = new Discord.MessageEmbed()
                        .setColor('RED')
                        .setTitle('Modification Error')
                        .setDescription('The response must contain text.\nPlease run the command again to restart the prompt.')
                        return message.channel.send(notvalid)
                    }
                    else if(messagecollected.first().content.toLowerCase() === 'cancel'){
                        const canceled = new Discord.MessageEmbed()
                        .setColor('RED')
                        .setTitle(client.config.botName + ' Configuration Canceled')
                        .setDescription('Please run the command again to restart the prompt.')
                        return message.channel.send(canceled)
                    }
                    else if(messagecollected.first().content.toLowerCase() === 'none'){
                        const success = new Discord.MessageEmbed()
                        .setColor('GREEN')
                        .setTitle(client.config.botName + ' Configuration Success')
                        .setDescription('The bot will not send logs to any channel.')
                        await client.guildSettings.delete(`${message.guild.id}.logchannel`)
                        return message.channel.send(success)
                    }
                    else if(!messagecollected.first().mentions.channels.first() || messagecollected.first().mentions.channels.first().guild.id !== message.guild.id){
                        const nochannel = new Discord.MessageEmbed()
                        .setColor('RED')
                        .setTitle(client.config.botName + ' Configuration Error')
                        .setDescription('No channel was mentioned.\nPlease run the command again to restart the prompt.')
                        return message.channel.send(nochannel)
                    }else{
                        //Set data to db
                        await client.guildSettings.set(`${message.guild.id}.logchannel`, messagecollected.first().mentions.channels.first().id)

                        //Notify user
                        const success = new Discord.MessageEmbed()
                        .setColor('GREEN')
                        .setTitle(client.config.botName + ' Configuration Success')
                        .setDescription(`The bot will send logs to the <#${messagecollected.first().mentions.channels.first().id}> channel.`)
                        return message.channel.send(success)
                    }
                }
            }
            catch(error){
                const errorembed = new Discord.MessageEmbed()
                .setColor('RED')
                .setTitle(client.config.botName + ' Configuration Timed Out')
                .setDescription('Please run the command again to restart the prompt.')
                await msg1.reactions.removeAll().catch(error => message.channel.send('Could not clear reactions.'));
                await msg1.edit(errorembed)
            }
        }else{
            const embed = new Discord.MessageEmbed()
            .setColor(client.config.mainEmbedColor)
            .setTitle(client.config.botName + ' Configuration')
            .setDescription(`Run \`${settings.prefix}config modify\` to modify your settings.`)
            .addField('Prefix', `\`${settings.prefix}\``)
            .addField('Token', settings.token ? `\`${settings.token}\`` : 'None')
            .addField('Log Channel', settings.logchannel ? `<#${settings.logchannel}>` : 'None')
            .setTimestamp()
            return message.channel.send(embed)
        }
    }
};