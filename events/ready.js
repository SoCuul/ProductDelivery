module.exports = (client) => {
  console.log(`${client.config.botName} is online.`);
	client.user.setActivity(client.config.activityStatus, { type: client.config.activityType })
};