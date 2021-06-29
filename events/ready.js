module.exports = (client) => {
    console.log(`${client.config.botName} is online.`)
    console.log(`${client.guilds.cache.size} servers`)
	console.log(`${client.guilds.cache.reduce((a, c) => a + c.memberCount, 0)} users`)

    //Set first status
    client.user.setActivity(client.config.activityStatus, { type: client.config.activityType })
    .catch('[Status Error] Could not set status')

    //Set status each hour
    setInterval(() => {
        client.user.setActivity(client.config.activityStatus, { type: client.config.activityType })
        .catch('[Status Error] Could not set status')
    }, 3600000);
};