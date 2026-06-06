'use strict';

// db/queries/callback-requests.js
// Raw Sequelize queries supporting SM Portal Callback Requests DB / audit-trail tests.
// Backs tests in tests/api/callback-requests.api.spec.js (SM_CB_072, SM_CB_134, SM_CB_FSD_138, SM_CB_FSD_139).
//
// Distinct from db/queries/callback.js — this file scopes to assignment-audit
// and schema-introspection queries used by the v2/legacy retained TCs. Existing
// callback.js queries (getCallbackById, getCallbacksByManager, ...) remain the
// primary entity-level helpers.

const { sequelize } = require('../connection');

/**
 * SM_CB_072 — Returns the audit-trail rows recorded for an SM assignment
 * action on a given callback request, newest first.
 *
 * @param {string|number} callbackRequestId
 * @returns {Promise<Array>}
 */
async function getSmAssignmentAuditTrail(callbackRequestId) {
  return sequelize.query(
    `SELECT *
       FROM callback_request_assignments
      WHERE callback_request_id = :id
      ORDER BY created_at DESC`,
    { replacements: { id: callbackRequestId }, type: sequelize.QueryTypes.SELECT }
  );
}

/**
 * SM_CB_134 — Returns a single assignment record, used for schema-shape
 * assertions (columns present, FK integrity, timestamps populated).
 *
 * @param {string|number} assignmentId
 * @returns {Promise<object|null>}
 */
async function getSmAssignmentRecord(assignmentId) {
  return sequelize.query(
    `SELECT *
       FROM callback_request_assignments
      WHERE id = :id
      LIMIT 1`,
    { replacements: { id: assignmentId }, type: sequelize.QueryTypes.SELECT }
  ).then(rows => rows[0] || null);
}

/**
 * SM_CB_FSD_138 — Returns the distinct status ENUM values currently in use on
 * callback_requests. Used to assert the expected status set per FSD
 * (PENDING, CONFIRMED, MEETING_DONE, …).
 *
 * @returns {Promise<string[]>}
 */
async function getStatusEnumValues() {
  return sequelize.query(
    `SELECT DISTINCT status AS value
       FROM callback_requests
      WHERE status IS NOT NULL`,
    { type: sequelize.QueryTypes.SELECT }
  ).then(rows => rows.map(r => r.value));
}

/**
 * SM_CB_FSD_139 — Returns the candidate SM pool used by the least-loaded
 * assignment algorithm. SMs with is_available = false must be excluded
 * (per FSD-CORRECTION 2026-05-25, callback-request-sm.service.js:338-349).
 *
 * @returns {Promise<Array>} rows with user_id and current_load
 */
async function getAvailableSmPool() {
  return sequelize.query(
    `SELECT u.id AS user_id,
            u.is_available,
            COUNT(cra.id) AS current_load
       FROM users u
       LEFT JOIN callback_request_assignments cra
              ON cra.assigned_to_user_id = u.id
             AND cra.released_at IS NULL
      WHERE u.role = 'SALES_MANAGER'
        AND u.is_available = true
        AND u.deleted_at IS NULL
      GROUP BY u.id, u.is_available
      ORDER BY current_load ASC`,
    { type: sequelize.QueryTypes.SELECT }
  );
}

/**
 * SM_CB_FSD_140 — Returns the vc_offers row(s) linked to a callback request,
 * proving the outcome→offer chain on the DB side.
 *
 * @param {string|number} callbackRequestId
 * @returns {Promise<Array>}
 */
async function getVcOffersForCallback(callbackRequestId) {
  return sequelize.query(
    `SELECT *
       FROM vc_offers
      WHERE callback_request_id = :id
      ORDER BY created_at DESC`,
    { replacements: { id: callbackRequestId }, type: sequelize.QueryTypes.SELECT }
  );
}

module.exports = {
  getSmAssignmentAuditTrail,
  getSmAssignmentRecord,
  getStatusEnumValues,
  getAvailableSmPool,
  getVcOffersForCallback,
};
