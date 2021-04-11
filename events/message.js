module.exports = (client, message) => {
  //Ignore commands in dm channels
  if (message.channel.type === 'dm' ) return;

	//Error Messages
	function sendError(input) {
    const errortick = '`'
    const { MessageEmbed } = require("discord.js");
    let parts = input.split('||', 2);
    const error = new MessageEmbed()
    .setColor('RED')
    .setTitle('Error')
    .setDescription(parts[0])
    .addField('Usage', `${errortick}${client.config.prefix}${parts[1]}${errortick}`)
    .setFooter(client.config.botName, client.user.avatarURL({ dynamic: true }));
    message.react('❌').catch(error => { console.log(`There was an error reacting to the message.`) })
    message.channel.send(error)
  }

  //Get User Information from Roblox ID
  async function getUserInfo (inputRobloxID) {
    let userInfo = await client.robloxLink.find(value => value.robloxID === inputRobloxID)
    if(userInfo){
      var discordID = Object.keys(userInfo)[0]
    }else{
      return {
        "verified": false
      }
    }

    await client.robloxLink.ensure(discordID, {})

    let robloxID = await client.robloxLink.get(`${discordID}.robloxID`)
    let robloxUsername = await client.robloxLink.get(`${discordID}.robloxUsername`)

    if(robloxID && robloxUsername){
      return {
        "verified": true,
        "discordID": discordID,
        "robloxID": await client.robloxLink.get(`${discordID}.robloxID`),
        "robloxUsername": await client.robloxLink.get(`${discordID}.robloxUsername`)
      }
    }else{
      return {
        "verified": false
      }
    }
  }

  //Get Roblox Information from Discord ID
  async function getRobloxInfo (discordID) {
    await client.robloxLink.ensure(discordID, {})

    let robloxID = await client.robloxLink.get(`${discordID}.robloxID`)
    let robloxUsername = await client.robloxLink.get(`${discordID}.robloxUsername`)

    if(robloxID && robloxUsername){
      return {
        "verified": true,
        "robloxID": await client.robloxLink.get(`${discordID}.robloxID`),
        "robloxUsername": await client.robloxLink.get(`${discordID}.robloxUsername`)
      }
    }else{
      return {
        "verified": false
      }
    }
  }

  // Ignore all bots
  if (message.author.bot) return;

  // Ignore messages without prefixes
  const cmdPrefix = message.content.startsWith(client.config.prefix);
  if (!cmdPrefix) return;

  // Our standard argument/command name definition.
  const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // Grab the command data from the client.commands map
  const cmd = client.commands.get(command) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command));

  // If that command doesn't exist, silently exit and do nothing
  if (!cmd) return;

  // Run the command
  cmd.run(client, message, args, sendError, getUserInfo, getRobloxInfo);
};