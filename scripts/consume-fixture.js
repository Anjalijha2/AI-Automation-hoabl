// scripts/consume-fixture.js
// Retire a fixture row after a destructive test has consumed/mutated it, so the
// next destructive run picks a fresh row. Moves the reg-ID out of
// available.<category> and appends it to consumed[] with a reason + timestamp.
//
// Usage:
//   node scripts/consume-fixture.js <category> <regId> "<reason>"
//
// Example:
//   node scripts/consume-fixture.js registered GHNG-1000008364-P "DEST-2 Cancel Registration — now Cancelled"
//
// Categories: registered | bookedOffline | bookedOnline | kycCompleted | cancelled | inactive
'use strict';

const fs = require('fs');
const path = require('path');

const [category, regId, ...reasonParts] = process.argv.slice(2);
const reason = reasonParts.join(' ');
if (!category || !regId) {
  console.error('Usage: node scripts/consume-fixture.js <category> <regId> "<reason>"');
  process.exit(1);
}

const POOL_PATH = path.join(__dirname, '..', 'automation-repository', 'fixtures', 'destructive-pool.json');
const pool = JSON.parse(fs.readFileSync(POOL_PATH, 'utf8'));

const list = pool.available[category];
if (!list) {
  console.error(`Unknown category "${category}". Valid: ${Object.keys(pool.available).join(', ')}`);
  process.exit(1);
}

const idx = list.findIndex((r) => r.regId === regId);
if (idx === -1) {
  console.error(`Reg-ID "${regId}" not found in available.${category}. Already consumed?`);
  // Not fatal — record the consumption anyway for audit.
}

const entry = idx !== -1 ? list.splice(idx, 1)[0] : { regId };

// IST timestamp (UTC+5:30) — Date.now() is fine here (this is a CLI script, not a workflow).
const now = new Date();
const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
const ts = ist.toISOString().replace('T', ' ').slice(0, 16) + ' IST';

pool.consumed.push({ ...entry, category, reason: reason || '(no reason given)', consumedAt: ts });
fs.writeFileSync(POOL_PATH, JSON.stringify(pool, null, 2) + '\n', 'utf8');

console.log(`✓ Consumed ${regId} from available.${category}`);
console.log(`  Reason: ${reason || '(none)'} | at ${ts}`);
console.log(`  Remaining in ${category}: ${list.map((r) => r.regId).join(', ') || '(none — re-provision needed)'}`);
