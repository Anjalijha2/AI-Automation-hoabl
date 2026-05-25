// scripts/patch-tc-fields.js
// Adds **Sub Module:**, **Scenario:**, **Test Data:** to existing TC markdown blocks
// when missing. Idempotent — safe to run repeatedly.
//
// Rules:
//   - Sub Module : derive from preceding "## <Section> Tests" header (strip "Tests")
//   - Scenario   : copy from Title (verb phrase)
//   - Test Data  : extract first inline backtick from steps, else "N/A"
//
// Usage:  node scripts/patch-tc-fields.js manual-qa-repository/01-test-cases/admin-portal

const fs = require('fs');
const path = require('path');

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/^TC_.*\.md$/i.test(e.name)) yield p;
  }
}

function deriveSubModule(section) {
  if (!section) return null;
  return section.replace(/Tests?$/i, '').trim() || section.trim();
}

function extractTestData(stepsLines) {
  // Pick a representative inline `code` token (mobile, OTP, ID, payload, etc.)
  const joined = stepsLines.join(' ');
  const matches = joined.match(/`([^`]+)`/g);
  if (!matches || !matches.length) return 'N/A';
  // De-dup, cap at 3 tokens
  const tokens = [...new Set(matches.map(m => m.replace(/`/g, '')))].slice(0, 3);
  return tokens.map(t => `\`${t}\``).join(', ');
}

function patchFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split('\n');
  const out = [];
  let section = '';
  let i = 0;
  let added = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Track section heading
    const secM = line.match(/^##\s+(.+?)\s*$/);
    if (secM) { section = secM[1]; out.push(line); i++; continue; }

    // TC header
    const tcM = line.match(/^###\s+(TC[_-][A-Z0-9_-]+)\s*(.*)$/);
    if (!tcM) { out.push(line); i++; continue; }

    // Collect full TC block until next ### or ## or EOF
    const blockStart = i;
    let j = i + 1;
    while (j < lines.length && !/^###\s+TC[_-]/.test(lines[j]) && !/^##\s+/.test(lines[j])) j++;
    const block = lines.slice(blockStart, j); // includes the ### line

    // Parse fields in the block
    const fields = {};
    const stepsLines = [];
    let inSteps = false;
    let titleIdx = -1;
    let preCondIdx = -1;
    let stepsHeaderIdx = -1;
    let stepsEndIdx = -1;

    for (let k = 1; k < block.length; k++) {
      const bl = block[k];
      const fm = bl.match(/^\*\*([^*]+)\*\*\s*:?\s*(.*)$/);
      if (fm) {
        const key = fm[1].trim().toLowerCase();
        fields[key] = fm[2].trim();
        if (key === 'title') titleIdx = k;
        if (key.startsWith('pre-condition') || key.startsWith('precondition') || key === 'preconditions') preCondIdx = k;
        if (key === 'steps') { inSteps = true; stepsHeaderIdx = k; continue; }
        inSteps = false;
        continue;
      }
      if (inSteps) {
        if (/^\s*\d+\./.test(bl)) { stepsLines.push(bl); stepsEndIdx = k; continue; }
        if (bl.trim() === '') { continue; }
        // non-step, non-blank line ends steps
        inSteps = false;
      }
    }

    const hasSub      = 'sub module' in fields || 'submodule' in fields;
    const hasScenario = 'scenario' in fields;
    const hasTestData = 'test data' in fields || 'testdata' in fields;

    // Build inserts
    const inserts = []; // [{ afterIdx (block-local), text }]
    if (!hasSub && titleIdx >= 0) {
      const sub = deriveSubModule(section) || 'General';
      inserts.push({ after: titleIdx, text: `**Sub Module:** ${sub}  ` });
    }
    if (!hasScenario && titleIdx >= 0) {
      const scen = (fields['title'] || '').replace(/\s+$/, '');
      inserts.push({ after: titleIdx, text: `**Scenario:** ${scen}  ` });
    }
    if (!hasTestData && preCondIdx >= 0) {
      const td = extractTestData(stepsLines);
      inserts.push({ after: preCondIdx, text: `**Test Data:** ${td}  ` });
    }

    // Apply inserts (descending so indexes stay valid)
    if (inserts.length) {
      added += inserts.length;
      inserts.sort((a, b) => b.after - a.after);
      // Order Sub Module then Scenario right after Title (Scenario inserted first so it ends up second)
      // Since both target same idx with same `after`, sort stable: scenario first, then sub-module — to get Sub then Scenario, insert in reverse order.
      // Re-sort to put SubModule above Scenario: insert Scenario first (higher final pos), then SubModule on top
      // Easiest: process in order [Test Data after preCond] then [Scenario after title] then [Sub Module after title]
      const ordered = [];
      const td = inserts.find(x => x.text.startsWith('**Test Data'));
      const sc = inserts.find(x => x.text.startsWith('**Scenario'));
      const sm = inserts.find(x => x.text.startsWith('**Sub Module'));
      if (td) ordered.push(td);
      if (sc) ordered.push(sc);
      if (sm) ordered.push(sm);
      // descending after
      ordered.sort((a, b) => b.after - a.after);
      for (const ins of ordered) {
        block.splice(ins.after + 1, 0, ins.text);
      }
    }

    out.push(...block);
    i = j;
  }

  if (added > 0) {
    fs.writeFileSync(file, out.join('\n'), 'utf8');
  }
  return added;
}

function main() {
  const target = process.argv[2];
  if (!target) { console.error('Usage: node scripts/patch-tc-fields.js <dir>'); process.exit(1); }
  const root = path.resolve(target);
  let totalFiles = 0, totalAdds = 0;
  for (const f of walk(root)) {
    const n = patchFile(f);
    totalFiles++;
    totalAdds += n;
    console.log(`  ${n.toString().padStart(3)} adds  ${path.relative(process.cwd(), f)}`);
  }
  console.log(`\nDone. ${totalFiles} files scanned, ${totalAdds} fields added.`);
}

main();
