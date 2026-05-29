'use strict';

const { sequelize } = require('../connection');

async function getHomeLoanByRegistration(registrationId) {
  return sequelize.query(
    'SELECT * FROM registration_home_loans WHERE registration_id = :id AND deleted_at IS NULL LIMIT 1',
    { replacements: { id: registrationId }, type: sequelize.QueryTypes.SELECT }
  ).then(rows => rows[0] || null);
}

async function getHomeLoansByStatus(status) {
  return sequelize.query(
    'SELECT * FROM registration_home_loans WHERE loan_approval_status = :status AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 100',
    { replacements: { status }, type: sequelize.QueryTypes.SELECT }
  );
}

async function getHomeLoansByStep(step) {
  return sequelize.query(
    'SELECT * FROM registration_home_loans WHERE step = :step AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 100',
    { replacements: { step }, type: sequelize.QueryTypes.SELECT }
  );
}

module.exports = { getHomeLoanByRegistration, getHomeLoansByStatus, getHomeLoansByStep };
