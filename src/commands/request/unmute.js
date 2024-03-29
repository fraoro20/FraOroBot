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
    const muteId = interaction.options.getString('id');

    const guild = client.guilds.cache.get('1203795617881530469');

    if (!guild.members.cache.get(interaction.user.id).communicationDisabledUntil) return interaction.reply({ content: `Non risulti mutato su ${guild.name}!`, ephemeral: true });

    const now = Date.now();
    if (cooldowns.has(interaction.user.id)) {
        const userCooldowns = cooldowns.get(interaction.user.id);
        for (let i = 0; i < userCooldowns.length; i++) {
            if (now < userCooldowns[i].expiry && userCooldowns[i].type === 'unmute')
                return interaction.reply({ content: `Puoi richiedere un ${userCooldowns[i].type} di nuovo tra ${Math.floor((userCooldowns[i].expiry - now) / (1000 * 60 * 60 * 24))} giorni`, ephemeral: true });
            else if (now >= userCooldowns[i].expiry) {
                userCooldowns.splice(i, 1);
                i--;
                fs.writeFileSync('cooldowns.json', JSON.stringify(Array.from(cooldowns.entries())));
            }
        }
    }

    const modal = new Discord.ModalBuilder()
        .setTitle('Unmute Request')
        .setCustomId('unmute')
        .addComponents(
            new Discord.ActionRowBuilder().addComponents(
                new Discord.TextInputBuilder()
                    .setCustomId('appeal')
                    .setLabel('Perché dovresti essere smutato?')
                    .setPlaceholder('Dovrei essere smutato perché...')
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

    if (!muteId) modal.addComponents(
        new Discord.ActionRowBuilder().addComponents(
            new Discord.TextInputBuilder()
                .setCustomId('reason')
                .setLabel('Perché sei stato mutato?')
                .setPlaceholder('Sono stato mutato perché... (incolla qui il motivo del mute)')
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
        .setTitle('Unmute Request')
        .setTimestamp()
        .setColor(client.embedColor)
        .setAuthor({ name: `${interaction.user.tag} (${interaction.user.id})`, iconURL: interaction.user.avatarURL({ size: 1024 }) })
        .addFields([
            { name: '2. Perché dovresti essere smutato?', value: submitted.fields.getTextInputValue('appeal'), inline: false }
        ]);

    if (submitted.fields.getTextInputValue('reason')) embed.addFields({ name: '1. Perché sei stato mutato?', value: submitted.fields.getTextInputValue('reason'), inline: false });
    if (submitted.fields.getTextInputValue('more')) embed.addFields({ name: '3. Altro', value: submitted.fields.getTextInputValue('more'), inline: false })
    if (muteId) embed.setDescription('MuteID: ' + muteId);

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

    const channel = await guild.channels.fetch('1204532757779447858');

    channel.send({ embeds: [embed], components: [row] });
    submitted.reply({ content: 'La tua richiesta è stata inviata ai moderatori. Attendi una risposta.', embeds: [embed], ephemeral: true });

    if (cooldowns.has(interaction.user.id))
        cooldowns.get(interaction.user.id).push({ type: 'unmute', expiry: now + 2592000000 });
    else
        cooldowns.set(interaction.user.id, [{ type: 'unmute', expiry: now + 2592000000 }]);
    fs.writeFileSync('cooldowns.json', JSON.stringify(Array.from(cooldowns.entries())));
}