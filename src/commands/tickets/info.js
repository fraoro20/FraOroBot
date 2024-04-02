const Discord = require('discord.js');
const tickets = require('../../database/models/tickets');

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.CommandInteraction} interaction 
 * @param {String[]} args 
 */

module.exports = async (client, interaction, args) => {
    const ticketId = interaction.options.getString('ticketid');

    const ticket = await tickets.findOne({ ticketId: ticketId });

    if (!ticket) return interaction.reply({ content: 'Nessun ticket trovato con questo ID', ephemeral: true });

    const embed = new Discord.EmbedBuilder()
        .setTitle(`Ticket #${ticket.ticketId}`)
        .setFields(
            { name: 'Status', value: ticket.status, inline: true },
            { name: 'Category', value: ticket.category, inline: true },
            { name: 'Operator', value: ticket.operator ? `<@${ticket.operator}>` : 'Nessuno', inline: true },
            { name: 'Users', value: ticket.usersAdded.map(user => `<@${user}>`).join('\n') || 'Nessuno', inline: true },
            { name: 'Created By', value: `<@${ticket.creator}>`, inline: true },
            { name: 'Created At', value: ticket.createdAt, inline: true },
            { name: 'Closed By', value: ticket.closedBy ? `<@${ticket.closedBy}>` : 'Nessuno', inline: true },
            { name: 'Closed Reason', value: ticket.closedReason || 'Nessuno', inline: true },
            { name: 'Closed At', value: ticket.closedAt || 'Nessuno', inline: true },
            { name: 'Review', value: ticket.ticketReview ? `${ticket.ticketReviewStars} ⭐ - \`${ticket.ticketReviewComment}\`` : 'Nessuna recensione', inline: true },
        )
        .setColor('#2b2d31')

    interaction.reply({ embeds: [embed], ephemeral: true });
}