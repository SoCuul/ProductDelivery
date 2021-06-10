module.exports = {
  aliases: ['recieve', 'retrieveproduct'],
	async run(client, message, args, sendError, getUserInfo, getRobloxInfo) {
        const Discord = require("discord.js");
        let productname = args.join(' ')

        //Ensure data
        await client.guildSettings.ensure(message.guild.id, {
            prefix: client.config.defaultPrefix
        })

        //Prefix fetching code
        let prefix = await client.guildSettings.get(`${message.guild.id}.prefix`)

        //Check Verification
        let userInfo = await getRobloxInfo(message.author.id)

        const unverified = new Discord.MessageEmbed()
        .setTitle('Unverified')
        .setDescription(`There is no Roblox account linked to this Discord account.\nRun the \`${prefix}link\` command to link your Roblox account.`)
        if(!userInfo.verified) return message.channel.send(unverified)

        if(!productname) return sendError('What product should I retrieve for you? (Case-Sensitive)||retrieve <productname>')
        if(productname.includes('.')) return sendError('Product names can not contain the `.` character.||retrieve <productname>')

        await client.usersdb.ensure(`${userInfo.robloxID}`, {})
        await client.usersdb.ensure(`${userInfo.robloxID}.${message.guild.id}`, [])
        await client.products.ensure(message.guild.id, {})

        let product = await client.products.get(`${message.guild.id}.${productname}`)

        if(product){
            let yourproducts = await client.usersdb.get(`${userInfo.robloxID}.${message.guild.id}`)

            if(yourproducts.includes(productname)){
                await message.channel.send('Sent.')

                const embed = new Discord.MessageEmbed()
                .setColor(client.config.mainEmbedColor)
                .setTitle(product.name)
                .addField('Download Link:', product.file)
                .setFooter(message.guild.name, message.guild.iconURL())
                await message.member.send(embed).catch(error => { message.channel.send(`❌ I could not send you the file. Make sure you dms are open, and try the command again.`) })
            }else{
                return sendError('You don\'t own this product. If you bought the product, make sure you spelt it correctly (Case-Sensitive).||retrieve <productname>')
            }
        }else{
            return sendError('That\'s not a valid product. Make sure you spelt it correctly (Case-Sensitive).||retrieve <productname>')
        }
    }
};