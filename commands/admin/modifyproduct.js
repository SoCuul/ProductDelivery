module.exports = {
    aliases: ['editproduct', 'updateproduct'],
    async run(client, message, args, sendError, getUserInfo) {
        const Discord = require("discord.js");
        let productname = args.join(' ')
  
        if(!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('❌ You need the `Administrator` permission to run this command.')
      
        //Get existing products
        await client.products.ensure(message.guild.id, {})
        let currentproducts = await client.products.get(message.guild.id)

        //Verify Product
        if(!productname) return sendError('What product should be modified?||modifyproduct <productname>')
        if(productname.includes('.')) return sendError('Product names can not contain the `.` character.||modifyproduct <productname>')
        if(!currentproducts[productname]) return sendError('That\'s not a valid product.||modifyproduct <productname>')
  
        //Prompt
        const embed1 = new Discord.MessageEmbed()
        .setColor(client.config.mainEmbedColor)
        .setTitle('Modify Product')
        .setDescription('Please select an option:\n\n1️⃣ Description\n2️⃣ Developer Product ID\n3️⃣ File\n4️⃣ Image\n5️⃣ Toggle Stock\n6️⃣ Modify Stock')
        const msg1 = await message.channel.send(embed1)

        try{
            await msg1.react('1️⃣')
            await msg1.react('2️⃣')
            await msg1.react('3️⃣')
            await msg1.react('4️⃣')
            await msg1.react('5️⃣')
            await msg1.react('6️⃣')
        }
        catch(error){
            message.channel.send('❌ There was an error reacting to the message')
        }

        try{
            const filter = (reaction, user) => {
                return ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'].includes(reaction.emoji.name) && user.id === message.author.id;
            }
            let reactioncollected = await msg1.awaitReactions(filter, { max: 1, time: 120000, errors: ['time'] })

            if(reactioncollected.first().emoji.name === '1️⃣'){
                //Collect message
                const embed2 = new Discord.MessageEmbed()
                .setColor(client.config.mainEmbedColor)
                .setTitle('Modify Description')
                .setDescription(`Please enter a new description for the product.`)
                .setFooter(`Respond with "cancel" to cancel the prompt.`, '')
                await msg1.reactions.removeAll().catch(error => message.channel.send('Could not clear reactions. Continue with the prompt.'));
                await msg1.edit(embed2)

                let messagecollected = await message.channel.awaitMessages(m => m.author.id == message.author.id, {max: 1, time: 600000})
                
                if(messagecollected.first().content.toLowerCase() === 'cancel'){
                    const canceled = new Discord.MessageEmbed()
                    .setColor('RED')
                    .setTitle('Modification Canceled')
                    .setDescription('Please run the command again to restart the prompt.')
                    return message.channel.send(canceled)
                }
                else if(!messagecollected.first().content){
                    const notvalid = new Discord.MessageEmbed()
                    .setColor('RED')
                    .setTitle('Modification Error')
                    .setDescription('The description must contain text.\nPlease run the command again to restart the prompt.')
                    return message.channel.send(notvalid)
                }
                else if(messagecollected.first().content.length > 1024){
                    const toolong = new Discord.MessageEmbed()
                    .setColor('RED')
                    .setTitle('Modification Error')
                    .setDescription('The description has to contain less than 1024 characters.\nPlease run the command again to restart the prompt.')
                    return message.channel.send(toolong)
                }
                else{
                    //Set data to db
                    await client.products.set(`${message.guild.id}.${productname}.description`, messagecollected.first().content)

                    //Notify user
                    const success = new Discord.MessageEmbed()
                    .setColor('GREEN')
                    .setTitle('Modification Success')
                    .addField('Old Description', currentproducts[productname].description)
                    .addField('New Description', messagecollected.first().content)
                    .setTimestamp()
                    message.channel.send(success)

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
                            .setColor('YELLOW')
                            .setTitle('Product Modified')
                            .addField('Product', productname)
                            .addField('Old Description', currentproducts[productname].description)
                            .addField('New Description', messagecollected.first().content)
                            .setTimestamp()
                            message.guild.channels.cache.get(logchannel).send(logembed)
                        }
                        catch(error){
                            message.channel.send('❌ I could not log the action')
                        }
                    }
                }
            }
            else if(reactioncollected.first().emoji.name === '2️⃣'){
                //Collect message
                const embed2 = new Discord.MessageEmbed()
                .setColor(client.config.mainEmbedColor)
                .setTitle('Modify Developer Product ID')
                .setDescription(`Please enter a developer product ID for the product.`)
                .setFooter(`Respond with "cancel" to cancel the prompt.`, '')
                await msg1.reactions.removeAll().catch(error => message.channel.send('Could not clear reactions. Continue with the prompt.'));
                await msg1.edit(embed2)

                let messagecollected = await message.channel.awaitMessages(m => m.author.id == message.author.id, {max: 1, time: 600000})
                
                if(messagecollected.first().content.toLowerCase() === 'cancel'){
                    const canceled = new Discord.MessageEmbed()
                    .setColor('RED')
                    .setTitle('Modification Canceled')
                    .setDescription('Please run the command again to restart the prompt.')
                    return message.channel.send(canceled)
                }
                else if(!messagecollected.first().content){
                    const notvalid = new Discord.MessageEmbed()
                    .setColor('RED')
                    .setTitle('Modification Error')
                    .setDescription('Your response must contain text.\nPlease run the command again to restart the prompt.')
                    return message.channel.send(notvalid)
                }
                else if(messagecollected.first().content.length > 30){
                    const toolong = new Discord.MessageEmbed()
                    .setColor('RED')
                    .setTitle('Modification Error')
                    .setDescription('The ID has to contain less than 30 characters.\nPlease run the command again to restart the prompt.')
                    return message.channel.send(toolong)
                }
                else{
                    //Set data to db
                    await client.products.set(`${message.guild.id}.${productname}.productid`, messagecollected.first().content)

                    //Notify user
                    const success = new Discord.MessageEmbed()
                    .setColor('GREEN')
                    .setTitle('Modification Success')
                    .addField('Old Developer Product ID', currentproducts[productname].productid)
                    .addField('New Developer Product ID', messagecollected.first().content)
                    .setTimestamp()
                    message.channel.send(success)

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
                            .setColor('YELLOW')
                            .setTitle('Product Modified')
                            .addField('Product', productname)
                            .addField('Old Developer Product ID', currentproducts[productname].productid)
                            .addField('New Developer Product ID', messagecollected.first().content)
                            .setTimestamp()
                            message.guild.channels.cache.get(logchannel).send(logembed)
                        }
                        catch(error){
                            message.channel.send('❌ I could not log the action')
                        }
                    }
                }
            }
            else if(reactioncollected.first().emoji.name === '3️⃣'){
                //Collect message
                const embed2 = new Discord.MessageEmbed()
                .setColor(client.config.mainEmbedColor)
                .setTitle('Modify File')
                .setDescription(`Please enter a new file for the product.`)
                .setFooter(`Respond with "cancel" to cancel the prompt.`, '')
                await msg1.reactions.removeAll().catch(error => message.channel.send('Could not clear reactions. Continue with the prompt.'));
                await msg1.edit(embed2)

                let messagecollected = await message.channel.awaitMessages(m => m.author.id == message.author.id, {max: 1, time: 600000})
                
                if(messagecollected.first().content.toLowerCase() === 'cancel'){
                    const canceled = new Discord.MessageEmbed()
                    .setColor('RED')
                    .setTitle('Modification Canceled')
                    .setDescription('Please run the command again to restart the prompt.')
                    return message.channel.send(canceled)
                }
                else if(!messagecollected.first().content){
                    const notvalid = new Discord.MessageEmbed()
                    .setColor('RED')
                    .setTitle('Modification Error')
                    .setDescription('Your response must contain text.\nPlease run the command again to restart the prompt.')
                    return message.channel.send(notvalid)
                }
                else if(messagecollected.first().content.length > 1024) {
                    const notvalid = new Discord.MessageEmbed()
                    .setColor('RED')
                    .setTitle('Modification Error')
                    .setDescription('Your response must contain less than 1024 characters.\nPlease run the command again to restart the prompt.')
                    return message.channel.send(notvalid)
                }
                else{
                    //Set data to db
                    await client.products.set(`${message.guild.id}.${productname}.file`, messagecollected.first().content)

                    //Notify user
                    const success = new Discord.MessageEmbed()
                    .setColor('GREEN')
                    .setTitle('Modification Success')
                    .addField('Old File', currentproducts[productname].file)
                    .addField('New File', messagecollected.first().content)
                    .setTimestamp()
                    message.channel.send(success)

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
                            .setColor('YELLOW')
                            .setTitle('Product Modified')
                            .addField('Product', productname)
                            .addField('Old File', currentproducts[productname].file)
                            .addField('New File', messagecollected.first().content)
                            .setTimestamp()
                            message.guild.channels.cache.get(logchannel).send(logembed)
                        }
                        catch(error){
                            message.channel.send('❌ I could not log the action')
                        }
                    }
                }
            }
            else if(reactioncollected.first().emoji.name === '4️⃣'){
                //Collect message
                const embed2 = new Discord.MessageEmbed()
                .setColor(client.config.mainEmbedColor)
                .setTitle('Modify Image')
                .setDescription(`Please enter a new Roblox asset ID for the product image, or \`none\`.`)
                .setFooter(`Respond with "cancel" to cancel the prompt.`, '')
                await msg1.reactions.removeAll().catch(error => message.channel.send('Could not clear reactions. Continue with the prompt.'));
                await msg1.edit(embed2)

                let messagecollected = await message.channel.awaitMessages(m => m.author.id == message.author.id, {max: 1, time: 600000})
                
                if(messagecollected.first().content.toLowerCase() === 'cancel'){
                    const canceled = new Discord.MessageEmbed()
                    .setColor('RED')
                    .setTitle('Modification Canceled')
                    .setDescription('Please run the command again to restart the prompt.')
                    return message.channel.send(canceled)
                }
                else if(!messagecollected.first().content){
                    const notvalid = new Discord.MessageEmbed()
                    .setColor('RED')
                    .setTitle('Modification Error')
                    .setDescription('Your response must contain text.\nPlease run the command again to restart the prompt.')
                    return message.channel.send(notvalid)
                }
                else if(messagecollected.first().content.length > 30){
                    const toolong = new Discord.MessageEmbed()
                    .setColor('RED')
                    .setTitle('Modification Error')
                    .setDescription('The asset ID has to contain less than 30 characters.\nPlease run the command again to restart the prompt.')
                    return message.channel.send(toolong)
                }
                else if(messagecollected.first().content.toLowerCase() === 'none'){
                    //Set data to db
                    await client.products.set(`${message.guild.id}.${productname}.image`, '')

                    //Notify user
                    const success = new Discord.MessageEmbed()
                    .setColor('GREEN')
                    .setTitle('Modification Success')
                    .addField('Old Asset ID', currentproducts[productname].image || 'None')
                    .addField('New Asset ID', 'None')
                    .setTimestamp()
                    message.channel.send(success)

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
                            .setColor('YELLOW')
                            .setTitle('Product Modified')
                            .addField('Product', productname)
                            .addField('Old Asset ID', currentproducts[productname].image || 'None')
                            .addField('New Asset ID', 'None')
                            .setTimestamp()
                            message.guild.channels.cache.get(logchannel).send(logembed)
                        }
                        catch(error){
                            message.channel.send('❌ I could not log the action')
                        }
                    }
                }
                else{
                    //Set data to db
                    await client.products.set(`${message.guild.id}.${productname}.image`, messagecollected.first().content)

                    //Notify user
                    const success = new Discord.MessageEmbed()
                    .setColor('GREEN')
                    .setTitle('Modification Success')
                    .addField('Old Asset ID', currentproducts[productname].image || 'None')
                    .addField('New Asset ID', messagecollected.first().content)
                    .setTimestamp()
                    message.channel.send(success)

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
                            .setColor('YELLOW')
                            .setTitle('Product Modified')
                            .addField('Product', productname)
                            .addField('Old Asset ID', currentproducts[productname].image || 'None')
                            .addField('New Asset ID', messagecollected.first().content)
                            .setTimestamp()
                            message.guild.channels.cache.get(logchannel).send(logembed)
                        }
                        catch(error){
                            message.channel.send('❌ I could not log the action')
                        }
                    }
                }
            }
            else if(reactioncollected.first().emoji.name === '5️⃣'){
                //Check data from DB
                let enabled = currentproducts[productname].stock ? true : false

                if(enabled){
                    //Toggle data
                    await client.products.set(`${message.guild.id}.${productname}.stock`, false)

                    //Notify user
                    const success = new Discord.MessageEmbed()
                    .setColor('GREEN')
                    .setTitle('Modification Success')
                    .setDescription('Product stock has been toggled **off**.')
                    .setTimestamp()
                    message.channel.send(success)

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
                            .setColor('YELLOW')
                            .setTitle('Product Modified')
                            .addField('Product', productname)
                            .setDescription('Product stock has been toggled **off**.')
                            .setTimestamp()
                            message.guild.channels.cache.get(logchannel).send(logembed)
                        }
                        catch(error){
                            message.channel.send('❌ I could not log the action')
                        }
                    }
                }
                else{
                    //Toggle data
                    await client.products.set(`${message.guild.id}.${productname}.stock`, true)

                    //Notify user
                    const success = new Discord.MessageEmbed()
                    .setColor('GREEN')
                    .setTitle('Modification Success')
                    .setDescription('Product stock has been toggled **on**.')
                    .setTimestamp()
                    message.channel.send(success)

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
                            .setColor('YELLOW')
                            .setTitle('Product Modified')
                            .addField('Product', productname)
                            .setDescription('Product stock has been toggled **on**.')
                            .setTimestamp()
                            message.guild.channels.cache.get(logchannel).send(logembed)
                        }
                        catch(error){
                            message.channel.send('❌ I could not log the action')
                        }
                    }
                }
            }
            else if(reactioncollected.first().emoji.name === '6️⃣'){
                //Collect message
                const embed2 = new Discord.MessageEmbed()
                .setColor(client.config.mainEmbedColor)
                .setTitle('Modify Stock')
                .setDescription(`Please enter a new stock amount.`)
                .setFooter(`Respond with "cancel" to cancel the prompt.`, '')
                await msg1.reactions.removeAll().catch(error => message.channel.send('Could not clear reactions. Continue with the prompt.'));
                await msg1.edit(embed2)

                let messagecollected = await message.channel.awaitMessages(m => m.author.id == message.author.id, {max: 1, time: 600000})

                if(messagecollected.first().content.toLowerCase() === 'cancel'){
                    const canceled = new Discord.MessageEmbed()
                    .setColor('RED')
                    .setTitle('Modification Canceled')
                    .setDescription('Please run the command again to restart the prompt.')
                    return message.channel.send(canceled)
                }
                else if(!messagecollected.first().content || isNaN(messagecollected.first().content)){
                    const notvalid = new Discord.MessageEmbed()
                    .setColor('RED')
                    .setTitle('Modification Error')
                    .setDescription('Your response must be a number.\nPlease run the command again to restart the prompt.')
                    return message.channel.send(notvalid)
                }
                else if(Number(messagecollected.first().content) > 1000){
                    const notvalid = new Discord.MessageEmbed()
                    .setColor('RED')
                    .setTitle('Modification Error')
                    .setDescription('Your response must be a number under 1000.\nPlease run the command again to restart the prompt.')
                    return message.channel.send(notvalid)
                }
                else if(Number(messagecollected.first().content) < 0){
                    const notvalid = new Discord.MessageEmbed()
                    .setColor('RED')
                    .setTitle('Modification Error')
                    .setDescription('Your response must be a positive number.\nPlease run the command again to restart the prompt.')
                    return message.channel.send(notvalid)
                }
                else{
                    //Set data to db
                    await client.products.set(`${message.guild.id}.${productname}.stockamount`, Number(messagecollected.first().content))

                    //Notify user
                    const success = new Discord.MessageEmbed()
                    .setColor('GREEN')
                    .setTitle('Modification Success')
                    .addField('Old Amount', currentproducts[productname].stockamount)
                    .addField('New Amount', messagecollected.first().content)
                    .setTimestamp()
                    message.channel.send(success)

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
                            .setColor('YELLOW')
                            .setTitle('Product Modified')
                            .addField('Product', productname)
                            .addField('Old Stock Amount', currentproducts[productname].stockamount)
                            .addField('New Stock Amount', messagecollected.first().content)
                            .setTimestamp()
                            message.guild.channels.cache.get(logchannel).send(logembed)
                        }
                        catch(error){
                            message.channel.send('❌ I could not log the action')
                        }
                    }
                }
            }
        }
        catch(error){
            const errorembed = new Discord.MessageEmbed()
            .setColor('RED')
            .setTitle('Modification Timed Out')
            .setDescription('Please run the command again to restart the prompt.')
            await msg1.reactions.removeAll().catch(error => message.channel.send('Could not clear reactions.'));
            await msg1.edit(errorembed)
        }
    }
};