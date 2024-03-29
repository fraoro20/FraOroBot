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

    if (ticket.status === 'OPEN') return interaction.reply({ content: 'Non puoi riaprire un ticket già aperto.', ephemeral: true });

    ticket.status = 'OPEN';
    ticket.closedBy = undefined;
    ticket.closedAt = undefined;
    ticket.closedReason = undefined;
    ticket.operator = interaction.user.id;
    ticket.ticketReview = false;
    ticket.ticketReviewStars = null;
    ticket.ticketReviewComment = null;
    await ticket.save();

    const embed = new Discord.EmbedBuilder()
        .setDescription(`${interaction.user} ha riaperto il ticket.`)
        .setColor('#2b2d31')

    try {
        interaction.channel.edit({ name: `${ticket.category}-${client.users.cache.get(ticket.creator).tag}` });
        interaction.channel.permissionOverwrites.edit(ticket.creator, { SendMessages: true })
        for (const user of ticket.usersAdded) {
            interaction.channel.permissionOverwrites.edit(user, { SendMessages: true });
        }
    } catch (e) {
        return interaction.reply({ content: `Errore durante la riapertura del ticket: \`${e}\``, ephemeral: true });
    }

    interaction.reply({ embeds: [embed], content: `<@${ticket.creator}>` });
}