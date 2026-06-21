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

// ── Gateway audit (NEG_097) ────────────────────────────────────────────────
// Distribution of the `gateway` column across all payment_transactions.
// Online (is_offline=0) txns are recorded against a payment gateway; the
// canonical/active online gateway for the platform is 'easebuzz'.
async function getGatewayDistribution() {
  return sequelize.query(
    'SELECT gateway, is_offline, COUNT(*) AS n ' +
    'FROM payment_transactions GROUP BY gateway, is_offline ORDER BY n DESC',
    { type: sequelize.QueryTypes.SELECT }
  );
}

// Most recent online (gateway-backed) transactions — used to assert the
// recorded gateway value on a real allocation/online payment record.
async function getRecentOnlineTransactions(limit = 20) {
  return sequelize.query(
    'SELECT id, registration_id, registration_unit_id, gateway, is_offline, status, payment_method, created_at ' +
    'FROM payment_transactions WHERE is_offline = 0 AND deleted_at IS NULL ' +
    'ORDER BY created_at DESC LIMIT :limit',
    { replacements: { limit }, type: sequelize.QueryTypes.SELECT }
  );
}

module.exports = {
  getTransactionById,
  getTransactionsByUser,
  getTransactionsByStatus,
  getTransactionsByRegistrationUnit,
  getMilestonesByRegistrationUnit,
  getGatewayDistribution,
  getRecentOnlineTransactions,
};
