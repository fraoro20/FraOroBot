const Discord = require('discord.js');
const settings = require('../../database/models/guildSettings');
const giveaways = require('../../database/models/giveaways');
const { giveawayEnd } = require('../../functions/giveaway');

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.CommandInteraction} interaction 
 * @param {String[]} args 
 */

module.exports = async (client, interaction, args) => {
    const reward = interaction.options.getString('reward');
    const winners = interaction.options.getInteger('winners');
    const duration = interaction.options.getString('duration');
    const message = interaction.options.getString('description');
    const title = interaction.options.getString('title');

    const guildSettings = await settings.findOne({ guildId: interaction.guild.id });
    if (!guildSettings.giveawayChannel) return interaction.reply({ content: 'Non è stato impostato un canale per i giveaway', ephemeral: true });

    const channel = interaction.guild.channels.cache.get(guildSettings.giveawayChannel);

    const units = duration.slice(-1);
    const value = Number(duration.slice(0, -1))
    var durationMS;
    switch (units) {
        case 'd':
            durationMS = value * 24 * 60 * 60 * 1000;
            break
        case 'h':
            durationMS = value * 60 * 60 * 1000;
            break
        case 'm':
            durationMS = value * 60 * 1000;
            break
        case 's':
            durationMS = value * 1000;
            break
        default:
            return interaction.reply({ content: 'Durata non valida', ephemeral: true });
    }

    const dateEnd = Date.now() + durationMS;

    const embed = new Discord.EmbedBuilder()
        .setAuthor({ name: 'Giveaway Avviato', iconURL: interaction.guild.iconURL() })
        .setDescription([
            `**Avviato da:** ${interaction.user}`,
            `**Premio:** ${reward}`,
            `**Vincitori:** ${winners.toString()}`,
            `**Durata:** ${duration}`
        ].join('\n'))
        .setFooter({ text: `Scade il ${new Date(dateEnd).toLocaleString()}` })
        .setColor('#2b2d31')
        .setThumbnail('https://owlbertsio-resized.s3.amazonaws.com/Popper.psd.full.png');

    if (message) embed.addFields({ name: 'Descrizione Giveaway', value: `${message.replace(/\\n/g, '\n')}`, inline: false })
    if (title) embed.setTitle(title);

    const button = new Discord.ActionRowBuilder()
        .addComponents(
            new Discord.ButtonBuilder()
                .setCustomId('giveaway_join')
                .setLabel('Partecipa')
                .setEmoji('👉')
                .setStyle(Discord.ButtonStyle.Primary)
        )

    let msgid;
    channel.send({ embeds: [embed], components: [button] }).then(async (msg) => {
        await new giveaways({
            messageId: msg.id,
            channelId: msg.channel.id,
            guildId: interaction.guild.id,
            reward: reward,
            startAt: Date.now(),
            nWinners: winners,
            duration: durationMS,
            dateEnd: dateEnd,
            message: (message ? message : 'Nessun messaggio')
        }).save();
        msgid = msg.id;
    });
    interaction.reply({ content: 'Giveaway avviato', ephemeral: true });

    setTimeout(async () => {
        const giveaway = await giveaways.findOne({ messageId: msgid, guildId: interaction.guild.id });
        if (!giveaway.ended)
            await giveawayEnd(client, giveaway);
    }, durationMS);

}