const Discord = require('discord.js');
/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.Interaction} interaction 
 */

module.exports = async (client, interaction) => {
    const guild = client.guilds.cache.get('1203795617881530469');
    const message = interaction.message;
    const embedMessage = message.embeds[0];
    const requestAuthor = embedMessage.author.name.substring(embedMessage.author.name.indexOf('(') + 1, embedMessage.author.name.indexOf(')'))
    const author = await interaction.guild.members.fetch(requestAuthor);
    embedMessage.fields.push({
        name: 'Stato Richiesta',
        value: `❌ Rifiutata da ${interaction.user}`,
        inline: false
    });
    const embed = new Discord.EmbedBuilder()
        .setTimestamp()
        .setColor(embedMessage.color)
        .setAuthor(embedMessage.author)
        .setDescription(embedMessage.description)
        .setTitle(embedMessage.title)
        .addFields(embedMessage.fields)
        .setFooter(embedMessage.footer);

    await message.edit({ embeds: [embed], components: [] });

    if (author)
        author.send({ content: `## La tua richiesta di ${embedMessage.title} è stata rifiutata. Puoi riprovare tra 30 giorni.` }).catch(() => { });
}