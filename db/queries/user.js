'use strict';

const { sequelize } = require('../connection');

async function getUserByMobile(mobile) {
  const [rows] = await sequelize.query(
    'SELECT * FROM users WHERE mobile = :mobile LIMIT 1',
    { replacements: { mobile }, type: sequelize.QueryTypes.SELECT }
  );
  return rows || null;
}

async function getUserById(id) {
  const [rows] = await sequelize.query(
    'SELECT * FROM users WHERE id = :id LIMIT 1',
    { replacements: { id }, type: sequelize.QueryTypes.SELECT }
  );
  return rows || null;
}

module.exports = { getUserByMobile, getUserById };
