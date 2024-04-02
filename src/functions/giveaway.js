function getWinners(users, nWinners) {
    const winners = [];
    if (users.length === nWinners) return users;
    if (users.length === 0) return [];

    for (let i = 0; i < nWinners; i++) {
        const winner = users[Math.floor(Math.random() * users.length)];
        winners.push(winner);
        users.splice(users.indexOf(winner), 1);
    }
    return winners;
}

async function giveawayEnd(client, giveaway, returnWinners = false) {
    try {
        const Discord = require('discord.js');
        const settings = require('../database/models/guildSettings');
        const giveawaySettings = await settings.findOne({ guildId: giveaway.guildId });
        const channel = client.channels.cache.get(giveawaySettings.giveawayChannel);

        const guild = client.guilds.cache.get(giveaway.guildId);

        const message = await channel.messages.fetch(giveaway.messageId);

        const messageEmbed = message.embeds[0];

        const winners = getWinners(giveaway.joinedUsers, giveaway.nWinners);

        const description = messageEmbed.description.replace(`**Vincitori:** ${giveaway.nWinners}`, `**Vincitori:** ${winners.length > 0 ? winners.map(winner => (winner != null) ? `<@${winner}>` : `Nessuno`).join(', ') : 'Nessun vincitore'}`);

        const embed = new Discord.EmbedBuilder()
            .setDescription(description)
            .setFooter({ text: 'Terminato' })
            .setTimestamp()
            .setColor(messageEmbed.color)
            .setThumbnail(messageEmbed.thumbnail.url)
            .setAuthor({ name: 'Giveaway Terminato', iconURL: guild.iconURL() });

        if (messageEmbed.title) embed.setTitle(messageEmbed.title);
        if (messageEmbed.fields.length > 0) embed.addFields(messageEmbed.fields);

        giveaway.ended = true;
        giveaway.winners = winners;
        giveaway.endAt = Date.now();
        await giveaway.save();

        await message.edit({ embeds: [embed], components: [] });

        winners.forEach(winner => {
            guild.members.fetch(winner).then(async member => {
                await member.send({ content: `Ti ricordi di aver partecipato al giveaway ${message.url}?\n## Congratulazioni, sei uno dei vincitori! La fortuna è stata dalla tua parte!\nSegui le istruzioni del giveaway per ricevere il premio oppure apri un ticket.` })
            });
        });

        if (returnWinners) return winners;
    } catch (err) {
        throw new Error(`Errore durante la terminazione del giveaway: ${err}`);
    }
}

module.exports = { giveawayEnd, getWinners };