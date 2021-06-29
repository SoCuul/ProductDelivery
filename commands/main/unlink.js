module.exports = {
    aliases: ['unlinkaccount'],
    async run(client, message, args, sendError, getUserInfo, getRobloxInfo) {
        const Discord = require("discord.js");

        //Check if user is verified
        let robloxInfo = await getRobloxInfo(message.author.id)
        if(robloxInfo.verified){
            //Unverify user
            await client.robloxLink.delete(message.author.id)
            //Notify user
            const embed = new Discord.MessageEmbed()
            .setColor('GREEN')
            .setTitle('Unlink Account')
            .setDescription(`Your Roblox account (\`${robloxInfo.robloxUsername}\`) has been unlinked from this Discord account.`)
            .setThumbnail(`https://www.roblox.com/headshot-thumbnail/image?userId=${robloxInfo.robloxID}&width=420&height=420&format=png`)
            message.channel.send(embed)
        }else{
            const embed = new Discord.MessageEmbed()
            .setColor('RED')
            .setTitle('Unlink Account')
            .setDescription('There is no Roblox account currently linked to this Discord account.')
            message.channel.send(embed)
        }
    }
};