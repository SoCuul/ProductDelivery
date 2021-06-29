module.exports = {
    aliases: [],
    async run(client, message, args, sendError) {
        const Discord = require("discord.js")
        const { performance } = require('perf_hooks')

        //Truncate string
        function truncateString(str, num) {
            if (str.length <= num) {
                return str
            }
            return str.slice(0, num) + '...'
        }

        if (message.author.id === '490559747473539099'){
            const { inspect } = require('util');

            console.log(`Eval executed by ${message.author.tag}`)

            try {
                let t0 = performance.now()
                let evaled = await eval(args.join(' '))
                let t1 = performance.now()

                //Inspect eval
                let type = typeof evaled !== 'undefined' ? typeof evaled : 'N/A'
                if (typeof evaled !== "string") evaled = require("util").inspect(evaled)

                const embed = new Discord.MessageEmbed()
                .setColor('GREEN')
                .setTitle('Eval Succeeded')
                .setDescription(`\`\`\`js\n${truncateString(evaled.toString(), 2030)}\n\`\`\``)
                .addField(`⏲️  Completed in`, `**${(t1 - t0).toFixed(4)}ms**`)
                .addField(`⌨️  Type`, `\`${type}\``)
                .setTimestamp()
                message.channel.send(embed)
            }
            catch (error) {
                const embed = new Discord.MessageEmbed()
                .setColor('RED')
                .setTitle('Eval Failed')
                .setDescription(`\`\`\`js\n${truncateString(error.toString(), 2030)}\n\`\`\``)
                .setTimestamp()
                message.channel.send(embed)
            }
        }
    }
};