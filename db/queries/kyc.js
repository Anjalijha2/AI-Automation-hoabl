'use strict';

const { sequelize } = require('../connection');

async function getApplicantsByRegistrationUnit(registrationUnitId) {
  return sequelize.query(
    'SELECT * FROM applicants WHERE registration_unit_id = :id AND deleted_at IS NULL ORDER BY id',
    { replacements: { id: registrationUnitId }, type: sequelize.QueryTypes.SELECT }
  );
}

async function getApplicantsByRegistration(registrationId) {
  return sequelize.query(
    'SELECT * FROM applicants WHERE registration_id = :id AND deleted_at IS NULL ORDER BY id',
    { replacements: { id: registrationId }, type: sequelize.QueryTypes.SELECT }
  );
}

async function getApplicantByPan(panCard) {
  return sequelize.query(
    'SELECT * FROM applicants WHERE pan_card = :panCard AND deleted_at IS NULL LIMIT 1',
    { replacements: { panCard }, type: sequelize.QueryTypes.SELECT }
  ).then(rows => rows[0] || null);
}

async function getApplicantByAadhaar(aadhaarCard) {
  return sequelize.query(
    'SELECT * FROM applicants WHERE aadhaar_card = :aadhaarCard AND deleted_at IS NULL LIMIT 1',
    { replacements: { aadhaarCard }, type: sequelize.QueryTypes.SELECT }
  ).then(rows => rows[0] || null);
}

async function getKycStatusForRegistrationUnit(registrationUnitId) {
  return sequelize.query(
    `SELECT id, registration_id, registration_number, status, is_kyc_submitted,
            self_kyc_submitted, self_kyc_final_submitted, is_kyc_pdf_submitted,
            e_verification_completed, e_verification_completed_at
     FROM registration_units WHERE id = :id LIMIT 1`,
    { replacements: { id: registrationUnitId }, type: sequelize.QueryTypes.SELECT }
  ).then(rows => rows[0] || null);
}

module.exports = {
  getApplicantsByRegistrationUnit,
  getApplicantsByRegistration,
  getApplicantByPan,
  getApplicantByAadhaar,
  getKycStatusForRegistrationUnit,
};
