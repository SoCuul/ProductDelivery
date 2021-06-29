module.exports = {
    aliases: [],
	async run(client, message, args, sendError, getUserInfo) {
        const Discord = require("discord.js");
        let productname = args.join(' ')

        if(!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('❌ You need the `Administrator` permission to run this command.')

        if(!productname) return sendError('What is the product\'s name? (Case-Sensitive)||productembed <productname>')

        //Get Product
        await client.products.ensure(message.guild.id, {})
        let product = await client.products.get(`${message.guild.id}.${productname}`)

        if(product){
            const embed = new Discord.MessageEmbed()
            .setColor(client.config.mainEmbedColor)
            .setTitle(product.name)
            .setDescription(product.stock ? `${product.description}\n\nNote: This product has limited stock` : product.description)
            .setFooter(message.guild.name, message.guild.iconURL({ dynamic: true }))
            message.channel.send(embed)
        }else{
            return sendError('That\'s not a valid product. Make sure you spelt it correctly (Case-Sensitive).||productembed <productname>')
        }
    }
};