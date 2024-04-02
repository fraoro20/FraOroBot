const Discord = require('discord.js');
const settings = require('../../database/models/guildSettings');
const giveaways = require('../../database/models/giveaways');

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.Interaction} interaction 
 * @param {String[]} args 
 */

module.exports = async (client, interaction, args) => {
    const giveaway = await giveaways.findOne({ guildId: interaction.guild.id, messageId: interaction.message.id });
    if (!giveaway) return interaction.reply({ content: 'Non ho trovato questo giveaway', ephemeral: true });

    if (giveaway.ended) return interaction.reply({ content: 'Ci dispiace, ma questo giveaway è già terminato! Resta aggiornato per i prossimi!', ephemeral: true });

    if (giveaway.joinedUsers.includes(interaction.user.id)) {
        giveaway.joinedUsers.splice(giveaway.joinedUsers.indexOf(interaction.user.id), 1);
        await giveaway.save();
        interaction.reply({ content: `Hai rimosso la tua partecipazione al giveaway!`, ephemeral: true });
    } else {
        giveaway.joinedUsers.push(interaction.user.id);
        await giveaway.save();
        interaction.reply({ content: `Ti sei iscritto al giveaway, in bocca al lupo!`, ephemeral: true });
    }

    (await interaction.channel.messages.fetch(giveaway.messageId)).components[0].components[0].data.label = `Partecipa [${giveaway.joinedUsers.length}]`;
    (await interaction.channel.messages.fetch(giveaway.messageId)).edit({ components: (await interaction.channel.messages.fetch(giveaway.messageId)).components });
}