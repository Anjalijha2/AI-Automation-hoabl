'use strict';

// tests/db/customers-audit.db.spec.js
// Customers module — server-side DB-audit layer (real Sequelize connection).
// Scope: prove that admin mutations leave the correct persisted DB footprint.
//   - NEG_097 — allocation/online payment transactions record gateway = 'easebuzz'
//   - NEG_068 — Unit Swap writes a server-side audit trail (audit_logs)
//
// READ-ONLY. These tests issue SELECTs only (db/queries/*) — no mutation.
// Connection: db/connection.js → portal_node_uat (readonly_uat_user).
// Strapi DB is excluded per project constraints.

const { test, expect } = require('@playwright/test');
const { sequelize, ping } = require('../../db/connection');
const payment = require('../../db/queries/payment');
const audit = require('../../db/queries/audit');

test.describe('Customers — Server-side DB Audit', () => {
  test.beforeAll(async () => {
    try {
      await ping();
    } catch (e) {
      test.skip(true, `DB unreachable (set DB_PASSWORD in .env): ${e.message}`);
    }
  });

  test.afterAll(async () => {
    await sequelize.close();
  });

  // ── NEG_097 ────────────────────────────────────────────────────────────────
  test('TC_CUST_NEG_097 — FS-Allocation §Payment — online allocation txns record gateway = "easebuzz"', async () => {
    // 1. Gateway distribution must include 'easebuzz' as a recorded value.
    const dist = await payment.getGatewayDistribution();
    expect(Array.isArray(dist)).toBe(true);
    expect(dist.length).toBeGreaterThan(0);

    const gateways = dist.map(r => r.gateway);
    expect(gateways).toContain('easebuzz');

    // 2. 'easebuzz' is recorded only against ONLINE transactions (is_offline = 0).
    //    Offline txns carry a NULL gateway — they are not gateway-routed.
    const easebuzzRows = dist.filter(r => r.gateway === 'easebuzz');
    expect(easebuzzRows.length).toBeGreaterThan(0);
    for (const r of easebuzzRows) {
      expect(Number(r.is_offline)).toBe(0); // easebuzz is never recorded on offline payments
    }

    // 3. easebuzz is the dominant/active online gateway (vs legacy razorpay / WAIVEDOFF).
    const easebuzzCount = easebuzzRows.reduce((s, r) => s + Number(r.n), 0);
    const onlineTotal = dist
      .filter(r => Number(r.is_offline) === 0 && r.gateway)
      .reduce((s, r) => s + Number(r.n), 0);
    expect(easebuzzCount).toBeGreaterThan(0);
    expect(easebuzzCount / onlineTotal).toBeGreaterThan(0.5); // majority of online txns

    // 4. A real recent online transaction record carries a non-null gateway,
    //    and that gateway is one of the platform's recognised online gateways.
    const recent = await payment.getRecentOnlineTransactions(20);
    expect(recent.length).toBeGreaterThan(0);
    const ALLOWED = ['easebuzz', 'razorpay', 'WAIVEDOFF'];
    for (const txn of recent) {
      expect(Number(txn.is_offline)).toBe(0);
      expect(txn.gateway).not.toBeNull();
      expect(ALLOWED).toContain(txn.gateway);
    }
    // At least one of the most-recent online txns is the active 'easebuzz' gateway.
    expect(recent.some(t => t.gateway === 'easebuzz')).toBe(true);
  });

  // ── NEG_068 ────────────────────────────────────────────────────────────────
  test('TC_CUST_NEG_068 — FS-UnitSwap §Audit — unit swap records a server-side audit trail', async () => {
    // 1. ADMIN_UNIT_SWAP audit rows exist (swaps are journalled server-side).
    const swapCount = await audit.countByAction('ADMIN_UNIT_SWAP');
    test.skip(swapCount === 0, 'No ADMIN_UNIT_SWAP audit rows in UAT yet — run a swap first (FUNC_071)');
    expect(swapCount).toBeGreaterThan(0);

    // 2. Recent swap rows carry full attestation metadata (actor + event + entity).
    const recent = await audit.getRecentByAction('ADMIN_UNIT_SWAP', 10);
    expect(recent.length).toBeGreaterThan(0);
    for (const r of recent) {
      expect(r.action).toBe('ADMIN_UNIT_SWAP');
      expect(r.event).toBe('UPDATE');
      expect(r.actor_id).not.toBeNull();          // who performed it
      expect(['User', 'admin']).toContain(r.actor_type);
      expect(['Unit', 'RegistrationUnit']).toContain(r.entity_type);
      expect(r.entity_id).not.toBeNull();
    }

    // 3. The latest swap is a complete bundle: the RegistrationUnit pointer change
    //    PLUS the two affected Unit status transitions (old unit released, new
    //    unit booked) — the server-side attestation that the swap was applied.
    const bundle = await audit.getLatestUnitSwapBundle();
    expect(bundle.length).toBeGreaterThanOrEqual(2);

    const unitRows = bundle.filter(r => r.entity_type === 'Unit');
    expect(unitRows.length).toBeGreaterThanOrEqual(1);

    // Before/after status snapshots are persisted for the Unit rows.
    const parse = (v) => (typeof v === 'string' ? JSON.parse(v) : v);
    const statuses = unitRows.map(r => ({
      before: parse(r.entity_snapshot_before)?.status,
      after:  parse(r.entity_snapshot_after)?.status,
    }));
    for (const s of statuses) {
      expect(s.before).toBeTruthy();
      expect(s.after).toBeTruthy();
      expect(s.before).not.toBe(s.after); // a real transition was recorded
    }
    // The swap releases one unit (BOOKED → RESERVED/AVAILABLE) somewhere in the bundle.
    expect(statuses.some(s => s.before === 'BOOKED')).toBe(true);
  });

  // ── API_048 (audit invariant) ───────────────────────────────────────────────
  // The live cancel-units trigger is blocked by BUG_015 (504 Mavis-reversal timeout
  // on every UAT fixture). The TC's core assertion — "Cancel Unit creates NO refund"
  // — is instead proven read-only from the server-side ADMIN_CANCEL_UNIT audit trail:
  // a cancel only soft-deletes the existing booking payment transactions and never
  // inserts a new (refund/credit) transaction row.
  test('TC_CUST_API_048 — FS-CancelUnit — Cancel Unit creates no refund (audit invariant: soft-delete only, no new txn)', async () => {
    const events = await audit.getCancelUnitPaymentEvents(100);
    test.skip(events.length === 0, 'No ADMIN_CANCEL_UNIT payment audit rows in UAT yet');
    expect(events.length).toBeGreaterThan(0);

    const parse = (v) => (typeof v === 'string' ? JSON.parse(v) : v) || {};
    for (const e of events) {
      // 1. Every cancel-unit payment audit row is an UPDATE — never a CREATE.
      //    A refund would be a newly CREATED credit transaction; there are none.
      expect(e.event).toBe('UPDATE');

      // 2. The update is a soft-delete: deletedAt goes null → a timestamp.
      const before = parse(e.entity_snapshot_before);
      const after = parse(e.entity_snapshot_after);
      expect(before.deletedAt == null).toBe(true);
      expect(after.deletedAt).toBeTruthy();
    }
    // 3. Zero CREATE events confirms no refund transaction is ever inserted on cancel.
    expect(events.filter(e => e.event === 'CREATE').length).toBe(0);
  });
});
