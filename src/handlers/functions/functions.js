const Discord = require('discord.js');

/**
 * 
 * @param {Discord.Client} client 
 */

module.exports = async (client) => {
    /**
     * @param {Discord.Client} client 
     * @param {Discord.CommandInteraction} interaction 
     * @param {String[]} args 
     */
    client.loadSubcommands = async function (client, interaction, args) {
        try {
            return require(`${process.cwd()}/src/commands/${interaction.commandName}/${interaction.options.getSubCommand()}`)(client, interaction, args)
                .catch(err => client.emit('error', err)).finally(() => console.log(interaction.options.getSubCommand()))
        } catch {
            return require(`${process.cwd()}/src/commands/${interaction.commandName}/${interaction.options.getSubcommand()}`)(client, interaction, args)
                .catch(err => client.emit('error', err))
        }
    }
}