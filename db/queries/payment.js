'use strict';

const { sequelize } = require('../connection');

async function getTransactionById(id) {
  return sequelize.query(
    'SELECT * FROM payment_transactions WHERE id = :id LIMIT 1',
    { replacements: { id }, type: sequelize.QueryTypes.SELECT }
  ).then(rows => rows[0] || null);
}

async function getTransactionsByUser(userId) {
  return sequelize.query(
    'SELECT * FROM payment_transactions WHERE user_id = :userId AND deleted_at IS NULL ORDER BY created_at DESC',
    { replacements: { userId }, type: sequelize.QueryTypes.SELECT }
  );
}

async function getTransactionsByStatus(status) {
  return sequelize.query(
    'SELECT * FROM payment_transactions WHERE status = :status AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 100',
    { replacements: { status }, type: sequelize.QueryTypes.SELECT }
  );
}

async function getTransactionsByRegistrationUnit(registrationUnitId) {
  return sequelize.query(
    'SELECT * FROM payment_transactions WHERE registration_unit_id = :id AND deleted_at IS NULL',
    { replacements: { id: registrationUnitId }, type: sequelize.QueryTypes.SELECT }
  );
}

async function getMilestonesByRegistrationUnit(registrationUnitId) {
  return sequelize.query(
    'SELECT * FROM milestone_payment_tracking WHERE registration_unit_id = :id ORDER BY id',
    { replacements: { id: registrationUnitId }, type: sequelize.QueryTypes.SELECT }
  );
}

module.exports = {
  getTransactionById,
  getTransactionsByUser,
  getTransactionsByStatus,
  getTransactionsByRegistrationUnit,
  getMilestonesByRegistrationUnit,
};
