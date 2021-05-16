module.exports = {
    aliases: ['makeproduct'],
	async run(client, message, args, sendError) {
        const Discord = require("discord.js");
        let productname = args.join(' ')

        if(!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('❌ You need the `Administrator` permission to run this command.')
        
        if(!productname) return sendError('What product should I delete? (Case-Sensitive)||deleteproduct <productname>')

        //Get product from DB
        await client.products.ensure(message.guild.id, {})
        let product = await client.products.get(`${message.guild.id}.${productname}`)

        if(product){
            const embed = new Discord.MessageEmbed()
            .setColor('RED')
            .setTitle('Product Deleted')
            .addField('Name', product.name)
            .addField('Description', product.description)
            .addField('Developer Product ID', product.productid)
            .addField('File', product.file)
            .addField('Stock Status', product.stock ? 'Enabled' : 'Disabled', true)
            .setTimestamp()
            if(product.stock){
                embed.addField('Stock Amount', product.stockamount, true)
            }
            await message.channel.send(embed)

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
                    .setColor(client.config.mainEmbedColor)
                    .setTitle('Product Deleted')
                    .addField('Name', product.name)
                    .addField('Description', product.description)
                    .addField('Developer Product ID', product.productid)
                    .addField('File', product.file)
                    .addField('Stock Status', product.stock ? 'Enabled' : 'Disabled', true)
                    .setTimestamp()
                    if(product.stock){
                        embed.addField('Stock Amount', product.stockamount, true)
                    }
                    message.guild.channels.cache.get(logchannel).send(logembed)
                }
                catch(error){
                    message.channel.send('❌ I could not log the action')
                }
            }
      
            await client.products.delete(`${message.guild.id}.${productname}`)
        }else{
            return sendError('That\'s not a valid product. Make sure you spelt it correctly (Case-Sensitive).||deleteproduct <name>')
        }
    }
};