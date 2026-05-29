'use strict';

const { sequelize } = require('../connection');

async function getTicketById(id) {
  return sequelize.query(
    'SELECT * FROM support_tickets WHERE id = :id LIMIT 1',
    { replacements: { id }, type: sequelize.QueryTypes.SELECT }
  ).then(rows => rows[0] || null);
}

async function getTicketsByUser(userId) {
  return sequelize.query(
    'SELECT * FROM support_tickets WHERE user_id = :userId ORDER BY created_at DESC',
    { replacements: { userId }, type: sequelize.QueryTypes.SELECT }
  );
}

async function getTicketsByCategory(category) {
  return sequelize.query(
    'SELECT * FROM support_tickets WHERE category = :category ORDER BY created_at DESC LIMIT 100',
    { replacements: { category }, type: sequelize.QueryTypes.SELECT }
  );
}

async function getTicketsByStatus(status) {
  return sequelize.query(
    'SELECT * FROM support_tickets WHERE status = :status ORDER BY created_at DESC LIMIT 100',
    { replacements: { status }, type: sequelize.QueryTypes.SELECT }
  );
}

async function getTicketByNumber(ticketNumber) {
  return sequelize.query(
    'SELECT * FROM support_tickets WHERE ticket_number = :ticketNumber LIMIT 1',
    { replacements: { ticketNumber }, type: sequelize.QueryTypes.SELECT }
  ).then(rows => rows[0] || null);
}

module.exports = { getTicketById, getTicketsByUser, getTicketsByCategory, getTicketsByStatus, getTicketByNumber };
