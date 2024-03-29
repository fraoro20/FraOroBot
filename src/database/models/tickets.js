const mongoose = require('mongoose');
const mongoConnect = require('../mongoDBConnect');

const Schema = new mongoose.Schema({
    ticketId: String,
    creator: String,
    usersAdded: Array,
    channel: String,
    category: String,
    createdAt: String,
    closedAt: String,
    status: { type: String, default: 'OPEN' },
    operator: String,
    closedBy: String,
    closedReason: String,
    ticketReview: { type: Boolean, default: false },
    ticketReviewStars: Number,
    ticketReviewComment: String,
    transcript: String
});

module.exports = mongoConnect.model('tickets', Schema);
