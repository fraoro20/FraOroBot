const Discord = require('discord.js');
const tickets = require('../../database/models/tickets');

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.CommandInteraction} interaction 
 * @param {String[]} args 
 */

module.exports = async (client, interaction, args) => {
    const ticketid = interaction.options.getString('ticketid');

    const ticket = await tickets.findOne({ ticketId: ticketid, creator: interaction.user.id });
    if (!ticket) return interaction.reply({ content: 'Il ticket specificato non esiste o non ti appartiene', ephemeral: true })

    const starts = interaction.options.getString('stars');

    if (ticket.status !== 'CLOSED') return interaction.reply({ content: 'Non puoi recensire un ticket ancora aperto', ephemeral: true });

    if (ticket.ticketReview) return interaction.reply({ content: 'Questo ticket è già stato recensito', ephemeral: true });

    if (!ticket.operator) return interaction.reply({ content: 'Non puoi recensire un ticket senza operatore', ephemeral: true });

    ticket.ticketReview = true;
    ticket.ticketReviewStars = starts;

    const reviewModal = new Discord.ModalBuilder()
        .setTitle(`Valuta #${ticket.ticketId}`)
        .setCustomId('ticketReview')
        .addComponents(
            new Discord.ActionRowBuilder().addComponents(
                new Discord.TextInputBuilder()
                    .setLabel(`Perché hai valutato ${starts} ⭐?`)
                    .setStyle(Discord.TextInputStyle.Paragraph)
                    .setMinLength(1)
                    .setRequired(false)
                    .setCustomId('ticketReviewComment')
                    .setPlaceholder(`Motivo della valutazione del ticket #${ticket.ticketId}... (opzionale)`)
            )
        );

    interaction.showModal(reviewModal);
    const submittedReview = await interaction.awaitModalSubmit({
        time: 60000,
        filter: i => i.user.id === ticket.creator
    });

    if (!submittedReview) return;

    ticket.ticketReviewComment = submittedReview.fields.getTextInputValue('ticketReviewComment') || 'Nessun motivo specificato';

    await ticket.save();

    submittedReview.reply({ content: 'Ticket recensito con successo!', ephemeral: true });
}