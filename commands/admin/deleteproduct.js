module.exports = {
    aliases: ['makeproduct'],
	async run(client, message, args, sendError) {
        const Discord = require("discord.js");
        let productname = args.join(' ')

        if(!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('❌ You need the `Administrator` permission to run this command.')
        
        if(!productname) return sendError('What product should I delete? (Case-Sensitive)||deleteproduct <productname>')
        if(productname.includes('.')) return sendError('Product names can not contain the `.` character.||deleteproduct <productname>')

        //Get product from DB
        await client.products.ensure(message.guild.id, {})
        let product = await client.products.get(`${message.guild.id}.${productname}`)

        if(product){
            //Prompt
            const promptembed = new Discord.MessageEmbed()
            .setColor(client.config.mainEmbedColor)
            .setTitle('Delete Product')
            .setDescription(`Are you sure you would like to delete **${product.name}**?\n\nNote: The product will not be removed from users. If another product is created under the same name, it will appear in the user\'s owned products.`)
            const promptmsg = await message.channel.send(promptembed)

            try{
                await promptmsg.react('✅')
                await promptmsg.react('❌')
            }
            catch(error){
                message.channel.send('❌ There was an error reacting to the message')
            }

            try{
                const filter = (reaction, user) => {
                    return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
                }
                let reactioncollected = await promptmsg.awaitReactions(filter, { max: 1, time: 120000, errors: ['time'] })

                if(reactioncollected.first().emoji.name === '✅'){
                    const embed = new Discord.MessageEmbed()
                    .setColor('RED')
                    .setTitle('Product Deleted')
                    .addField('Name', product.name)
                    .addField('Description', product.description)
                    .addField('Developer Product ID', product.productid)
                    .addField('File', product.file)
                    .addField('Image', product.image || 'None',)
                    .addField('Stock Status', product.stock ? 'Enabled' : 'Disabled', true)
                    .setTimestamp()
                    if(product.stock){
                        embed.addField('Stock Amount', product.stockamount, true)
                    }
                    await promptmsg.reactions.removeAll().catch(error => message.channel.send('Could not clear reactions.'));
                    await promptmsg.edit(embed)

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
                            .setTitle('Product Deleted')
                            .addField('Name', product.name)
                            .addField('Description', product.description)
                            .addField('Developer Product ID', product.productid)
                            .addField('File', product.file)
                            .addField('Image', product.image || 'None',)
                            .addField('Stock Status', product.stock ? 'Enabled' : 'Disabled', true)
                            .setTimestamp()
                            if(product.stock){
                                logembed.addField('Stock Amount', product.stockamount, true)
                            }
                            message.guild.channels.cache.get(logchannel).send(logembed)
                        }
                        catch(error){
                            message.channel.send('❌ I could not log the action')
                        }
                    }
                
                    await client.products.delete(`${message.guild.id}.${productname}`)
                }
                else if(reactioncollected.first().emoji.name === '❌'){
                    const cancelledembed = new Discord.MessageEmbed()
                    .setColor('RED')
                    .setTitle('Product Deletion Cancelled')
                    .setDescription('Your product has not been deleted.')
                    await promptmsg.reactions.removeAll().catch(error => message.channel.send('Could not clear reactions.'));
                    await promptmsg.edit(cancelledembed)
                }
            }
            catch(error){
                const errorembed = new Discord.MessageEmbed()
                .setColor('RED')
                .setTitle('Delete Product')
                .setDescription('Please run the command again to restart the prompt.')
                await promptmsg.reactions.removeAll().catch(error => message.channel.send('Could not clear reactions.'));
                await promptmsg.edit(errorembed)
            }
        }
        else{
            return sendError('That\'s not a valid product. Make sure you spelt it correctly (Case-Sensitive).||deleteproduct <productname>')
        }
    }
};