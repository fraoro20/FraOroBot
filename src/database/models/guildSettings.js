const mongoose = require('mongoose');
const mongoConnect = require('../mongoDBConnect');

const ticketCategory = new mongoose.Schema({
    value: String,
    label: String,
    description: String,
    emoji: String,
    queueStatus: Boolean,
    category: String
});

const Schema = new mongoose.Schema({
    guildId: String,
    tickets: {
        supportRole: String,
        logChannel: String,
        transcriptChannel: String,
        userBlacklist: Array,
        categories: [ticketCategory]
    }
});

module.exports = mongoConnect.model('guildSettings', Schema);
