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
    if (guild.tickets.userBlacklist.includes(interaction.user.id)) return interaction.reply({ content: 'Ti è stata revocata la possibilità di creare nuovi ticket. Se pensi che sia un errore, contatta un amministratore', ephemeral: true });

    const ticketOpened = await tickets.find({ creator: interaction.user.id, status: 'OPEN' });
    if (ticketOpened.length > 2) return interaction.reply({ content: `Hai **${ticketOpened.length}** ticket aperti; potrai aprirne altri solo dopo aver chiuso almeno uno dei ticket aperti`, ephemeral: true });

    if (guild.tickets.categories.length === 0) return interaction.reply({ content: 'Non ci sono categorie di ticket disponibili', ephemeral: true });

    let ticketCategories = guild.tickets.categories.filter(category => category.hidden === false);

    const row = new Discord.ActionRowBuilder().addComponents(
        new Discord.StringSelectMenuBuilder()
            .setCustomId('ticketCategory')
            .setPlaceholder('Seleziona la categoria del ticket')
            .setMaxValues(1)
            .addOptions(ticketCategories.map(option => ({
                label: (option.queueStatus ? option.label : `🔒 ${option.label}`),
                value: option.value,
                description: (option.queueStatus ? option.description : `Categoria attualmente non disponibile`),
                emoji: option.emoji
            })))
    );

    await interaction.deferReply({ ephemeral: true });

    let ticketCategory;
    await interaction.followUp({ components: [row], ephemeral: true }).then(async (msg) => {
        await msg.awaitMessageComponent().then(async (i) => {
            ticketCategory = i.values[0].toUpperCase();
        });
    });

    if (ticketCategories.find(category => category.value === ticketCategory.toLowerCase()).queueStatus === false) return interaction.editReply({ content: 'Questa categoria non è attualmente disponibile', components: [], ephemeral: true });

    if (await tickets.findOne({ creator: interaction.user.id, status: 'OPEN', category: ticketCategory })) return interaction.editReply({ content: `Hai già un ticket aperto nella categoria ${ticketCategory}.`, components: [], ephemeral: true });

    if (!interaction.guild.channels.cache.get(guild.tickets.categories.find(ticke => ticke.value === ticketCategory.toLowerCase()).category)) return interaction.editReply({ content: 'Questa categoria non è stata configurata correttamente', components: [], ephemeral: true });

    let ticketCategoryDescription = ticketCategories.find(category => category.value === ticketCategory.toLowerCase()).description;

    const logChannel = interaction.guild.channels.cache.get(guild.tickets.logChannel);
    const supportRole = interaction.guild.roles.cache.get(guild.tickets.supportRole[0]);

    const rowTicket = new Discord.ActionRowBuilder()
        .addComponents(
            new Discord.ButtonBuilder()
                .setCustomId('Ticket_close')
                .setEmoji('🔒')
                .setStyle(Discord.ButtonStyle.Danger),
            new Discord.ButtonBuilder()
                .setCustomId('Ticket_claim')
                .setEmoji('✋')
                .setStyle(Discord.ButtonStyle.Primary),
            new Discord.ButtonBuilder()
                .setCustomId('Ticket_notify')
                .setEmoji('🔔')
                .setStyle(Discord.ButtonStyle.Primary),
        );


    try {
        let ticketId = generateTicketID(5);
        let ticketCategoryLabel = ticketCategories.find(category => category.value === ticketCategory.toLowerCase()).label;
        await interaction.guild.channels.create({
            name: `${ticketCategory}-${interaction.user.tag}`,
            topic: `#${ticketId} - ${ticketCategoryDescription}`,
            parent: guild.tickets.categories.find(ticke => ticke.value === ticketCategory.toLowerCase()).category
        }).then(async (channel) => {
            await channel.permissionOverwrites.create(interaction.user.id, { ViewChannel: true });

            await new tickets({
                ticketId: ticketId,
                creator: interaction.user.id,
                channel: channel.id,
                category: ticketCategory,
                createdAt: (Date.now() / 1000).toFixed(0),

            }).save();

            const embed = new Discord.EmbedBuilder()
                .setAuthor({ name: `${ticketCategoryLabel}`, iconURL: interaction.user.avatarURL({ size: 1024 }) })
                .setDescription(`${interaction.user}, spiega il tuo problema in dettaglio e attendi un membro dello staff (${supportRole}) che ti aiuterà.\nSii paziente, i nostri membri dello staff sono volontari e ti aiuteranno il prima possibile.`)
                .setColor('#2b2d31')
                .addFields([
                    {
                        name: "Ticket aperto il",
                        value: `<t:${(Date.now() / 1000).toFixed(0)}:F>`,
                        inline: false
                    }
                ]);

            await channel.send({ embeds: [embed], components: [rowTicket] });

            const log = new Discord.EmbedBuilder()
                .setTitle(`#${ticketId} ${ticketCategory} (${channel})`)
                .addFields([
                    { name: 'Creato da', value: `${interaction.user}`, inline: true },
                    { name: 'Aperto il', value: `<t:${(Date.now() / 1000).toFixed(0)}:F>`, inline: true }
                ])
                .setColor('Green');

            await logChannel.send({ embeds: [log], flags: [Discord.MessageFlags.SuppressNotifications] });

            interaction.editReply({ content: `Il tuo ticket ${ticketCategory} è stato aperto con successo in ${channel}`, components: [], ephemeral: true });
        }).catch((error) => {
            throw error;
        });
    } catch (error) {
        interaction.editReply({ content: `Si è verificato un errore durante la creazione del ticket: \`${error}\``, components: [], ephemeral: true });
    }

}

function generateTicketID(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}