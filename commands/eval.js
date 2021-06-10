module.exports = {
    aliases: [],
	async run(client, message, args, sendError) {
        const Discord = require("discord.js");
        
        if (message.author.id === client.config.ownerID){
            const { inspect } = require('util');
            let evaled;
            try {
                console.log(`Eval executed by ${message.author.tag}`)
                evaled = eval(args.join(' '))
            }
            catch (error) {
                message.channel.send('❌ There was an error during evaluation.');
                message.channel.send('Error: ' + error)
            }
        }
    }
};