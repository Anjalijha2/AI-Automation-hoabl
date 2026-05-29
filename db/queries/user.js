'use strict';

const { sequelize } = require('../connection');

async function getUserByMobile(mobile) {
  return sequelize.query(
    'SELECT * FROM users WHERE phone = :mobile AND deleted_at IS NULL LIMIT 1',
    { replacements: { mobile }, type: sequelize.QueryTypes.SELECT }
  ).then(rows => rows[0] || null);
}

async function getUserById(id) {
  return sequelize.query(
    'SELECT * FROM users WHERE id = :id LIMIT 1',
    { replacements: { id }, type: sequelize.QueryTypes.SELECT }
  ).then(rows => rows[0] || null);
}

async function getUsersByRole(roleId) {
  return sequelize.query(
    'SELECT * FROM users WHERE role_id = :roleId AND deleted_at IS NULL',
    { replacements: { roleId }, type: sequelize.QueryTypes.SELECT }
  );
}

module.exports = { getUserByMobile, getUserById, getUsersByRole };
