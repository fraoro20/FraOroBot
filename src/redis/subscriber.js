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
    }
});

module.exports = redisSubscriber;