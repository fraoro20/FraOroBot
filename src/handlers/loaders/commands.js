const { REST, Routes } = require('discord.js');
const Discord = require('discord.js');
const fs = require('fs');

module.exports = (client) => {
    const commands = [];
    fs.readdirSync('./src/interactions').forEach(dirs => {
        const commandsDir = fs.readdirSync(`./src/interactions/${dirs}`).filter(files => files.endsWith('.js'));

        console.log(`■ Caricamento di ${commandsDir.length} comandi da ${dirs}:`);

        for (const file of commandsDir) {
            const command = require(`${process.cwd()}/src/interactions/${dirs}/${file}`);
            console.log(`   ▢ Caricamento di /${command.data.name}`);
            commands.push(command.data);
            client.commands.set(command.data.name, command);
        }
    });

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    (async () => {
        try {
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands },
            );
        } catch (error) {
            console.error(error);
        }
    })();
}