const Discord = require('discord.js');
const tickets = require('../../database/models/tickets');
const guildSettings = require('../../database/models/guildSettings');

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.CommandInteraction} interaction 
 * @param {String[]} args 
 */

module.exports = async (client, interaction, args) => {
    const guild = await guildSettings.findOne({ guildId: interaction.guild.id });
    if (!interaction.member.roles.cache.some(role => role.id === guild.tickets.supportRole)) return;

    const ticket = await tickets.findOne({ channel: interaction.channel.id });
    if (!ticket) return interaction.reply({ content: 'Questo canale non è un ticket', ephemeral: true });

    if (ticket.status === 'CLOSED') return interaction.reply({ content: 'Non puoi gestire un ticket già chiuso.', ephemeral: true });

    const user = interaction.options.getUser('user');

    if (!ticket.usersAdded.includes(user.id)) return interaction.reply({ content: 'Questo utente non è stato aggiunto al ticket', ephemeral: true });

    if (ticket.operator === user.id) return interaction.reply({ content: 'Questo utente è il creatore del ticket', ephemeral: true });

    try {
        ticket.usersAdded.splice(ticket.usersAdded.indexOf(user.id), 1);
        await ticket.save();

        await interaction.channel.permissionOverwrites.delete(user.id);

        const embed = new Discord.EmbedBuilder()
            .setDescription(`${user} è stato rimosso dal ticket da ${interaction.user}`)
            .setColor('#2b2d31')

        interaction.reply({ embeds: [embed] });
        user.send({ content: `Sei stato rimosso dal ticket ${interaction.channel} di <@${ticket.creator}>` }).catch(() => { });
    } catch (e) {
        interaction.reply({ content: `Errore durante la rimozione dell'utente dal ticket: \`${e}\``, ephemeral: true });
    }
}