'use strict';

const { sequelize } = require('../connection');

async function getRegistrationByNumber(regNumber) {
  return sequelize.query(
    'SELECT * FROM registrations WHERE registration_number = :regNumber AND deleted_at IS NULL LIMIT 1',
    { replacements: { regNumber }, type: sequelize.QueryTypes.SELECT }
  ).then(rows => rows[0] || null);
}

async function getRegistrationsByBroker(brokerId) {
  return sequelize.query(
    'SELECT * FROM registrations WHERE broker_id = :brokerId AND deleted_at IS NULL ORDER BY created_at DESC',
    { replacements: { brokerId }, type: sequelize.QueryTypes.SELECT }
  );
}

async function getRegistrationsByUser(userId) {
  return sequelize.query(
    'SELECT * FROM registrations WHERE user_id = :userId AND deleted_at IS NULL ORDER BY created_at DESC',
    { replacements: { userId }, type: sequelize.QueryTypes.SELECT }
  );
}

async function getRegistrationUnitsByRegId(registrationId) {
  return sequelize.query(
    'SELECT * FROM registration_units WHERE registration_id = :registrationId AND deleted_at IS NULL',
    { replacements: { registrationId }, type: sequelize.QueryTypes.SELECT }
  );
}

async function getRegistrationUnitById(id) {
  return sequelize.query(
    'SELECT * FROM registration_units WHERE id = :id LIMIT 1',
    { replacements: { id }, type: sequelize.QueryTypes.SELECT }
  ).then(rows => rows[0] || null);
}

async function getRegistrationUnitByNumber(regNumber) {
  return sequelize.query(
    'SELECT * FROM registration_units WHERE registration_number = :regNumber AND deleted_at IS NULL LIMIT 1',
    { replacements: { regNumber }, type: sequelize.QueryTypes.SELECT }
  ).then(rows => rows[0] || null);
}

module.exports = {
  getRegistrationByNumber,
  getRegistrationsByBroker,
  getRegistrationsByUser,
  getRegistrationUnitsByRegId,
  getRegistrationUnitById,
  getRegistrationUnitByNumber,
};
