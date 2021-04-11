module.exports = {
    aliases: [],
	async run(client, message, args, sendError) {
        if (message.author.id === client.config.ownerID){
            const { inspect } = require('util');
            let evaled;
            try {
                evaled = eval(args.join(' '))
                //message.channel.send(inspect(evaled));
                console.log(`Eval executed by ${message.author.username}`);
            }
            catch (error) {
                message.channel.send('❌ There was an error during evaluation.');
                message.channel.send('Error: ' + error)
            }
        }
    }
};