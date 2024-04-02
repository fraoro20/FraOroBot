const Discord = require('discord.js');
const guildSettings = require('../../database/models/guildSettings');

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('tickets')
        .setDescription('Manage tickets')
        .setDMPermission(false)
        .addSubcommand(subcommand => subcommand
            .setName('new')
            .setDescription('Create a ticket')
        )
        .addSubcommand(subcommand => subcommand
            .setName('close')
            .setDescription('Close a ticket')
        )
        .addSubcommand(subcommand => subcommand
            .setName('review')
            .setDescription('Add a review to a ticket')
            .addStringOption(option => option
                .setName('ticketid')
                .setDescription('The ticket ID')
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('stars')
                .setDescription('The amount of stars')
                .setChoices(
                    { name: '⭐', value: '1' },
                    { name: '⭐⭐', value: '2' },
                    { name: '⭐⭐⭐', value: '3' },
                    { name: '⭐⭐⭐⭐', value: '4' },
                    { name: '⭐⭐⭐⭐⭐', value: '5' }
                )
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('claim')
            .setDescription('Claim a ticket')
        )
        .addSubcommand(subcommand => subcommand
            .setName('reopen')
            .setDescription('Reopen a ticket')
        )
        .addSubcommand(subcommand => subcommand
            .setName('notify')
            .setDescription('Notify the ticket creator')
        )
        .addSubcommand(subcommand => subcommand
            .setName('blacklist')
            .setDescription('Blacklist a user from creating tickets')
            .addUserOption(option => option
                .setName('user')
                .setDescription('The user to blacklist')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('move')
            .setDescription('Move a ticket to another category')
        )
        .addSubcommand(subcommand => subcommand
            .setName('adduser')
            .setDescription('Add a user to a ticket')
            .addUserOption(option => option
                .setName('user')
                .setDescription('The user to add')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('removeuser')
            .setDescription('Remove a user from a ticket')
            .addUserOption(option => option
                .setName('user')
                .setDescription('The user to remove')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('staffstats')
            .setDescription('Get staff stats')
            .addUserOption(option => option
                .setName('user')
                .setDescription('The user to get stats for')
                .setRequired(false)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('transcript')
            .setDescription('Get a transcript of a ticket')
            .addStringOption(option => option
                .setName('ticketid')
                .setDescription('The ticket ID')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('delete')
            .setDescription('Delete a ticket channel')
        )
        .addSubcommand(subcommand => subcommand
            .setName('info')
            .setDescription('Get info about a ticket')
            .addStringOption(option => option
                .setName('ticketid')
                .setDescription('The ticket ID')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('list')
            .setDescription('List tickets')
            .addStringOption(option => option
                .setName('status')
                .setDescription('The status of the tickets')
                .addChoices(
                    { name: 'Open', value: 'open' },
                    { name: 'Closed', value: 'closed' }
                )
            )
            .addUserOption(option => option
                .setName('user')
                .setDescription('The user to get tickets for')
            )
            .addUserOption(option => option
                .setName('operator')
                .setDescription('The operator to get tickets for')
            )

        )
    ,

    /**
     * 
     * @param {Discord.Client} client 
     * @param {Discord.CommandInteraction} interaction 
     * @param {String[]} args 
     */

    run: async (client, interaction, args) => {
        switch (interaction.options.getSubcommand()) {
            case 'claim':
            case 'notify':
            case 'blacklist':
            case 'move':
            case 'adduser':
            case 'removeuser':
            case 'staffstats':
            case 'transcript':
            case 'delete':
            case 'info':
            case 'list': {
                // Check if the user has the required permissions
                const guild = await guildSettings.findOne({ guildId: interaction.guild.id });
                if (!guild.tickets.supportRole.some(role => interaction.member.roles.cache.has(role)))
                    return interaction.reply({ content: 'Errore: Non hai il permesso di eseguire questo comando.', ephemeral: true })
            }
        }
        client.loadSubcommands(client, interaction, args);
    }
}