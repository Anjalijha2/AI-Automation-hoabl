# Antigravity Setup — Quick Reference

**XR Portal QA Framework — 3-Agent Configuration**

---

## Step 1 — Create 3 Separate Antigravity Sessions

| Session Name | System Prompt File | Role |
|---|---|---|
| `XR — BA Agent` | `ANTIGRAVITY-BA-AGENT.md` → SYSTEM PROMPT section | Orchestrator + Brain |
| `XR — Manual QA` | `ANTIGRAVITY-MANUAL-QA-AGENT.md` → SYSTEM PROMPT section | Discovery + Docs + TCs + Bugs |
| `XR — Automation QA` | `ANTIGRAVITY-AUTOMATION-QA-AGENT.md` → SYSTEM PROMPT section | Scripts + Execution + Healing |

For each session: copy everything under `# SYSTEM PROMPT` and paste it into Antigravity's system prompt field.

---

## Step 2 — Always Start From BA Agent

BA Agent orchestrates everything. You never trigger Manual QA or Automation QA directly during a sprint — BA Agent does that.

**To start a new module sprint:**
Open the `XR — BA Agent` session.
Paste the KICKOFF PROMPT from `ANTIGRAVITY-BA-AGENT.md`.
Replace `<MODULE_NAME>` with your module (e.g., `Channel Partners`).

---

## Step 3 — The Flow Between Sessions

```
YOU (user)
  │
  │  Paste kickoff prompt in BA Agent session
  ▼
BA Agent Session
  │  Reads CLAUDE.md + BRD
  │  Creates sprint plan
  │  Raises clarifications (if any) → you answer
  │
  │  "Manual QA Agent — begin Phase 1 for Channel Partners"
  ▼
Manual QA Agent Session  (you paste the Phase 1 kickoff)
  │  Runs discovery → extracts selectors
  │  "Phase 1 complete"
  │
  ▼
BA Agent Session  (you relay the completion message)
  │  Gate check ✓ → "Manual QA Agent — begin Phase 2"
  ▼
Manual QA Agent Session  (you paste Phase 2 kickoff)
  │  Writes screen docs → raises clarifications if needed
  │  You answer clarifications → relay back to Manual QA
  │  "Phase 2 complete"
  │
  ▼
BA Agent Session  (relay completion)
  │  Gate check ✓ → "Manual QA Agent — begin Phase 3"
  ▼
Manual QA Agent Session  (Phase 3 kickoff)
  │  Designs TCs across all 15 types
  │  "Phase 3 complete — N TCs"
  │
  ▼
BA Agent Session  (relay)
  │  "TCs ready for your review — please approve"
  │
  ▼
YOU review TC file → "Approved"
  │
  ▼
BA Agent Session
  │  "Automation QA Agent — begin Phase 1 for Channel Partners"
  ▼
Automation QA Agent Session  (Phase 1 kickoff)
  │  Generates POM + spec
  │  "Phase 1 complete"
  │
  ▼
BA Agent Session  (relay)
  │  Gate check ✓ → "Automation QA Agent — begin Phase 2"
  ▼
Automation QA Agent Session  (Phase 2 kickoff)
  │  Executes tests
  │  "X pass, Y fail, Z skip"
  │
  ▼
BA Agent Session  (relay)
  │  If failures → "Manual QA Agent — begin Phase 4"
  ▼
Manual QA Agent Session  (Phase 4 kickoff)
  │  Logs bugs with root cause
  │  "N bugs logged"
  │
  ▼
BA Agent Session  (relay)
  │  "Automation QA Agent — begin Phase 3 (Healing)"
  ▼
Automation QA Agent Session  (Phase 3 kickoff)
  │  Produces fix recommendations
  │  "N recommendations ready"
  │
  ▼
BA Agent Session  (relay)
  │  Reviews recommendations → approves specific fixes
  │  "Apply fixes 1, 2 from fix-recommendations.md"
  ▼
Automation QA Agent Session  (Apply fixes kickoff)
  │  Applies approved fixes only
  │  "Fixes applied — ready for re-execution"
  │
  ▼
BA Agent Session
  │  Sprint retrospective
  │  Updates all vault sections
  │  "Sprint complete — summary"
  ▼
YOU receive sprint summary
```

---

## How to Relay Messages Between Sessions

When BA Agent says "Manual QA Agent — begin Phase 1":
1. Open `XR — Manual QA` session
2. Paste the relevant KICKOFF PROMPT section (Phase 1 instruction)
3. Paste any context BA Agent provided (module name, paths, etc.)

When Manual QA says "Phase 1 complete":
1. Open `XR — BA Agent` session
2. Say: "Manual QA Agent reports: Phase 1 complete for Channel Partners. docs/selectors/channel-partners.json is ready."
3. BA Agent will gate-check and issue the next instruction.

---

## Handling Clarifications

When any agent raises a CLARIFICATION:
1. The agent session will STOP and show you the clarification request
2. You get the answer from the product team / BRD owner
3. Go to `XR — BA Agent` session and say: "CLARIFICATION-NNN resolved: [answer]"
4. BA Agent updates the vault and unblocks the agent
5. Go back to the blocked agent session and say: "Clarification resolved. Resume Phase [N]."

---

## Quick Module Kickoff Template

Copy this, fill in the blanks, paste into BA Agent session:

```
BA Agent — new module sprint.

Read CLAUDE.md. Module: <MODULE_NAME>

BRD location: brd/<module>.md
[OR: "No BRD yet — here are the requirements: <paste requirements>"]

Begin the sprint:
1. Analyze requirements with real estate domain expertise
2. Raise clarification requests for any unclear logic
3. Create sprint plan and task tracker
4. Initialize vault sections
5. Trigger Manual QA Agent — Phase 1

Report back: sprint plan summary, any domain red flags, any clarifications needed.
```

---

## Session Reset (Start Fresh on a Module)

If you need to restart a module from scratch in any session:

```
[In the relevant session]
Reset context for <MODULE_NAME>.
Read CLAUDE.md and agents/<agent-file>.md.
Ignore any prior work discussed in this session.
Fresh start — treat <MODULE_NAME> as a new module.
[Then paste the appropriate kickoff prompt]
```

---

## Common Commands Reference

```bash
# BA Agent will tell you when to run these manually if needed:

npm run auth:setup              # Refresh auth session
npm run test:regression         # Full regression run
npm run report                  # Open HTML test report
npm run sprint:status           # Check sprint status
npm run heal:analyze            # Healing analysis
npm run defects:log             # Log defects from results
```
