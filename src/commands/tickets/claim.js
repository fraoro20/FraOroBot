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

    await interaction.deferReply();
    if (ticket.operator === undefined) {
        ticket.operator = interaction.user.id;
        await ticket.save();

        const embed = new Discord.EmbedBuilder()
            .setDescription(`${interaction.user} ha preso in carico la richiesta.`)
            .setColor('#2b2d31')

        await interaction.editReply({ embeds: [embed] });
    } else if (ticket.operator === interaction.user.id) {
        ticket.operator = undefined;
        await ticket.save();

        const embed = new Discord.EmbedBuilder()
            .setDescription(`${interaction.user} non gestisce più questo ticket.`)
            .setColor('#2b2d31')

        return interaction.editReply({ embeds: [embed] });
    } else {
        return interaction.reply({ content: `Questo ticket è già gestito da <@${ticket.operator}>, per cambiare l'operatore chiedi a <@${ticket.operator}> di lasciare il ticket!`, ephemeral: true });
    }
}