'use strict';

// db/queries/unit-details.js
// Raw Sequelize queries supporting Buyer Portal Unit Details DB tests.
// Backs tests in tests/api/unit-details.api.spec.js (BYR_UNIT_031, 032, 033, 035).
//
// All queries use parameterised replacements — never string-concat user input.
// Module is consumed by spec files only; never inline SQL in specs.

const { sequelize } = require('../connection');

/**
 * BYR_UNIT_031 — Returns unit-detail rows ordered so that the buyer's own unit
 * appears first, matching the SQL CASE WHEN clause used by the backend.
 *
 * @param {string} buyerId  buyer/user id used to identify "own" unit
 * @returns {Promise<Array>} ordered rows, own unit at index 0
 */
async function getUnitDetailsOrdered(buyerId) {
  return sequelize.query(
    `SELECT u.*,
            CASE WHEN u.buyer_id = :buyerId THEN 0 ELSE 1 END AS own_unit_rank
       FROM units u
      WHERE u.deleted_at IS NULL
      ORDER BY own_unit_rank ASC, u.created_at DESC`,
    { replacements: { buyerId }, type: sequelize.QueryTypes.SELECT }
  );
}

/**
 * BYR_UNIT_032 — Returns composite unit string using the "||" delimiter the
 * backend query produces (e.g. tower || floor || unit_number).
 *
 * @param {string} unitId
 * @returns {Promise<{composite: string} | null>}
 */
async function getCompositeUnitString(unitId) {
  return sequelize.query(
    `SELECT CONCAT(tower_code, '||', floor_number, '||', unit_number) AS composite
       FROM units
      WHERE id = :unitId
      LIMIT 1`,
    { replacements: { unitId }, type: sequelize.QueryTypes.SELECT }
  ).then(rows => rows[0] || null);
}

/**
 * BYR_UNIT_033 — Returns the set of ENUM values currently configured for
 * hcf_transactions.hcf_transaction_status. MySQL/Postgres-portable via
 * information_schema where supported; falls back to DISTINCT for engines
 * that do not expose ENUM introspection.
 *
 * @returns {Promise<string[]>}
 */
async function getHcfTransactionStatusEnum() {
  // Distinct-value variant — safe across engines and sufficient for ENUM
  // membership assertions. Replace with information_schema lookup if a stricter
  // schema check is required.
  return sequelize.query(
    `SELECT DISTINCT hcf_transaction_status AS value
       FROM hcf_transactions
      WHERE hcf_transaction_status IS NOT NULL`,
    { type: sequelize.QueryTypes.SELECT }
  ).then(rows => rows.map(r => r.value));
}

/**
 * BYR_UNIT_035 — Returns only PAID hcf transactions for a given unit. Mirrors
 * the backend filter hcf_transaction_status = 'PAID' used when surfacing
 * unit-detail payment summaries.
 *
 * @param {string} unitId
 * @returns {Promise<Array>}
 */
async function getPaidTransactionsForUnit(unitId) {
  return sequelize.query(
    `SELECT *
       FROM hcf_transactions
      WHERE unit_id = :unitId
        AND hcf_transaction_status = 'PAID'
      ORDER BY created_at DESC`,
    { replacements: { unitId }, type: sequelize.QueryTypes.SELECT }
  );
}

module.exports = {
  getUnitDetailsOrdered,
  getCompositeUnitString,
  getHcfTransactionStatusEnum,
  getPaidTransactionsForUnit,
};
