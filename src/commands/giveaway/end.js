const Discord = require('discord.js');
const settings = require('../../database/models/guildSettings');
const giveaways = require('../../database/models/giveaways');
const { getWinners, giveawayEnd } = require('../../functions/giveaway');

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.CommandInteraction} interaction 
 * @param {String[]} args 
 */

module.exports = async (client, interaction, args) => {
    const id = interaction.options.getString('id');

    const giveaway = await giveaways.findOne({ guildId: interaction.guild.id, messageId: id });
    if (!giveaway) return interaction.reply({ content: 'Non ho trovato questo giveaway', ephemeral: true });

    if (giveaway.ended) return interaction.reply({ content: 'Questo giveaway è già terminato!', ephemeral: true });

    if (giveaway.joinedUsers.length < giveaway.nWinners) return interaction.reply({ content: 'Non ci sono abbastanza partecipanti per terminare il giveaway!', ephemeral: true });

    const winners = await giveawayEnd(client, giveaway, true);
    interaction.reply({ content: `Hai terminato manualmente il giveaway! I vincitori sono: ${winners.length > 0 ? winners.map(winner => `<@${winner}>`).join(', ') : 'Nessun vincitore'}`, ephemeral: true });
}