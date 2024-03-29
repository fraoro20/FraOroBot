const redis = require('redis');

try {
    var connect = redis.createClient({
        socket: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT
        }
    });
    connect.connect();
} catch (err) {
    console.error('Errore di connessione a Redis: ', err);
    process.exit(1);
}

connect.on('connect', () => {
    console.log('■ Connesso a Redis:');
    require('./subscriber');
    require('./publisher');
});

connect.on('error', (err) => {
    console.error('Errore di connessione a Redis: ', err);
    process.exit(1)
});

connect.on('end', () => {
    console.log('Disconnesso da Redis');
});

module.exports = connect;