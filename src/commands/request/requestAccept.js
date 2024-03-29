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
        value: `✅ Accettata da ${interaction.user}`,
        inline: false
    });
    const embed = new Discord.EmbedBuilder()
        .setTimestamp()
        .setColor(embedMessage.color)
        .setAuthor(embedMessage.author)
        .setTitle(embedMessage.title)
        .addFields(embedMessage.fields)
        .setDescription(embedMessage.description)
        .setFooter(embedMessage.footer);


    if (embedMessage.title.includes('Unmute')) {
        await guild.members.cache.get(author.id).timeout(0, `Richiesta di unmute accettata da ${interaction.user.tag}`).catch(() => {
            return interaction.reply({ content: `Si è verificato un errore durante l'unmute dell'utente. Probabilmente dovrai smutarlo manualmente. (${author})`, ephemeral: true });
        });
    } else if (embedMessage.title.includes('Unban')) {
        await guild.bans.remove(author, `Richiesta di unban accettata da ${interaction.user.tag}`).catch(() => {
            return interaction.reply({ content: `Si è verificato un errore durante l'unmute dell'utente. Probabilmente dovrai smutarlo manualmente. (${author})`, ephemeral: true });
        });
    }

    await message.edit({ embeds: [embed], components: [] });

    if (author)
        if (embedMessage.title.includes('Unmute'))
            await author.send({ content: `## La tua richiesta di unmute è stata accettata!\nOra puoi inviare messaggi e parlare di nuovo, ma leggi le regole!\nRicorda: questa è la tua ultima possibilità, la prossima volta sarai silenziato per sempre!` }).catch(() => { });
        else if (embedMessage.title.includes('Unban'))
            await author.send({ content: `## La tua richiesta di unban è stata accettata!\nOra puoi rientrare nel server, ma per favore leggi le regole!\nRicorda: questa è la tua ultima possibilità, la prossima volta sarai bannato per sempre.` }).catch(() => { });
}

