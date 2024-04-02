const Discord = require('discord.js');
const fs = require('fs');
const guildSettings = require('../../database/models/guildSettings');

const userCountdown = [];

/**
 * 
 * @param {Discord.Client} client 
 * @param {import('discord.js').Interaction} interaction  
 */

module.exports = async (client, interaction) => {
    if (interaction.guild) {
        let guild = await guildSettings.findOne({ guildId: interaction.guild.id });
        if (!guild) {
            guild = new guildSettings({
                guildId: interaction.guild.id,
            }).save();
            return interaction.reply({ content: `Errore durante il caricamento delle impostazioni del server, riprova tra qualche secondo.`, ephemeral: true });
        }
    }
    if (interaction.isCommand() || interaction.isUserContextMenuCommand()) {
        const cmd = client.commands.get(interaction.commandName);
        if (cmd) cmd.run(client, interaction, interaction.options._hoistedOptions).catch(err => {
            const errorId = generateErrorID(5, true);
            const error = new Discord.EmbedBuilder()
                .setDescription([
                    `An error occurred while executing the command \`/${interaction.commandName}\`!`,
                    (userCountdown.includes(interaction.user.id) ? `You have already reported an error in the last 30 minutes.` : `Contact the bot devs and provide the error ID: \`${errorId}\``)
                ].join('\n'))
                .setColor('Red');
            interaction.reply({ embeds: [error], ephemeral: true });

            if (userCountdown.includes(interaction.user.id)) return;

            interaction.client.channels.cache.get('1213907085574537226').send({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setAuthor({ name: `Error ID: ${errorId}`, iconURL: interaction.user.displayAvatarURL() })
                        .setTitle('⚠️ Command Error')
                        .addFields([
                            { name: 'Command', value: `\`/${interaction.commandName}\`` },
                            { name: 'Error', value: `\`\`\`xl\n${(err.stack.length > 1000 ? err.stack.substr(0, 1000) + '[...]' : err.stack)}\n\`\`\`` }
                        ])
                        .setTimestamp()
                ]
            })
            userCountdown.push(interaction.user.id);
            setTimeout(async () => {
                userCountdown.splice(userCountdown.indexOf(interaction.user.id), 1);
            }, 1800000);
        })
    }
    function generateErrorID(length, uppercase = false) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            let char = characters.charAt(Math.floor(Math.random() * characters.length));
            result += uppercase ? char.toUpperCase() : char;
        }
        return result;
    }

    if (interaction.isButton()) {
        switch (interaction.customId) {
            case 'Ticket_create':
                return require(`${process.cwd()}/src/commands/tickets/new.js`)(client, interaction);

            case 'Ticket_close':
                return require(`${process.cwd()}/src/commands/tickets/close.js`)(client, interaction);

            case 'Ticket_notify':
                return require(`${process.cwd()}/src/commands/tickets/notify.js`)(client, interaction);

            case 'Ticket_claim':
                return require(`${process.cwd()}/src/commands/tickets/claim.js`)(client, interaction);

            case 'Ticket_reopen':
                return require(`${process.cwd()}/src/commands/tickets/reopen.js`)(client, interaction);

            case 'Ticket_delete':
                return require(`${process.cwd()}/src/commands/tickets/delete.js`)(client, interaction);

            case 'Ticket_transcript':
                return require(`${process.cwd()}/src/commands/tickets/transcript.js`)(client, interaction);

            case 'accept_unban':
                return require(`${process.cwd()}/src/commands/request/requestAccept.js`)(client, interaction);

            case 'deny_unban':
                return require(`${process.cwd()}/src/commands/request/requestDeny.js`)(client, interaction);

            case 'giveaway_join': {
                return require(`${process.cwd()}/src/commands/giveaway/join.js`)(client, interaction);
            }
        }
    }


}