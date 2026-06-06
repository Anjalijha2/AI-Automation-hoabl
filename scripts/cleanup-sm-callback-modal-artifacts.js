// Remove redundant v1 row-modal duplicates and intermediate captures we no longer need.
// Keep only the meaningful canonical screenshots.

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'visual-memory', 'sm', 'callback-requests');

const toDelete = [
  // 16 redundant row-modal duplicates from v1 (all show the same "Callback Request Details" drawer)
  'callback-row0-action0-modal.png',
  'callback-row0-action1-modal.png',
  'callback-row1-action0-modal.png',
  'callback-row1-action1-modal.png',
  'callback-row2-action0-modal.png',
  'callback-row2-action1-modal.png',
  'callback-row3-action0-modal.png',
  'callback-row3-action1-modal.png',
  'callback-row4-action0-modal.png',
  'callback-row4-action1-modal.png',
  'callback-row5-action0-modal.png',
  'callback-row5-action1-modal.png',
  'callback-row6-action0-modal.png',
  'callback-row6-action1-modal.png',
  'callback-row7-action0-modal.png',
  'callback-row7-action1-modal.png',
  // Intermediate eye-action captures that duplicate the details-drawer-pending/meetingdone canonical files
  'callback-pending-action-0-eye.png',
  'callback-md-action-0-eye.png',
  // schedule-modal alias was misleading — VC Outcome modal is not a schedule modal
  'callback-schedule-modal.png',
  // duplicate of callback-vc-outcome-dropdown
  'callback-vc-outcome-codes.png',
];

let deleted = 0;
for (const f of toDelete) {
  const p = path.join(DIR, f);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log('deleted', f);
    deleted++;
  }
}
console.log(`\nDeleted ${deleted} files. Remaining:`);
fs.readdirSync(DIR).filter(f => f.endsWith('.png')).sort().forEach(f => console.log('  ', f));
