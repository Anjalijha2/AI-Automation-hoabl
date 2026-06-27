'use strict';

const { sequelize } = require('../connection');

async function getUnitById(id) {
  return sequelize.query(
    'SELECT * FROM units WHERE id = :id LIMIT 1',
    { replacements: { id }, type: sequelize.QueryTypes.SELECT }
  ).then(rows => rows[0] || null);
}

async function getUnitsByTower(towerId) {
  return sequelize.query(
    'SELECT * FROM units WHERE tower_id = :towerId AND deleted_at IS NULL ORDER BY floor_number, unit_no',
    { replacements: { towerId }, type: sequelize.QueryTypes.SELECT }
  );
}

async function getUnitsByStatus(status) {
  return sequelize.query(
    'SELECT * FROM units WHERE status = :status AND deleted_at IS NULL',
    { replacements: { status }, type: sequelize.QueryTypes.SELECT }
  );
}

async function getTowers() {
  return sequelize.query(
    'SELECT * FROM towers WHERE deleted_at IS NULL ORDER BY id',
    { type: sequelize.QueryTypes.SELECT }
  );
}

async function getTypologies() {
  return sequelize.query(
    'SELECT * FROM typologies WHERE is_active = 1 ORDER BY id',
    { type: sequelize.QueryTypes.SELECT }
  );
}

async function getUnitByUnitId(unitId) {
  return sequelize.query(
    'SELECT id, unit_id, unit_no, status, tower_name, typology_name FROM units WHERE unit_id = :unitId AND deleted_at IS NULL LIMIT 1',
    { replacements: { unitId }, type: sequelize.QueryTypes.SELECT }
  ).then((r) => r[0] || null);
}

async function getTowerByName(name) {
  return sequelize.query(
    'SELECT id, tower_name, tower_code, is_active FROM towers WHERE tower_name = :name AND deleted_at IS NULL LIMIT 1',
    { replacements: { name }, type: sequelize.QueryTypes.SELECT }
  ).then((r) => r[0] || null);
}

module.exports = { getUnitById, getUnitsByTower, getUnitsByStatus, getTowers, getTypologies, getTowerByName, getUnitByUnitId };
