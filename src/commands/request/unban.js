const Discord = require('discord.js');
const fs = require('fs');

let cooldowns;
try {
    cooldowns = new Map(JSON.parse(fs.readFileSync('cooldowns.json', 'utf8')));
} catch (err) {
    cooldowns = new Map();
}

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.CommandInteraction} interaction 
 * @param {String[]} args 
 */
module.exports = async (client, interaction, args) => {
    const banId = interaction.options.getString('id');

    const guild = client.guilds.cache.get('1203795617881530469');

    if (!guild.bans.cache.get(interaction.user.id)) return interaction.reply({ content: `Non risulti bannato su ${guild.name}!`, ephemeral: true });

    const now = Date.now();
    if (cooldowns.has(interaction.user.id)) {
        const userCooldowns = cooldowns.get(interaction.user.id);
        for (let i = 0; i < userCooldowns.length; i++) {
            if (now < userCooldowns[i].expiry && userCooldowns[i].type === 'unban')
                return interaction.reply({ content: `Puoi richiedere un ${userCooldowns[i].type} di nuovo tra ${Math.floor((userCooldowns[i].expiry - now) / (1000 * 60 * 60 * 24))} giorni`, ephemeral: true });
            else if (now >= userCooldowns[i].expiry) {
                userCooldowns.splice(i, 1);
                i--;
                fs.writeFileSync('cooldowns.json', JSON.stringify(Array.from(cooldowns.entries())));
            }
        }
    }

    const modal = new Discord.ModalBuilder()
        .setTitle('Unban Request')
        .setCustomId('unban')
        .addComponents(
            new Discord.ActionRowBuilder().addComponents(
                new Discord.TextInputBuilder()
                    .setCustomId('appeal')
                    .setLabel('Perché dovresti essere sbannato?')
                    .setPlaceholder('Dovrei essere sbannato perché...')
                    .setStyle(Discord.TextInputStyle.Paragraph)
                    .setRequired(true)
            ),
            new Discord.ActionRowBuilder().addComponents(
                new Discord.TextInputBuilder()
                    .setCustomId('more')
                    .setLabel(`Altro da aggiungere alla tua richiesta?`)
                    .setPlaceholder('[Opzionale] Fornisci qui eventuali informazioni aggiuntive.')
                    .setStyle(Discord.TextInputStyle.Paragraph)
                    .setRequired(false)
            )
        );

    if (!banId) modal.addComponents(
        new Discord.ActionRowBuilder().addComponents(
            new Discord.TextInputBuilder()
                .setCustomId('reason')
                .setLabel('Perché sei stato bannato?')
                .setPlaceholder('Son stato bannato perché... (incolla qui il motivo del ban)')
                .setStyle(Discord.TextInputStyle.Paragraph)
                .setRequired(true)
        )
    )

    await interaction.showModal(modal);

    const submitted = await interaction.awaitModalSubmit({
        time: 300000,
        filter: (i) => i.user.id === interaction.user.id
    }).catch(() => { });

    if (!submitted) return;

    const embed = new Discord.EmbedBuilder()
        .setTitle('Richiesta UnBan')
        .setTimestamp()
        .setColor('#2b2d31')
        .setAuthor({ name: `${interaction.user.tag} (${interaction.user.id})`, iconURL: interaction.user.avatarURL({ size: 1024 }) })
        .addFields([
            { name: '2. Perché dovresti essere sbannato?', value: submitted.fields.getTextInputValue('appeal'), inline: false }
        ]);

    if (submitted.fields.getTextInputValue('reason')) embed.addFields({ name: '1. Perché sei stato bannato?', value: submitted.fields.getTextInputValue('reason'), inline: false });
    if (submitted.fields.getTextInputValue('more')) embed.addField('3. Altro', submitted.fields.getTextInputValue('more'), false);
    if (banId) embed.setDescription('BanID: ' + banId);

    const row = new Discord.ActionRowBuilder().addComponents(
        new Discord.ButtonBuilder()
            .setCustomId('accept_unban')
            .setLabel('Accetta')
            .setStyle(Discord.ButtonStyle.Success),
        new Discord.ButtonBuilder()
            .setCustomId('deny_unban')
            .setLabel('Rifiuta')
            .setStyle(Discord.ButtonStyle.Danger)
    )

    const channel = guild.channels.cache.get('1204532834912706600');

    channel.send({ embeds: [embed], components: [row] });
    submitted.reply({ content: 'La tua richiesta è stata inviata ai moderatori. Attendi una risposta.', embeds: [embed] });

    if (cooldowns.has(interaction.user.id))
        cooldowns.get(interaction.user.id).push({ type: 'unban', expiry: now + 2592000000 });
    else
        cooldowns.set(interaction.user.id, [{ type: 'unban', expiry: now + 2592000000 }]);
    fs.writeFileSync('cooldowns.json', JSON.stringify(Array.from(cooldowns.entries())));
}