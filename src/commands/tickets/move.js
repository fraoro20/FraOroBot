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

    const ticket = await tickets.findOne({ channel: interaction.channel.id });
    if (!ticket) return interaction.reply({ content: 'Questo canale non è un ticket', ephemeral: true });

    if (ticket.status === 'CLOSED') return interaction.reply({ content: 'Non puoi eseguire questa azione su un ticket già chiuso.', ephemeral: true });

    let ticketCategories = guild.tickets.categories;

    const row = new Discord.ActionRowBuilder().addComponents(
        new Discord.StringSelectMenuBuilder()
            .setCustomId('ticketCategory')
            .setPlaceholder('Seleziona la nuova categoria del ticket')
            .setMaxValues(1)
            .addOptions(ticketCategories.map(option => ({
                label: `${option.queueStatus ? '' : '🔓 '}${option.hidden ? '👁️ ' : ''}${option.label}`,
                value: option.value,
                description: (option.queueStatus ? option.description : `Categoria bloccata agli utenti, puoi spostare il ticket.`),
                emoji: option.emoji
            })))
    );

    await interaction.deferReply({ ephemeral: true });

    let newticketCategory;
    await interaction.followUp({ components: [row], ephemeral: true }).then(async (msg) => {
        await msg.awaitMessageComponent().then(async (i) => {
            newticketCategory = i.values[0].toUpperCase();
        });
    });

    if (newticketCategory === ticket.category) return interaction.editReply({ content: 'Il ticket è già in questa categoria', components: [], ephemeral: true });

    let ticketCategoryDescription = ticketCategories.find(category => category.value === newticketCategory.toLowerCase()).description;
    let ticketCategoryLabel = ticketCategories.find(category => category.value === newticketCategory.toLowerCase()).label;

    try {
        await interaction.channel.setParent(ticketCategories.find(category => category.value === newticketCategory.toLowerCase()).category);
        await interaction.guild.channels.cache.get(ticket.channel).edit({
            name: interaction.channel.name.replace(ticket.category.toLowerCase(), newticketCategory.toLowerCase()),
            topic: `${interaction.channel.topic.split(' - ')[0]} - ${ticketCategoryDescription}`
        }).then(async (channel) => {
            ticket.category = newticketCategory
            await ticket.save();

            await interaction.channel.permissionOverwrites.edit(ticket.creator, { ViewChannel: true });
            if (ticket.usersAdded.length > 0) {
                for (let user of ticket.usersAdded) {
                    await interaction.channel.permissionOverwrites.edit(user, { ViewChannel: true });
                }
            }

            const embed = new Discord.EmbedBuilder()
                .setDescription(`Il ticket è stato spostato in **${ticketCategoryLabel}** da ${interaction.user}`)
                .setColor('#2b2d31')

            channel.send({ embeds: [embed] });
            await interaction.editReply({ content: 'Ticket spostato con successo!', components: [] });
        }).catch((e) => { throw e; });
    } catch (e) {
        return interaction.editReply({ content: `Errore durante lo spostamento del ticket: \`${e}\``, ephemeral: true });
    }

}