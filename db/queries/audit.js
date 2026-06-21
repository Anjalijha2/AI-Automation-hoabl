'use strict';

// db/queries/audit.js
// Read-only queries against the server-side audit trail (`audit_logs`).
// Every admin mutation (assign unit, unit swap, cancel, parking, allocation
// txn update) writes one or more audit_logs rows capturing actor, event,
// entity, and before/after JSON snapshots. Used by Customers DB-audit specs.

const { sequelize } = require('../connection');

// Recent audit rows for a given action (e.g. 'ADMIN_UNIT_SWAP').
async function getRecentByAction(action, limit = 20) {
  return sequelize.query(
    'SELECT id, actor_type, actor_id, event, action, entity_type, entity_id, ' +
    'entity_snapshot_before, entity_snapshot_after, ip_address, user_agent, created_at ' +
    'FROM audit_logs WHERE action = :action ORDER BY id DESC LIMIT :limit',
    { replacements: { action, limit }, type: sequelize.QueryTypes.SELECT }
  );
}

// Count audit rows for an action.
async function countByAction(action) {
  const rows = await sequelize.query(
    'SELECT COUNT(*) AS n FROM audit_logs WHERE action = :action',
    { replacements: { action }, type: sequelize.QueryTypes.SELECT }
  );
  return Number(rows[0]?.n || 0);
}

// All audit rows for a single unit-swap event (a swap writes a RegistrationUnit
// row + two Unit rows at the same instant). We fetch the recent swap rows and
// group them in JS on created_at — avoids datetime/timezone round-trip issues
// from passing a JS Date back into a SQL equality predicate.
async function getLatestUnitSwapBundle() {
  const recent = await sequelize.query(
    "SELECT id, actor_type, actor_id, event, action, entity_type, entity_id, " +
    "entity_snapshot_before, entity_snapshot_after, created_at " +
    "FROM audit_logs WHERE action = 'ADMIN_UNIT_SWAP' ORDER BY id DESC LIMIT 30",
    { type: sequelize.QueryTypes.SELECT }
  );
  if (!recent.length) return [];
  // Group by created_at; the newest group is the latest swap bundle.
  const key = (d) => new Date(d.created_at).getTime();
  const newestTs = Math.max(...recent.map(key));
  return recent.filter(r => key(r) === newestTs).sort((a, b) => a.id - b.id);
}

module.exports = {
  getRecentByAction,
  countByAction,
  getLatestUnitSwapBundle,
};
