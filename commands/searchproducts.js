module.exports = {
    aliases: [ 'searchproduct', 'productsearch', 'productssearch', 'findproduct', 'findproducts'],
	async run(client, message, args, sendError) {
        const Discord = require("discord.js");

        //Parse search term
        let search = args.join(' ').toLowerCase()
        if(!search) return sendError('What search term should I use?||searchproducts <term>')
        if(search.length > 30) return sendError('Please enter a search term under 30 characters.||searchproducts <term>')

        //Get product names
        await client.products.ensure(message.guild.id, {})
        let allproducts = await client.products.get(message.guild.id)

        let unsortedproductnames = []
        for (key in allproducts) {
            let currentproduct = allproducts[key].name

            if(currentproduct.toLowerCase().includes(search)){
                unsortedproductnames.push(currentproduct)
            }
        }

        //Sort product names
        let productnames = unsortedproductnames.sort()

        //Generate product pages
        let productpages = []
        let productint = 0
        let leftout = 0

        for(i in productnames){
            let product = productnames[i]

            if(!productpages[productint]) productpages[productint] = []

            if(productpages[productint].join('\n').length + product.length > 2000){
                leftout++
            }
            else{
                productpages[productint].push(product)
            }
        }
        if(leftout === 1){
            productpages[productint].push(`**${leftout} result could not be displayed**`)
        }
        else if (leftout > 1){
            productpages[productint].push(`**${leftout} results could not be displayed**`)
        }
        
        //Send message
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
        .setTitle(`Products containing: ${search}`)
        .setDescription(productpages[0] ? productpages[0].join('\n') : '**None**')
        .setTimestamp()
        message.channel.send(embed)
    }
};