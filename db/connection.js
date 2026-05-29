'use strict';

// MySQL connection to XR Portal UAT (read-only).
// Strapi DB (portal_strapi_uat) is excluded per project constraints — never query it.

require('dotenv').config();
const { Sequelize } = require('sequelize');

const DB_HOST     = process.env.DB_HOST     || '20.244.46.36';
const DB_PORT     = parseInt(process.env.DB_PORT || '3306', 10);
const DB_NAME     = process.env.DB_NAME     || 'portal_node_uat';
const DB_USER     = process.env.DB_USER     || 'readonly_uat_user';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_DIALECT  = process.env.DB_DIALECT  || 'mysql';

if (!DB_PASSWORD) {
  console.warn('[db] DB_PASSWORD not set — set it in .env (see .env.example).');
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: DB_DIALECT,
  logging: false,
  pool: { max: 5, min: 0, acquire: 30_000, idle: 10_000 },
  dialectOptions: { connectTimeout: 30_000 },
});

async function ping() {
  await sequelize.authenticate();
  return { host: DB_HOST, port: DB_PORT, db: DB_NAME, dialect: DB_DIALECT };
}

module.exports = { sequelize, ping };
