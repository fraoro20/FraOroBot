const Discord = require('discord.js');

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('setup')
        .setDefaultMemberPermissions(Discord.PermissionsBitField.Flags.ManageGuild)
        .setDescription('Setup the bot')
        .setDMPermission(false)
        .addSubcommandGroup(subcommandGroup => subcommandGroup
            .setName('tickets')
            .setDescription('Setup tickets')
            .addSubcommand(subcommand => subcommand
                .setName('categories')
                .setDescription('Setup ticket categories')
                .addStringOption(option => option
                    .setName('type')
                    .setDescription('Add or remove a category')
                    .setChoices(
                        { name: 'Add', value: 'add' },
                        { name: 'Remove', value: 'remove' },
                        { name: 'Edit', value: 'edit' },
                        { name: 'Disable/Enable', value: 'disable' },
                        { name: 'List', value: 'list' }
                    )
                    .setRequired(true)
                )
                .addStringOption(option => option
                    .setName('json-id')
                    .setDescription('The JSON data of the category')
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName('support-role')
                .setDescription('Setup the support role')
                .addRoleOption(option => option
                    .setName('role')
                    .setDescription('The support role')
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName('ticket-logs')
                .setDescription('Setup the ticket logs channel')
                .addChannelOption(option => option
                    .setName('channel')
                    .setDescription('The ticket logs channel')
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName('ticket-transcripts')
                .setDescription('Setup the ticket transcripts channel')
                .addChannelOption(option => option
                    .setName('channel')
                    .setDescription('The ticket transcripts channel')
                    .setRequired(true)
                )
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('giveaway-channel')
            .setDescription('Setup the giveaway channel')
            .addChannelOption(option => option
                .setName('channel')
                .setDescription('The giveaway channel')
                .setRequired(true)
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
        client.loadSubcommands(client, interaction, args);
    }
}