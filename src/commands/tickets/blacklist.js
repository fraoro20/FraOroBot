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
    const user = interaction.options.getUser('user');

    const guild = await guildSettings.findOne({ guildId: interaction.guild.id });
    if (!interaction.member.roles.cache.some(role => role.id === guild.tickets.supportRole)) return;
    if (!guild) return interaction.reply({ content: 'Errore durante il caricamento delle impostazioni del server', ephemeral: true });

    if (guild.tickets.userBlacklist.includes(user.id)) {
        guild.tickets.userBlacklist.splice(guild.tickets.userBlacklist.indexOf(user.id), 1);
        await guild.save();
        interaction.reply({ content: `L'utente <@${user.id}> è stato rimosso dalla blacklist`, ephemeral: true });
    } else {
        guild.tickets.userBlacklist.push(user.id);
        await guild.save();
        interaction.reply({ content: `L'utente <@${user.id}> è stato aggiunto alla blacklist`, ephemeral: true });
    }
}