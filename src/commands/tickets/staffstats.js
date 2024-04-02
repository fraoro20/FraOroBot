const Discord = require('discord.js');
const tickets = require('../../database/models/tickets');

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.CommandInteraction} interaction 
 * @param {String[]} args 
 */

module.exports = async (client, interaction, args) => {
    const user = interaction.options.getUser('user') || interaction.user;

    const ticketFeedback = await tickets.find({ operator: user.id, ticketReviewComment: { $ne: null }, ticketReview: true });

    const ticketStats = (await tickets.find({ operator: user.id })).filter(ticket => ticket.ticketReviewStars);

    const reviewscore = ticketStats.reduce((acc, ticket) => acc + ticket.ticketReviewStars, 0) / ticketStats.length;

    let page = 1;
    const usersPerPage = 10;

    const stats = new Discord.EmbedBuilder()
        .setAuthor({ name: `Stats for ${user.tag}`, iconURL: user.displayAvatarURL() })
        .addFields(
            { name: 'Tickets claimed', value: `${ticketStats.length}`, inline: true },
            { name: 'Tickets closed', value: `${ticketStats.filter(ticket => ticket.status === 'CLOSED').length}`, inline: true },
            { name: 'Tickets open', value: `${ticketStats.filter(ticket => ticket.status === 'OPEN').length}`, inline: true },
            { name: 'Review Score', value: `${reviewscore.toFixed(1)}/5 ⭐`, inline: true }
        )

    const feedbacks = new Discord.EmbedBuilder()
        .setAuthor({ name: `Feedbacks for ${user.tag}`, iconURL: user.displayAvatarURL() })
        .setFooter({ text: `Page ${page} of ${Math.ceil(ticketFeedback.length / usersPerPage)}` })
        .setDescription(ticketFeedback.slice((page - 1) * usersPerPage, page * usersPerPage)
            .map(ticket => `**[#${ticket.ticketId}]** ${ticket.ticketReviewStars} ⭐ - \`${ticket.ticketReviewComment}\``).join('\n') || 'No feedbacks');

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
    row.components[1].setDisabled(ticketFeedback.length <= usersPerPage);
    interaction.reply({ embeds: [stats, feedbacks], components: [row], ephemeral: true });

    const filter = i => i.customId === 'previous' || i.customId === 'next';
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 180000 });

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

        feedbacks.setDescription(ticketFeedback.slice((page - 1) * usersPerPage, page * usersPerPage)
            .map(ticket => `**[#${ticket.ticketId}]** ${ticket.ticketReviewStars} ⭐ - \`${ticket.ticketReviewComment}\``).join('\n') || 'No feedbacks');

        feedbacks.setFooter({ text: `Page ${page} of ${Math.ceil(ticketFeedback.length / usersPerPage)}` });

        await i.update({ embeds: [stats, feedbacks], components: [row] });
    });

    collector.on('end', async () => {
        row.components.forEach(c => c.setDisabled(true));
        await interaction.editReply({ components: [row] });
    });




}