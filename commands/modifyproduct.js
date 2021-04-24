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
        if(!currentproducts[productname]) return sendError('That\'s not a valid product.||modifyproduct <productname>')
  
        //Prompt
        const embed1 = new Discord.MessageEmbed()
        .setColor(client.config.mainEmbedColor)
        .setTitle('Modify Product')
        .setDescription('Please select an option:\n\n1️⃣ Description\n2️⃣ Developer Product ID\n3️⃣ File')
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
                else if(messagecollected.first().content.length > 2000){
                    const toolong = new Discord.MessageEmbed()
                    .setColor('RED')
                    .setTitle('Modification Error')
                    .setDescription('The description has to contain less than 2000 characters.\nPlease run the command again to restart the prompt.')
                    return message.channel.send(toolong)
                }else{
                    //Set data to db
                    await client.products.set(`${message.guild.id}.${productname}.description`, messagecollected.first().content)

                    //Notify user
                    const success = new Discord.MessageEmbed()
                    .setColor('GREEN')
                    .setTitle('Modification Success')
                    .addField('Old Description', currentproducts[productname].description)
                    .addField('New Description', messagecollected.first().content)
                    return message.channel.send(success)
                }
            }
            if(reactioncollected.first().emoji.name === '2️⃣'){
                //Collect message
                const embed2 = new Discord.MessageEmbed()
                .setColor(client.config.mainEmbedColor)
                .setTitle('Modify Developer Product ID')
                .setDescription(`Please enter a developer product id for the product.`)
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
                else if(messagecollected.first().content.length > 30){
                    const toolong = new Discord.MessageEmbed()
                    .setColor('RED')
                    .setTitle('Modification Error')
                    .setDescription('The id has to contain less than 30 characters.\nPlease run the command again to restart the prompt.')
                    return message.channel.send(toolong)
                }else{
                    //Set data to db
                    await client.products.set(`${message.guild.id}.${productname}.productid`, messagecollected.first().content)

                    //Notify user
                    const success = new Discord.MessageEmbed()
                    .setColor('GREEN')
                    .setTitle('Modification Success')
                    .addField('Old Developer Product ID', currentproducts[productname].productid)
                    .addField('New Developer Product ID', messagecollected.first().content)
                    return message.channel.send(success)
                }
            }
            if(reactioncollected.first().emoji.name === '3️⃣'){
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
                }else{
                    //Set data to db
                    await client.products.set(`${message.guild.id}.${productname}.file`, messagecollected.first().content)

                    //Notify user
                    const success = new Discord.MessageEmbed()
                    .setColor('GREEN')
                    .setTitle('Modification Success')
                    .addField('Old File', currentproducts[productname].file)
                    .addField('New File', messagecollected.first().content)
                    return message.channel.send(success)
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