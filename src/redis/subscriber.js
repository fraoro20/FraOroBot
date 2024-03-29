const redisClient = require('./redisConnect');
const client = require('../index');
const Discord = require('discord.js');

const redisSubscriber = redisClient.duplicate();

redisSubscriber.connect();

redisSubscriber.on('connect', () => {
    console.log('   ▢ Connesso al subscriber Redis');
});

redisSubscriber.pSubscribe('*', (message, channel) => {
    console.log(`Messaggio da ${channel}: ${message}`);
    const channelArgs = channel.split(':');
    switch (channelArgs[0]) {
        case 'sync':
            switch (channelArgs[1]) {
                case 'role': {
                    const mess = JSON.parse(message);
                    const guild = client.guilds.cache.get(mess.guild);
                    const member = guild.members.cache.get(mess.member);
                    const role = guild.roles.cache.get(mess.role);
                    if (mess.action == 'add') {
                        member.roles.add(role);
                    } else {
                        member.roles.remove(role);
                    }
                    console.log(`Ruolo ${role.name} ${mess.action == 'add' ? 'aggiunto' : 'rimosso'} a ${member.user.tag}`);
                    break;
                }
            }
            break;
    }
});


