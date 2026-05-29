'use strict';

const { sequelize } = require('../connection');

async function getCallbackById(id) {
  return sequelize.query(
    'SELECT * FROM callback_requests WHERE id = :id LIMIT 1',
    { replacements: { id }, type: sequelize.QueryTypes.SELECT }
  ).then(rows => rows[0] || null);
}

async function getCallbacksByManager(managerId) {
  return sequelize.query(
    'SELECT * FROM callback_requests WHERE manager_id = :managerId AND deleted_at IS NULL ORDER BY created_at DESC',
    { replacements: { managerId }, type: sequelize.QueryTypes.SELECT }
  );
}

async function getCallbacksByStatus(status) {
  return sequelize.query(
    'SELECT * FROM callback_requests WHERE status = :status AND deleted_at IS NULL',
    { replacements: { status }, type: sequelize.QueryTypes.SELECT }
  );
}

async function getCallbacksByUser(userId) {
  return sequelize.query(
    'SELECT * FROM callback_requests WHERE user_id = :userId AND deleted_at IS NULL ORDER BY created_at DESC',
    { replacements: { userId }, type: sequelize.QueryTypes.SELECT }
  );
}

async function getCallbackFeedback(callbackRequestId) {
  return sequelize.query(
    'SELECT * FROM callback_request_feedbacks WHERE callback_request_id = :id',
    { replacements: { id: callbackRequestId }, type: sequelize.QueryTypes.SELECT }
  );
}

module.exports = { getCallbackById, getCallbacksByManager, getCallbacksByStatus, getCallbacksByUser, getCallbackFeedback };
