const Discord = require('discord.js');
const tickets = require('../../database/models/tickets');
const guildSettings = require('../../database/models/guildSettings');
const fs = require('fs');

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.CommandInteraction} interaction 
 * @param {String[]} args 
 */

module.exports = async (client, interaction, args) => {
    const guild = await guildSettings.findOne({ guildId: interaction.guild.id });
    const ticket = await tickets.findOne({ channel: interaction.channel.id });
    if (!ticket) return interaction.reply({ content: 'Questo canale non è un ticket', ephemeral: true });

    if (ticket.status === 'CLOSED') return interaction.reply({ content: `Questo ticket è già stato chiuso da ${interaction.guild.members.cache.get(ticket.closedBy)}`, ephemeral: true });

    const logChannel = interaction.guild.channels.cache.get(guild.tickets.logChannel);
    const transcriptChannel = interaction.guild.channels.cache.get(guild.tickets.transcriptChannel);

    const modal = new Discord.ModalBuilder()
        .setTitle(`Chiudi #${ticket.ticketId}`)
        .setCustomId('ticketClose')
        .addComponents(
            new Discord.ActionRowBuilder().addComponents(
                new Discord.TextInputBuilder()
                    .setLabel('Motivo della chiusura')
                    .setStyle(Discord.TextInputStyle.Paragraph)
                    .setMinLength(1)
                    .setRequired(false)
                    .setCustomId('ticketCloseReason')
                    .setPlaceholder(`Motivo della chiusura del ticket #${ticket.ticketId}... (opzionale)`)
            )
        );

    await interaction.showModal(modal);
    const submitted = await interaction.awaitModalSubmit({
        time: 60000,
        filter: i => i.user.id === interaction.user.id,
    }).catch(() => { });

    if (!submitted) return;

    try {

        client.users.fetch(ticket.creator).then(async (user) => {
            interaction.channel.permissionOverwrites.edit(user, {
                SendMessages: false
            });

            for (const user of ticket.usersAdded) {
                interaction.channel.permissionOverwrites.edit(user, {
                    SendMessages: false
                });
            }
            ticket.status = 'CLOSED';
            ticket.closedBy = interaction.user.id;
            ticket.closedReason = submitted.fields.getTextInputValue('ticketCloseReason') || 'Nessun motivo specificato';
            ticket.closedAt = Date.now();
            await ticket.save();

            const embedd = new Discord.EmbedBuilder()
                .setTitle(`Chiusura #${ticket.ticketId}`)
                .setColor('Random')
                .addFields([
                    { name: 'Categoria', value: ticket.category, inline: true },
                    { name: 'Chiuso da', value: `${interaction.user}`, inline: true },
                    { name: 'Motivo di chiusura', value: `\`${ticket.closedReason}\``, inline: true },
                    { name: 'Operatore', value: `${client.users.cache.get(ticket.operator) || 'Non assegnato'}`, inline: true },
                    { name: 'Data inizio', value: `<t:${ticket.createdAt}:F>`, inline: true },
                    { name: 'Data fine', value: `<t:${ticket.closedAt}:F>`, inline: true }
                ]);

            const log = new Discord.EmbedBuilder()
                .setTitle(`#${ticket.ticketId}`)
                .addFields([
                    { name: 'Aperto da', value: `${client.users.cache.get(ticket.creator)}`, inline: true },
                    { name: 'Categoria', value: ticket.category, inline: true },
                    { name: 'Chiuso da', value: `${interaction.user}`, inline: true },
                    { name: 'Motivo di chiusura', value: `\`${ticket.closedReason}\``, inline: true },
                    { name: 'Operatore', value: `${client.users.cache.get(ticket.operator) || 'Non assegnato'}`, inline: true },
                    { name: 'Data inizio', value: `<t:${ticket.createdAt}:F>`, inline: true },
                    { name: 'Data fine', value: `<t:${ticket.closedAt}:F>`, inline: true }
                ])
                .setColor('Red');

            interaction.channel.messages.fetch({ limit: 100 }).then(async messages => {
                let operator = ticket.operator ? client.users.fetch(ticket.operator).tag : null;
                const contentTicketInfo = [
                    '────────────────────────────────',
                    'FraOroBot Ticket Transcript',
                    `Ticket ID: ${ticket.ticketId}`,
                    `Ticket Category: ${ticket.category}`,
                    `Opened by: ${client.users.cache.get(ticket.creator).tag}`,
                    `Closed by: ${interaction.user.tag}`,
                    `Closed reason: ${ticket.closedReason}`,
                    `Operator: ${operator ? operator : 'Non assegnato'}`,
                    '────────────────────────────────'
                ]

                const ticketMessage = messages.map(msg => `[${new Date(msg.createdTimestamp).toLocaleString('en-US', { timeZone: 'Europe/Rome' })}] ${msg.author.tag} (${msg.author.id}) > ${msg.content} ${msg.embeds.length > 0 ? msg.embeds.map(embed => `[EMBED] ${embed.description}`) : ''}`).reverse();

                const content = contentTicketInfo.join('\n') + '\n' + ticketMessage.join('\n');

                fs.writeFileSync(`${ticket.ticketId}-${interaction.guild.nameAcronym}.txt`, content);

                ticket.transcript = content;
                await ticket.save();

                const attachment = new Discord.AttachmentBuilder(`${ticket.ticketId}-${interaction.guild.nameAcronym}.txt`, `${ticket.ticketId}-${interaction.guild.nameAcronym}.txt`);

                await logChannel.send({ embeds: [log], flags: [Discord.MessageFlags.SuppressNotifications] });
                await transcriptChannel.send({ files: [attachment], flags: [Discord.MessageFlags.SuppressNotifications] });
                await client.users.cache.get(ticket.creator).send({ files: [attachment], embeds: [embedd] });

                fs.unlinkSync(`${ticket.ticketId}-${interaction.guild.nameAcronym}.txt`);
            }).catch(err => { throw new Error('TRANSCRIPT ERROR: ' + err); })

            await interaction.channel.edit({ name: `closed-${client.users.cache.get(ticket.creator).tag}` });
            const embed = new Discord.EmbedBuilder()
                .setDescription(`Ticket chiuso da ${interaction.user}`)
                .setColor('#2b2d31')
                .addFields([
                    {
                        name: 'Data di chiusura',
                        value: `<t:${ticket.closedAt}:F>`,
                        inline: false
                    },
                    {
                        name: 'Motivo di chiusura',
                        value: `\`\`\`${ticket.closedReason}\`\`\``,
                        inline: false
                    }
                ]);
            const row = new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.ButtonBuilder()
                        .setCustomId('Ticket_transcript')
                        .setEmoji('📝')
                        .setStyle(Discord.ButtonStyle.Primary),

                    new Discord.ButtonBuilder()
                        .setCustomId('Ticket_reopen')
                        .setEmoji('🔓')
                        .setStyle(Discord.ButtonStyle.Primary),

                    new Discord.ButtonBuilder()
                        .setCustomId('Ticket_delete')
                        .setEmoji('🗑️')
                        .setStyle(Discord.ButtonStyle.Danger),
                )
            submitted.reply({ embeds: [embed], components: [row] });
            const rowReview = new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.ButtonBuilder()
                        .setCustomId('ticketReview1')
                        .setEmoji('⭐')
                        .setLabel('1')
                        .setStyle(Discord.ButtonStyle.Primary),
                    new Discord.ButtonBuilder()
                        .setCustomId('ticketReview2')
                        .setEmoji('⭐')
                        .setLabel('2')
                        .setStyle(Discord.ButtonStyle.Primary),
                    new Discord.ButtonBuilder()
                        .setCustomId('ticketReview3')
                        .setEmoji('⭐')
                        .setLabel('3')
                        .setStyle(Discord.ButtonStyle.Primary),
                    new Discord.ButtonBuilder()
                        .setCustomId('ticketReview4')
                        .setEmoji('⭐')
                        .setLabel('4')
                        .setStyle(Discord.ButtonStyle.Primary),
                    new Discord.ButtonBuilder()
                        .setCustomId('ticketReview5')
                        .setEmoji('⭐')
                        .setLabel('5')
                        .setStyle(Discord.ButtonStyle.Primary)
                );

            if (ticket.operator) {
                let message = client.users.cache.get(ticket.creator).send({ content: `La tua opinione è importante per noi, valuta il servizio ricevuto!`, components: [rowReview] });
                const collector = (await message).createMessageComponentCollector({ filter: i => i.user.id === ticket.creator, time: 60000 });

                collector.on('collect', async i => {
                    const tick = await tickets.findOne({ channel: interaction.channel.id });
                    if (tick.ticketReview) {
                        (await message).edit({ components: [], content: `Hai già valutato il servizio con ${tick.ticketReviewStars} ⭐` });
                        return collector.stop();
                    }
                    const reviewModal = new Discord.ModalBuilder()
                        .setTitle(`Valuta #${ticket.ticketId}`)
                        .setCustomId('ticketReview')
                        .addComponents(
                            new Discord.ActionRowBuilder().addComponents(
                                new Discord.TextInputBuilder()
                                    .setLabel(`Perché hai valutato ${i.component.label} ⭐?`)
                                    .setStyle(Discord.TextInputStyle.Paragraph)
                                    .setMinLength(1)
                                    .setRequired(false)
                                    .setCustomId('ticketReviewComment')
                                    .setPlaceholder(`Motivo della valutazione del ticket #${ticket.ticketId}... (opzionale)`)
                            )
                        );

                    i.showModal(reviewModal);
                    const submittedReview = await i.awaitModalSubmit({
                        time: 60000,
                        filter: i => i.user.id === ticket.creator,
                    }).catch(() => { });
                    if (!submittedReview) return;

                    ticket.ticketReview = true;
                    ticket.ticketReviewComment = submittedReview.fields.getTextInputValue('ticketReviewComment') || 'Nessun motivo specificato';
                    ticket.ticketReviewStars = i.component.label;
                    await ticket.save();

                    (await message).edit({ components: [], content: `Hai valutato il servizio con ${i.component.label} ⭐` });
                    submittedReview.reply({ content: `Grazie per la tua valutazione!`, ephemeral: true });
                });

                collector.on('end', async () => {
                    (await message).edit({ components: [], content: `Valuta il servizio ricevuto utilizzando il comando /ticket review ${ticket.ticketId} nel server` });
                });
            }
        }).catch(err => { throw err; });

    } catch (err) {
        interaction.reply({ content: `Si è verificato un errore durante la chiusura del ticket: \`${err}\``, ephemeral: true });
    }
}