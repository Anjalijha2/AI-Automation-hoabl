'use strict';

const { sequelize } = require('../connection');

async function getInventoryById(id) {
  const [rows] = await sequelize.query(
    'SELECT * FROM inventory WHERE id = :id LIMIT 1',
    { replacements: { id }, type: sequelize.QueryTypes.SELECT }
  );
  return rows || null;
}

async function getInventoryByProject(projectId) {
  return sequelize.query(
    'SELECT * FROM inventory WHERE project_id = :projectId ORDER BY unit_number ASC',
    { replacements: { projectId }, type: sequelize.QueryTypes.SELECT }
  );
}

module.exports = { getInventoryById, getInventoryByProject };
