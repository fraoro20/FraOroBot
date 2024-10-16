const Discord = require('discord.js');
const tickets = require('../../database/models/tickets');

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.CommandInteraction} interaction 
 * @param {String[]} args 
 */

module.exports = async (client, interaction, args) => {
    const ticket = await tickets.findOne({ channel: interaction.channel.id });
    if (!ticket) return interaction.reply({ content: 'Questo canale non è un ticket', ephemeral: true });

    if (ticket.status === 'OPEN') return interaction.reply({ content: `Non puoi cancellare un ticket aperto`, ephemeral: true });

    const embed = new Discord.EmbedBuilder()
        .setDescription('Il ticket verrà eliminato in **15 secondi**.')
        .setColor('Red');

    interaction.reply({ embeds: [embed] }).then(msg =>
        setTimeout(async () => {
            await interaction.channel.delete();
        }, 15000)
    );
}