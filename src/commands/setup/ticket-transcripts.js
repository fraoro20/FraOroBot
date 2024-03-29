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
    const channel = interaction.options.getChannel('channel');

    const guildSettings = await settings.findOne({ guildId: interaction.guild.id });
    if (!guildSettings) return interaction.reply({ content: 'Please setup the bot first', ephemeral: true });

    try {
        guildSettings.tickets.transcriptChannel = channel.id;
        await guildSettings.save().catch(err => { throw err });
        interaction.reply({ content: 'Ticket transcripts channel set', ephemeral: true });
    } catch (error) {
        return interaction.reply({ content: `Errore durante il settaggio del canale: ${error}`, ephemeral: true });
    }
}