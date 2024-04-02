const Discord = require('discord.js');
const tickets = require('../../database/models/tickets');

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.CommandInteraction} interaction 
 * @param {String[]} args 
 */

module.exports = async (client, interaction, args) => {
    const status = interaction.options.getString('status');
    const user = interaction.options.getUser('user');
    const operator = interaction.options.getUser('operator');

    if (user) a = user.id;

    let ticketFilter = {};
    if (status) ticketFilter.status = status.toUpperCase();
    if (user) ticketFilter.creator = user.id;
    if (operator) ticketFilter.operator = operator.id;

    const allTickets = await tickets.find(ticketFilter);

    let page = 1;
    const usersPerPage = 10;

    const embed = new Discord.EmbedBuilder()
        .setTitle(`Tickets list [${allTickets.length}]`)
        .setAuthor({
            name: `Filters - ${Object.keys(ticketFilter).length === 0 ? 'ALL' : Object.entries(ticketFilter).map(([key, value]) => {
                if (Number.isInteger(parseInt(value)) && value.length === 18)
                    return `${key}: ${client.users.cache.get(value).tag || value}`;
                else
                    return `${key}: ${value}`;
            }).join(', ')}`, iconURL: user?.displayAvatarURL()
        })
        .setFooter({ text: `Page ${page} of ${Math.ceil(allTickets.length / usersPerPage)}` })
        .setDescription(allTickets.slice((page - 1) * usersPerPage, page * usersPerPage).map(ticket =>
            `**[#${ticket.ticketId}]** (${ticket.status}) - ${ticket.status === 'CLOSED' ? `<@${ticket.creator}>` : `<#${ticket.channel}>`}`).join('\n') || `Nessun ticket trovato con questi filtri.`);

    const row = new Discord.ActionRowBuilder()
        .addComponents(
            new Discord.ButtonBuilder()
                .setCustomId('previous')
                .setLabel('Previous')
                .setStyle(Discord.ButtonStyle.Primary),

            new Discord.ButtonBuilder()
                .setCustomId('next')
                .setLabel('Next')
                .setStyle(Discord.ButtonStyle.Primary)
        );

    row.components[0].setDisabled(true);
    row.components[1].setDisabled(allTickets.length <= usersPerPage);
    interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

    const filter = i => i.customId === 'previous' || i.customId === 'next';
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });

    collector.on('collect', async i => {
        if (i.customId === 'previous') {
            if (page === 1) return;
            page--;
        } else if (i.customId === 'next') {
            if (page === Math.ceil(ticketFeedback.length / usersPerPage)) return;
            page++;
        }

        row.components[0].setDisabled(page === 1);
        row.components[1].setDisabled(page === Math.ceil(ticketFeedback.length / usersPerPage));

        embed.setDescription(allTickets.slice((page - 1) * usersPerPage, page * usersPerPage).map(ticket =>
            `**[#${ticket.ticketId}]** (${ticket.status}) - ${ticket.status === 'CLOSED' ? `<@${ticket.creator}>` : `<#${ticket.channel}>`}`).join('\n') || 'No tickets');

        embed.setFooter({ text: `Page ${page} of ${Math.ceil(allTickets.length / usersPerPage)}` });

        await i.update({ embeds: [embed], components: [row] });
    });

    collector.on('end', async () => {
        row.components.forEach(c => c.setDisabled(true));
        await interaction.editReply({ components: [row] });
    });
}