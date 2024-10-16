const Discord = require('discord.js');
const tickets = require('../../database/models/tickets');
const settings = require('../../database/models/guildSettings');

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.CommandInteraction} interaction 
 * @param {String[]} args 
 */

module.exports = async (client, interaction, args) => {
    const role = interaction.options.getRole('role');

    const guildSettings = await settings.findOne({ guildId: interaction.guild.id });
    if (!guildSettings) return interaction.reply({ content: 'Please setup the bot first', ephemeral: true });

    try {
        if (guildSettings.tickets.supportRole.includes(role.id)) {
            guildSettings.tickets.supportRole.splice(guildSettings.tickets.supportRole.indexOf(role.id), 1);
            interaction.reply({ content: `Ruolo di supporto rimosso correttamente`, ephemeral: true });
        } else {
            guildSettings.tickets.supportRole.push(role.id);
            interaction.reply({ content: `Ruolo di supporto settato correttamente`, ephemeral: true });
        }
        await guildSettings.save().catch(err => { throw err });
    } catch (error) {
        return interaction.reply({ content: `Errore durante il settaggio del ruolo: ${error}`, ephemeral: true });
    }
}