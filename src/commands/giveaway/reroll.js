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

    if (!giveaway.ended) return interaction.reply({ content: 'Questo giveaway non è ancora terminato!', ephemeral: true });

    let users = giveaway.joinedUsers;

    giveaway.winners.forEach(winner => {
        users.splice(users.indexOf(winner), 1);
    });

    const newWinners = await getWinners(users, giveaway.nWinners);

    interaction.reply({ content: `Hai rilanciato il giveaway! I nuovi vincitori sono: ${newWinners.length > 0 ? newWinners.map(winner => `<@${winner}>`).join(', ') : 'Nessun vincitore'}`, ephemeral: true });
}