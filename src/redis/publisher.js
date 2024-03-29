const redisClient = require('./redisConnect');

const redisSubscriber = redisClient.duplicate();

redisSubscriber.connect();

redisSubscriber.on('connect', () => {
    console.log('   ▢ Connesso al publisher Redis');
});

function publish(channel, message) {
    if (!redisSubscriber) {
        redisSubscriber.connect();
    }
    try {
        redisSubscriber.publish(channel, message);
    } catch (err) {
        console.error('Errore di pubblicazione: ', err);
    }
}

module.exports = { publish };