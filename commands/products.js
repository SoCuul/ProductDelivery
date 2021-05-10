module.exports = {
    aliases: ['listproducts', 'serverproducts', 'guildproducts'],
	async run(client, message, args, sendError) {
        const Discord = require("discord.js");

        //Get product names
        await client.products.ensure(message.guild.id, {})
        let allproducts = await client.products.get(message.guild.id)

        let unsortedproductnames = []
        for (key in allproducts) {
            unsortedproductnames.push(allproducts[key].name)
        }

        //Sort product names
        let productnames = unsortedproductnames.sort()

        //Generate product pages
        let productpages = []
        let productint = 0

        for(i in productnames){
            let product = productnames[i]

            if(!productpages[productint]) productpages[productint] = []

            if(productpages[productint].join('\n').length + product.length > 2048){
                productint++
                if(!productpages[productint]) productpages[productint] = []
                
                productpages[productint].push(product)
            }
            else{
                productpages[productint].push(product)
            }
        }

        //Send specified page
        if(args[0]){
            //Check for valid number
            let unparsedpagenumber = args[0]
            if(unparsedpagenumber.length > 10) return message.channel.send(`❌ Please enter a shorter page number`)
            if(isNaN(unparsedpagenumber)) return message.channel.send(`❌ **${unparsedpagenumber}** is not a valid page number`)

            let pagenumber = Number(unparsedpagenumber) - 1
            let humanpagenumber = Number(unparsedpagenumber)
            if(humanpagenumber < 1) return message.channel.send(`❌ This is not a valid page number`)
            if(!productpages[pagenumber]) return message.channel.send(`❌ **${humanpagenumber}** is not a valid page number`)
            
            //Fetch server prefix
            //Ensure data
            const defaultSettings = {
                prefix: client.config.defaultPrefix,
            }
            await client.guildSettings.ensure(message.guild.id, defaultSettings)
    
            //Settings fetching code
            let settings = await client.guildSettings.get(message.guild.id)

            //Send message
            const embed = new Discord.MessageEmbed()
            .setColor(client.config.mainEmbedColor)
            .setTitle('Products')
            .setDescription(productpages[pagenumber].join('\n') || '**None**')
            .setFooter(`Page ${humanpagenumber}/${productpages.length} | Navigate pages: ${settings.prefix}products <pagenumber>`, '')
            .setTimestamp()
            message.channel.send(embed)
        }else{
            //Fetch server prefix
            //Ensure data
            const defaultSettings = {
                prefix: client.config.defaultPrefix,
            }
            await client.guildSettings.ensure(message.guild.id, defaultSettings)
    
            //Settings fetching code
            let settings = await client.guildSettings.get(message.guild.id)

            //Send message
            const embed = new Discord.MessageEmbed()
            .setColor(client.config.mainEmbedColor)
            .setTitle('Products')
            .setDescription(productpages[0] ? productpages[0].join('\n') : '**None**')
            .setFooter(`Page ${productpages[0] ? 1 : 0}/${productpages.length} | Navigate pages: ${settings.prefix}products <pagenumber>`, '')
            .setTimestamp()
            message.channel.send(embed)
        }
    }
};