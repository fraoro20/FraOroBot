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

    const user = interaction.options.getUser('user');

    if (ticket.usersAdded.includes(user.id)) return interaction.reply({ content: 'Questo utente è già stato aggiunto al ticket', ephemeral: true });

    if (ticket.operator === user.id) return interaction.reply({ content: 'Questo utente è il creatore del ticket', ephemeral: true });

    try {
        ticket.usersAdded.push(user.id);
        await ticket.save();

        await interaction.channel.permissionOverwrites.create(user.id, {
            ViewChannel: true,
        });

        const embed = new Discord.EmbedBuilder()
            .setDescription(`${user} è stato aggiunto al ticket da ${interaction.user}`)
            .setColor('#2b2d31')

        interaction.reply({ embeds: [embed] });
        user.send({ content: `Sei stato aggiunto al ticket ${interaction.channel} di <@${ticket.creator}>` }).catch(() => { });
    } catch (e) {
        interaction.reply({ content: `Errore durante l'aggiunta dell'utente al ticket: \`${e}\``, ephemeral: true });
    }


}