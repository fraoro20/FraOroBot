const Discord = require('discord.js');
const fs = require('fs');

module.exports = (client) => {

    fs.readdirSync('./src/events').forEach(dirs => {
        const events = fs.readdirSync(`./src/events/${dirs}`).filter(files => files.endsWith('.js'));

        console.log(`■ Caricamento di ${events.length} eventi da ${dirs}:`);

        for (const file of events) {
            const event = require(`${process.cwd()}/src/events/${dirs}/${file}`);
            const eventName = file.split('.')[0];
            const eventUpperCase = eventName.charAt(0).toUpperCase() + eventName.slice(1);
            console.log(`   ▢ Caricamento di ${eventName}`);
            if (Discord.Events[eventUpperCase] == undefined)
                client.on(eventName, event.bind(null, client)).setMaxListeners(0);
            else
                client.on(Discord.Events[eventUpperCase], event.bind(null, client)).setMaxListeners(0);
        }
    });
}