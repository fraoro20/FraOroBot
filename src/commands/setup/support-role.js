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
        guildSettings.tickets.supportRole = role.id;
        await guildSettings.save().catch(err => { throw err });
        interaction.reply({ content: 'Support role set', ephemeral: true });
    } catch (error) {
        return interaction.reply({ content: `Errore durante il settaggio del ruolo: ${error}`, ephemeral: true });
    }
}