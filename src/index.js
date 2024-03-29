const Discord = require('discord.js');
const fs = require('fs');
const { publish } = require('./redis/publisher');
require('dotenv').config();

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildVoiceStates,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.DirectMessages,
        Discord.GatewayIntentBits.DirectMessageTyping,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildPresences,
        Discord.GatewayIntentBits.GuildEmojisAndStickers
    ]
})

console.log('•'.repeat(50));
console.log('FraOroBot - Discord Bot by FraOro');
console.log('Versione: 1.0.0');
console.log('•'.repeat(50));

client.on('ready', () => {
    console.log(`■ ${client.user.tag} è online!`)
    console.log('•'.repeat(50));
});

require('./database/mongoDBConnect');

require('./redis/redisConnect');

client.commands = new Discord.Collection();

fs.readdirSync('./src/handlers').forEach((dir) => {
    fs.readdirSync(`./src/handlers/${dir}`).forEach((handler) => {
        require(`./handlers/${dir}/${handler}`)(client);
    });
});

client.login(process.env.DISCORD_TOKEN);

module.exports = client;