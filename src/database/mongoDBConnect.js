const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

try {
    var connect = mongoose.createConnection(process.env.MONGODB_URI);

} catch (err) {
    console.error('Errore di connessione al database: ', err);
    process.exit(1);
}

connect.on('connected', () => {
    console.log('■ Connesso al database MongoDB');
});

connect.on('error', (err) => {
    console.error('Errore di connessione al database: ', err);
    process.exit(1)
})

module.exports = connect;