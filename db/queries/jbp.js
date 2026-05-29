'use strict';

const { sequelize } = require('../connection');

async function getActiveCycle() {
  return sequelize.query(
    `SELECT * FROM jbp_cycles WHERE status = 'OPEN' AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1`,
    { type: sequelize.QueryTypes.SELECT }
  ).then(rows => rows[0] || null);
}

async function getCycles(limit = 20) {
  return sequelize.query(
    'SELECT * FROM jbp_cycles WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT :limit',
    { replacements: { limit }, type: sequelize.QueryTypes.SELECT }
  );
}

async function getSubmissionByCp(userId, cycleId) {
  return sequelize.query(
    `SELECT * FROM jbp_submissions WHERE user_id = :userId AND jbp_cycle_id = :cycleId AND status = 'ACTIVE' AND deleted_at IS NULL LIMIT 1`,
    { replacements: { userId, cycleId }, type: sequelize.QueryTypes.SELECT }
  ).then(rows => rows[0] || null);
}

async function getEditRequests(submissionId) {
  return sequelize.query(
    'SELECT * FROM jbp_edit_requests WHERE jbp_submission_id = :submissionId ORDER BY created_at DESC',
    { replacements: { submissionId }, type: sequelize.QueryTypes.SELECT }
  );
}

module.exports = { getActiveCycle, getCycles, getSubmissionByCp, getEditRequests };
