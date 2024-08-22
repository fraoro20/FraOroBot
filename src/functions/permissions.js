const Discord = require('discord.js');
const staff = '1203795617881530469';
const staffplus = '1241778256512815174';
/**
 * 
 * @param {Discord.Client} client 
 * @param {String[]} userId 
 */

async function isStaff(client, userId) {
    let guild = client.guilds.cache.get('1203795617881530469');
    let user = await guild.members.fetch(userId);
    if (user.roles.cache.has(staff) || user.roles.cache.has(staffplus))
        return true;
    else
        return false;
}

async function isStaffPlus(client, userId) {
    let guild = client.guilds.cache.get('1203795617881530469');
    let user = await guild.members.fetch(userId);
    if (user.roles.cache.has(staffplus))
        return true;
    else
        return false;
}

module.exports = { isStaff, isStaffPlus };