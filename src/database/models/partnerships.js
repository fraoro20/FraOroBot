const mongoose = require('mongoose');
const mongoConnect = require('../mongoDBConnect');

const Schema = new mongoose.Schema({
    guildId: String,
    partnershipId: String,
    createdAt: String,
    createdBy: String,
    partnershipName: String,
    partnershipLink: String,
    partnershipDescription: String,
    partnershipLogo: String,
    partnershipRole: String,
    partnershipStaffRole: String,
    partnershipStaff: Array,
    partnershipManager: String
});

module.exports = mongoConnect.model('partnerships', Schema);
