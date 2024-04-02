const redisClient = require('./redisConnect');

const redisPublisher = redisClient.duplicate();

redisPublisher.connect();

redisPublisher.on('connect', () => {
    console.log('   ▢ Connesso al publisher Redis');
});

function publish(channel, message) {
    if (!redisPublisher) {
        redisPublisher.connect();
    }
    try {
        redisPublisher.publish(channel, message);
    } catch (err) {
        console.error('Errore di pubblicazione: ', err);
    }
}

module.exports = { publish, redisPublisher };