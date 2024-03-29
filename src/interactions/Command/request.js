const Discord = require('discord.js');

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('request')
        .setDMPermission(true)
        .setDescription('Request unban or unmute')
        .addSubcommand(addSubcommand => addSubcommand
            .setName('unban')
            .setDescription('Request unban')
            .addStringOption(option => option
                .setName('id')
                .setDescription('The ban ID')
            )
        )
        .addSubcommand(addSubcommand => addSubcommand
            .setName('unmute')
            .setDescription('Request unmute')
            .addStringOption(option => option
                .setName('id')
                .setDescription('The mute ID')
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