const mongoose = require('mongoose');
const mongoConnect = require('../mongoDBConnect');

const Schema = new mongoose.Schema({
    guildId: String,
    channelId: String,
    messageId: String,
    nWinners: Number,
    startAt: Number,
    endAt: Number,
    ended: { type: Boolean, default: false },
    joinedUsers: Array,
    winners: Array,
    creatorId: String,
    reward: String,
    duration: String,
});

module.exports = mongoConnect.model('giveaways', Schema);
