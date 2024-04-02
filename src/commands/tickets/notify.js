const Discord = require('discord.js');
const tickets = require('../../database/models/tickets');

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.CommandInteraction} interaction 
 * @param {String[]} args 
 */

module.exports = async (client, interaction, args) => {
    const ticket = await tickets.findOne({ channel: interaction.channel.id });
    if (!ticket) return interaction.reply({ content: 'Questo canale non è un ticket', ephemeral: true });

    if (ticket.status === 'CLOSED') return interaction.reply({ content: 'Non puoi eseguire questa azione su un ticket già chiuso.', ephemeral: true });

    const embed = new Discord.EmbedBuilder()
        .setAuthor({ name: 'Support Team', iconURL: 'https://discords.com/_next/image?url=https%3A%2F%2Fcdn.discordapp.com%2Femojis%2F1172636938486952067.png%3Fv%3D1&w=64&q=75' })
        .setDescription([
            `Salve <@${ticket.creator}>,`,
            `dal nostro ultimo intervento non ci hai più risposto,`,
            `ti aspetteremo ancora per **24 ore**, dopodiché chiuderemo il ticket.`,
            `Attendiamo un tuo riscontro...`,
            `Cordilamente, il Support Team.`
        ].join('\n'))
        .setColor('#2b2d31')
        .setTitle('💤 **AVVISO DI INATTIVITÀ** 💤');

    interaction.reply({ embeds: [embed], content: `<@${ticket.creator}>` });


}