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

// Full registration_unit row by number, INCLUDING soft-deleted (no deleted_at filter)
// — needed to verify cancellation soft-deletes the row.
async function getRegistrationUnitByNumberAny(regNumber) {
  return sequelize.query(
    'SELECT id, registration_id, unit_id, status, refund_at, deleted_at FROM registration_units WHERE registration_number = :regNumber ORDER BY id DESC LIMIT 1',
    { replacements: { regNumber }, type: sequelize.QueryTypes.SELECT }
  ).then((rows) => rows[0] || null);
}

// Active-row counts across the cancellation-cascade tables for a registration_unit.
async function getCancellationCascadeCounts(regUnitId) {
  const count = async (tbl, col) => sequelize.query(
    `SELECT COUNT(*) n FROM ${tbl} WHERE ${col} = :id AND deleted_at IS NULL`,
    { replacements: { id: regUnitId }, type: sequelize.QueryTypes.SELECT }
  ).then((r) => Number(r[0].n)).catch(() => -1);
  return {
    payment_transactions: await count('payment_transactions', 'registration_unit_id'),
    registration_unit_offers: await count('registration_unit_offers', 'registration_unit_id'),
    registration_unit_payment_schedules: await count('registration_unit_payment_schedules', 'registration_unit_id'),
    milestone_payment_tracking: await count('milestone_payment_tracking', 'registration_unit_id'),
  };
}

// Total refund rows (for "cancel does not auto-refund" — table stays unchanged).
async function getRefundCount() {
  return sequelize.query(
    'SELECT COUNT(*) n FROM payment_refunds',
    { type: sequelize.QueryTypes.SELECT }
  ).then((r) => Number(r[0].n)).catch(() => -1);
}

module.exports = {
  getRegistrationByNumber,
  getRegistrationsByBroker,
  getRegistrationsByUser,
  getRegistrationUnitsByRegId,
  getRegistrationUnitById,
  getRegistrationUnitByNumber,
  getRegistrationUnitByNumberAny,
  getCancellationCascadeCounts,
  getRefundCount,
};
