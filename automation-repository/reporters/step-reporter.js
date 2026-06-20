// automation-repository/reporters/step-reporter.js
// Custom Playwright reporter — prints step-level CLI output.
//
// For each test it shows:
//   ▶ Step N: <name>
//   ✅ PASS  (Xms)    OR    ❌ FAIL  (Xms)
//      Reason:  <first line of error>
//      Expected: <expectedResult annotation>
//
// Only "test" category steps are shown — Playwright internal hooks
// (Before Hooks, fixture: page, etc.) are filtered out.

'use strict';

const SEP  = '━'.repeat(68);
const SEP2 = '─'.repeat(68);

/** Format a duration in ms as a readable string. */
function fmt(ms) {
  if (ms == null) return '';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/** Extract the first meaningful line from an error message. */
function firstLine(msg) {
  if (!msg) return '';
  // Strip ANSI colour codes
  const clean = msg.replace(/\x1b\[[0-9;]*m/g, '');
  return clean.split('\n').find(l => l.trim()) || clean.slice(0, 120);
}

class StepReporter {
  constructor() {
    // Map testId → { stepIndex, annotations, pendingStep }
    this._state = new Map();
  }

  onTestBegin(test) {
    const id = test.id;
    this._state.set(id, { stepIndex: 0, annotations: {}, pendingStep: null });

    // Extract TC_ID from title (first word before " — ")
    const tcId = test.title.split(' — ')[0].trim();
    const title = test.title;

    process.stdout.write(`\n${SEP}\n`);
    process.stdout.write(`TEST:  ${tcId}\n`);
    process.stdout.write(`DESC:  ${title}\n`);
    process.stdout.write(`${SEP}\n`);
  }

  // onStepBegin / onStepEnd are intentionally not implemented.
  // In Playwright 1.58.x, test.step() steps have category === undefined and
  // internal expect() steps also fire here, making live tracking unreliable.
  // We use the onTestEnd fallback (result.steps) instead — it contains exactly
  // the user-defined steps without internal noise.

  onTestEnd(test, result) {
    const state = this._state.get(test.id);
    if (!state) return;

    // Collect annotations written during the test (they land in result.annotations)
    const annotations = {};
    for (const ann of (result.annotations || [])) {
      annotations[ann.type] = ann.description;
    }

    // Fallback: if onStepBegin/onStepEnd never fired (Playwright 1.58 behaviour),
    // extract test.step() entries from result.steps and print them now.
    if (state.stepIndex === 0 && result.steps && result.steps.length > 0) {
      // Playwright-internal assertion step pattern — suppress when passing (it's
      // a sub-step of a test.step() and adds noise). Show only on failure.
      const INTERNAL_ASSERT = /^Expect "|^locator\(|^page\./;
      const SKIP_CATS = ['hook', 'fixture', 'pw:api', 'attach'];
      function printSteps(steps) {
        for (const step of steps) {
          // Skip internal Playwright category steps
          if (step.category && SKIP_CATS.includes(step.category)) {
            if (step.steps && step.steps.length > 0) printSteps(step.steps);
            continue;
          }
          // Skip passing internal-assertion sub-steps (only show on error)
          if (INTERNAL_ASSERT.test(step.title) && !step.error) continue;
          const dur = fmt(step.duration);
          // step.title already contains "Step N: <description>" from test.step() — use as-is
          process.stdout.write(`\n  ▶  ${step.title}\n`);
          if (step.error) {
            const reason = firstLine(step.error.message);
            process.stdout.write(`  ❌ FAIL  (${dur})\n`);
            process.stdout.write(`     Reason:  ${reason}\n`);
            if (annotations.expectedResult) {
              process.stdout.write(`     Expected: ${annotations.expectedResult}\n`);
            }
          } else {
            process.stdout.write(`  ✅ PASS  (${dur})\n`);
          }
          if (step.steps && step.steps.length > 0) printSteps(step.steps);
        }
      }
      printSteps(result.steps);
    }

    const dur = fmt(result.duration);
    let icon, label;
    if (result.status === 'passed')  { icon = '✅'; label = 'PASSED';  }
    else if (result.status === 'failed') { icon = '❌'; label = 'FAILED';  }
    else if (result.status === 'skipped'){ icon = '⏭'; label = 'SKIPPED'; }
    else if (result.status === 'timedOut'){ icon = '⏱'; label = 'TIMED OUT'; }
    else { icon = '?'; label = result.status.toUpperCase(); }

    process.stdout.write(`\n${SEP2}\n`);
    process.stdout.write(`RESULT: ${icon} ${label}  (${dur})\n`);

    if (annotations.testData) {
      process.stdout.write(`Test Data: ${annotations.testData}\n`);
    }
    if (annotations.expectedResult && result.status !== 'passed') {
      process.stdout.write(`Expected:  ${annotations.expectedResult}\n`);
    }

    if (result.status === 'failed' && result.error) {
      const reason = firstLine(result.error.message);
      process.stdout.write(`Error:     ${reason}\n`);
    }

    process.stdout.write(`${SEP}\n\n`);

    this._state.delete(test.id);
  }
}

module.exports = StepReporter;
