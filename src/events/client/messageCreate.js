const Discord = require('discord.js');

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.Message} message  
 */

module.exports = async (client, message) => {
    if (message.author.bot) return;
    if (message.content.startsWith('-') && (await message.guild.members.fetch(message.author.id)).permissions.has(Discord.PermissionFlagsBits.ManageGuild)) {
        const args = message.content.slice('-'.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        switch (command) {
            case 'layout': {
                switch (args[0]) {
                    case 'ticket': {
                        const embed = new Discord.EmbedBuilder()
                            .setTitle('Come creare un ticket?')
                            .setAuthor({ name: 'Support Team', iconURL: 'https://discords.com/_next/image?url=https%3A%2F%2Fcdn.discordapp.com%2Femojis%2F1172636938486952067.png%3Fv%3D1&w=64&q=75' })
                            .setDescription([
                                `Hai bisogno di aiuto? Nessun problema!`,
                                `Basta fare clic sul pulsante qui sotto e selezionare la categoria più adatta al tuo problema.`
                            ].join('\n'))
                            .setFields([
                                {
                                    name: 'Alcune informazioni da tenere a mente quando apri un ticket:', value: [
                                        `\`\`\`1. Non aprire più ticket per lo stesso problema.`,
                                        `2. Non abusare di questo sistema di supporto.`,
                                        `3. Non menzionare lo staff nel ticket, verrai aiutato appena possibile.\`\`\``,
                                        `Non seguire le linee guida può comportare la revoca della tua capacità di creare nuovi ticket.`
                                    ].join('\n'), inline: true
                                },
                                { name: `Devi segnalare un utente?`, value: `Usa il comando </segnala:1206705804196184065> oppure tasto destro sul profilo o sul messaggio dell'utente e seleziona App > Segnala`, inline: false },
                            ]);

                        const row = new Discord.ActionRowBuilder()
                            .addComponents(
                                new Discord.ButtonBuilder()
                                    .setCustomId('Ticket_create')
                                    .setEmoji('👉')
                                    .setLabel('Clicca qui per aprire un ticket!')
                                    .setStyle(Discord.ButtonStyle.Secondary)
                            );

                        await message.channel.send({ embeds: [embed], components: [row] });
                        message.delete();
                        break;
                    }
                    default: {
                        const embed = new Discord.EmbedBuilder()
                            .setTitle('Need help?')
                            .setDescription(
                                `Using the command \`${command}\` you can send a predefined message in the channel you want (for example, to create a ticket).
                            **Usage:** \`${command} <layout>\`
                            **Available layouts:**
                            - \`ticket\` - *Create a ticket*`);

                        message.author.send({ embeds: [embed] });
                        message.delete();
                        break;
                    }
                }
                break;
            }
        }
    }
}