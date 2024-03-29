const Discord = require('discord.js');
const tickets = require('../../database/models/tickets');
const settings = require('../../database/models/guildSettings');

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.CommandInteraction} interaction 
 * @param {String[]} args 
 */

module.exports = async (client, interaction, args) => {
    const json = interaction.options.getString('json-id');
    const type = interaction.options.getString('type');

    const guildSettings = await settings.findOne({ guildId: interaction.guild.id });
    if (!guildSettings) return interaction.reply({ content: 'Please setup the bot first', ephemeral: true });

    switch (type) {
        case 'add': {
            const category = JSON.parse(json);
            if (!category.label || !category.value || !category.description || !category.emoji || !category.category) return interaction.reply({ content: 'Please provide all the required fields', ephemeral: true });

            if (guildSettings.tickets.categories.find(c => c.value === category.value)) return interaction.reply({ content: 'This category already exists', ephemeral: true });

            try {
                guildSettings.tickets.categories.push(category);
                await guildSettings.save().catch(err => { throw err });
                interaction.reply({ content: 'Category added', ephemeral: true });
            } catch (error) {
                return interaction.reply({ content: `Errore durante l'aggiunta della categoria: ${error}`, ephemeral: true });
            }
            break;
        }

        case 'remove': {
            const categoryId = json;
            if (!categoryId) return interaction.reply({ content: 'Please provide the category ID', ephemeral: true });

            if (!guildSettings.tickets.categories.find(c => c.value === categoryId)) return interaction.reply({ content: 'This category does not exist', ephemeral: true });

            try {
                guildSettings.tickets.categories = guildSettings.tickets.categories.filter(c => c.value !== categoryId);
                await guildSettings.save().catch(err => { throw err });
                interaction.reply({ content: 'Category removed', ephemeral: true });
            } catch (error) {
                return interaction.reply({ content: `Errore durante la rimozione della categoria: ${error}`, ephemeral: true });
            }
            break;
        }

        case 'edit': {
            const category = JSON.parse(json);
            if (!category.label || !category.value || !category.description || !category.emoji || !category.category || !category.queueStatus) return interaction.reply({ content: 'Please provide all the required fields', ephemeral: true });

            if (!guildSettings.tickets.categories.find(c => c.value === category.value)) return interaction.reply({ content: 'This category does not exist', ephemeral: true });

            try {
                guildSettings.tickets.categories = guildSettings.tickets.categories.map(c => c.value === category.value ? category : c);
                await guildSettings.save().catch(err => { throw err });
                interaction.reply({ content: 'Category edited', ephemeral: true });
            } catch (error) {
                return interaction.reply({ content: `Errore durante la modifica della categoria: ${error}`, ephemeral: true });
            }
            break;
        }

        case 'disable': { //or enable
            const categoryId = json;
            if (!categoryId) return interaction.reply({ content: 'Please provide the category ID', ephemeral: true });

            const category = guildSettings.tickets.categories.find(c => c.value === categoryId);
            if (!category) return interaction.reply({ content: 'This category does not exist', ephemeral: true });

            try {
                category.queueStatus = !category.queueStatus;
                await guildSettings.save().catch(err => { throw err });
                interaction.reply({ content: `Category ${category.queueStatus ? 'enabled' : 'disabled'}`, ephemeral: true });
            } catch (error) {
                return interaction.reply({ content: `Errore durante l'attivazione/disattivazione della categoria: ${error}`, ephemeral: true });
            }
            break;
        }

        case 'list': {
            const categories = guildSettings.tickets.categories.map(category => `**${category.label}** - ${category.value} - ${category.queueStatus ? '✅' : '❌'} - ${interaction.guild.channels.cache.get(category.category)}`).join('\n');
            interaction.reply({ content: `**Ticket Categories**\n${categories}`, ephemeral: true });
            break;
        }
    }
}