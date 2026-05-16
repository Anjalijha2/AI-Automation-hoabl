'use strict';

const { sequelize } = require('../connection');

async function getBookingById(id) {
  const [rows] = await sequelize.query(
    'SELECT * FROM bookings WHERE id = :id LIMIT 1',
    { replacements: { id }, type: sequelize.QueryTypes.SELECT }
  );
  return rows || null;
}

async function getBookingsByStatus(status) {
  return sequelize.query(
    'SELECT * FROM bookings WHERE status = :status ORDER BY created_at DESC',
    { replacements: { status }, type: sequelize.QueryTypes.SELECT }
  );
}

module.exports = { getBookingById, getBookingsByStatus };
