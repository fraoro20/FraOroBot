const Discord = require('discord.js');
const tickets = require('../../database/models/tickets');
const fs = require('fs');
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

    var filters = {};
    try {
        filters.ticketId = interaction.options.getString('ticketid');
    } catch {
        filters.channel = interaction.channel.id;
    }
    const ticket = await tickets.findOne(filters);

    if (!ticket) return interaction.reply({ content: 'Nessun ticket trovato con questo ID', ephemeral: true });

    if (ticket.status === 'OPEN') return interaction.reply({ content: 'Non puoi richiedere un transcript per un ticket aperto', ephemeral: true });

    if (!ticket.transcript) return interaction.reply({ content: `Il ticket #${ticket.ticketId} non ha un transcript, potrebbe essersi verificato un errore durante la chiusura del ticket. Contatta un amministratore.`, ephemeral: true });

    fs.writeFileSync(`${ticket.ticketId}-${interaction.guild.nameAcronym}.txt`, ticket.transcript);

    const attachment = new Discord.AttachmentBuilder(`${ticket.ticketId}-${interaction.guild.nameAcronym}.txt`, `${ticket.ticketId}-${interaction.guild.nameAcronym}.txt`);

    await interaction.reply({ content: `In allegato il transcript del ticket #${ticket.ticketId}`, files: [attachment], ephemeral: true });

    fs.unlinkSync(`${ticket.ticketId}-${interaction.guild.nameAcronym}.txt`);

    interaction.guild.channels.cache.get(guild.tickets.transcriptChannel).send({ content: `[TRANSCRIPT REQUEST] ${interaction.user} ha richiesto il transcript del ticket **#${ticket.ticketId}**`, flags: [Discord.MessageFlags.SuppressNotifications] }).catch(() => { });
}