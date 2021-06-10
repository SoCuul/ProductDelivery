module.exports = {
    aliases: ['productinformation'],
	async run(client, message, args, sendError, getUserInfo) {
        const Discord = require("discord.js");
        let productname = args.join(' ')

        if(!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('❌ You need the `Administrator` permission to run this command.')

        if(!productname) return sendError('What is the product\'s name? (Case-Sensitive)||productinfo <productname>')

        //Get Product
        await client.products.ensure(message.guild.id, {})
        let product = await client.products.get(`${message.guild.id}.${productname}`)

        if(product){
            const embed = new Discord.MessageEmbed()
            .setColor(client.config.mainEmbedColor)
            .setTitle('Product Information')
            .addField('Name', product.name)
            .addField('Description', product.description)
            .addField('Developer Product ID', product.productid)
            .addField('File', product.file,)
            .addField('Image', product.image || 'None',)
            .addField('Stock Status', product.stock ? 'Enabled' : 'Disabled', true)
            .setTimestamp()
            if(product.stock){
                embed.addField('Stock Amount', product.stockamount, true)
            }
            message.channel.send(embed)
        }else{
            return sendError('That\'s not a valid product. Make sure you spelt it correctly (Case-Sensitive).||productinfo <productname>')
        }
    }
};