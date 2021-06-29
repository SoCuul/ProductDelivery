module.exports = {
    aliases: ['dbupdate'],
	async run(client, message, args, sendError) {
        if (message.author.id === client.config.ownerID){
            const Discord = require("discord.js");

            //Send processing embed
            const embed = new Discord.MessageEmbed()
            .setColor('YELLOW')
            .setTitle('Updating Database')
            .setDescription('⏳ Please wait.')
            .setTimestamp()
            let msg = await message.channel.send(embed)

            //Update DB
            try{
                //Fetch guilds
                let guilds = await client.products.keys

                for(guild in guilds){
                    let guildproducts = await client.products.get(guilds[guild])

                    for(product in guildproducts){
                        let currentproduct = guildproducts[product].name

                        let productSchema = {
                            name: currentproduct,
                            description: 'No description provided',
                            productid: 'N/A',
                            file: 'No file provided',
                            image: '',
                            stock: false,
                            stockamount: 0
                        }

                        //Ensure data
                        await client.products.ensure(guilds[guild], {[currentproduct]: productSchema})
                    }
                }

                //Send embed
                const successembed = new Discord.MessageEmbed()
                .setColor('GREEN')
                .setTitle('Databse Update Finished')
                .setDescription('The database has been updated to the latest version.')
                .setTimestamp()
                await msg.edit(successembed)
            }
            catch(error){
                //Truncate string
                function truncateString(str, num) {
                    if (str.length <= num) {
                        return str
                    }
                    return str.slice(0, num) + '...'
                }

                //Send embed
                const failedembed = new Discord.MessageEmbed()
                .setColor('RED')
                .setTitle('Databse Update Failed')
                .setDescription('The database could not be updated.')
                .addField('Error', truncateString(error.toString(), 1021))
                .setTimestamp()
                await msg.edit(failedembed)
            }
        }
    }
};