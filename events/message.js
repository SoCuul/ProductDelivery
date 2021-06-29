module.exports = async (client, message) => {
    //MessageEmbeds
    const { MessageEmbed } = require("discord.js");

    //Ignore commands in dm channels
    if (message.channel.type === 'dm' ) return;

    //Ensure data
    await client.guildSettings.ensure(message.guild.id, {
        prefix: client.config.defaultPrefix
    })

    //Prefix fetching code
    let prefix = await client.guildSettings.get(`${message.guild.id}.prefix`)

    let getUserInfo = client.getUserInfo
    let getRobloxInfo = client.getRobloxInfo

    // Ignore all bots
    if (message.author.bot) return;

    //Notify user of prefix on mention
    if(message.mentions.users.first() && message.mentions.users.first().id === client.user.id) return message.channel.send(`My prefix for **${message.guild.name}** is \`${prefix}\``)

    // Ignore messages without prefixes
    const cmdPrefix = message.content.startsWith(prefix);
    if (!cmdPrefix) return;

    // Our standard argument/command name definition.
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // Grab the command data from the client.commands map
    const cmd = client.commands.get(command) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command));

    // If that command doesn't exist, silently exit and do nothing
    if (!cmd) return;

    //Check for permissions
   if(!message.guild.me.permissionsIn(message.channel).has('SEND_MESSAGES')) return
   if(!message.guild.me.permissionsIn(message.channel).has('EMBED_LINKS')) return message.channel.send('I don\'t have the `Embed Links` permission. Please ask a server admin to fix my permissions.')
   if(!message.guild.me.permissionsIn(message.channel).has('ADD_REACTIONS')) return message.channel.send('I don\'t have the `Add Reactions` permission. Please ask a server admin to fix my permissions.')

    //Error Messages
    function sendError(input) {
        try{
            let parts = input.split('||', 2);
            const error = new MessageEmbed()
            .setColor('RED')
            .setTitle('Error')
            .setDescription(parts[0])
            .addField('Usage', `\`${prefix}${parts[1]}\``)
            .setFooter(client.config.botName, client.user.avatarURL({ dynamic: true }));
            message.react('❌').catch(error => { console.log(`There was an error reacting to the message.`) })
            message.channel.send(error)
        }
        catch(error){
            console.log('Could not send a sendError message')
        }
    }

    // Run the command
    try{
        await cmd.run(client, message, args, sendError, getUserInfo, getRobloxInfo);
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
        const embed = new MessageEmbed()
        .setColor('RED')
        .setTitle('Execution Error')
        .setDescription('There was an error running the command.')
        .addField('Error', truncateString(error.toString(), 1021))
        .setTimestamp()
        message.channel.send(embed)
    }
};