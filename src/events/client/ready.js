const Discord = require('discord.js');
const giveaways = require('../../database/models/giveaways');
const { giveawayEnd } = require('../../functions/giveaway');

/**
 * 
 * @param {Discord.Client} client 
 */

module.exports = async (client) => {
    const activeGiveaways = await giveaways.find({ ended: false });
    activeGiveaways.forEach(async giveaway => {
        const duration = giveaway.duration - (Date.now() - giveaway.startAt);

        if (duration <= 0) {
            giveawayEnd(client, giveaway);
        } else {
            setTimeout(() => {
                if (!giveaway.ended)
                    giveawayEnd(client, giveaway);
            }, duration)
        }
    })
}
