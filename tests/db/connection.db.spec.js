'use strict';

// tests/db/connection.db.spec.js
// DB smoke test — verifies MySQL connectivity and that key query modules work.

const { test, expect } = require('@playwright/test');
const { sequelize, ping } = require('../../db/connection');
const userQ  = require('../../db/queries/user');
const invQ   = require('../../db/queries/inventory');
const allocQ = require('../../db/queries/allocation');
const jbpQ   = require('../../db/queries/jbp');

test.describe('TC-DB-CONN — MySQL UAT read-only connection', () => {

  test.afterAll(async () => { await sequelize.close(); });

  test('TC-DB-CONN-001 — ping succeeds against portal_node_uat', async () => {
    const info = await ping();
    expect(info.db).toBe('portal_node_uat');
    expect(info.dialect).toBe('mysql');
  });

  test('TC-DB-CONN-002 — users table has SM role records', async () => {
    const sms = await userQ.getUsersByRole(5);
    expect(Array.isArray(sms)).toBe(true);
    expect(sms.length).toBeGreaterThan(0);
  });

  test('TC-DB-CONN-003 — inventory: towers + typologies populated', async () => {
    const towers     = await invQ.getTowers();
    const typologies = await invQ.getTypologies();
    expect(towers.length).toBeGreaterThan(0);
    expect(typologies.length).toBeGreaterThan(0);
  });

  test('TC-DB-CONN-004 — allocation campaigns table queryable', async () => {
    const camps = await allocQ.getCampaigns(5);
    expect(Array.isArray(camps)).toBe(true);
  });

  test('TC-DB-CONN-005 — JBP cycles table queryable', async () => {
    const cycles = await jbpQ.getCycles(5);
    expect(Array.isArray(cycles)).toBe(true);
  });
});
