const Discord = require('discord.js');

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Manage giveaways')
        .setDMPermission(false)
        .addSubcommand(addSubcommand => addSubcommand
            .setName('create')
            .setDescription('Create a giveaway')
            .addStringOption(option => option
                .setName('reward')
                .setDescription('The reward of the giveaway')
                .setRequired(true)
            )
            .addIntegerOption(option => option
                .setName('winners')
                .setDescription('The number of winners')
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('duration')
                .setDescription('The duration of the giveaway')
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('title')
                .setDescription('The title of the giveaway')
                .setRequired(false)
            )
            .addStringOption(option => option
                .setName('description')
                .setDescription('The message of the giveaway')
                .setRequired(false)
            )
        )
        .addSubcommand(addSubcommand => addSubcommand
            .setName('end')
            .setDescription('End a giveaway')
            .addStringOption(option => option
                .setName('id')
                .setDescription('The ID of the giveaway')
                .setRequired(true)
            )
        )
        .addSubcommand(addSubcommand => addSubcommand
            .setName('reroll')
            .setDescription('Reroll a giveaway')
            .addStringOption(option => option
                .setName('id')
                .setDescription('The ID of the giveaway')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('edit')
            .setDescription('Edit a giveaway')
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