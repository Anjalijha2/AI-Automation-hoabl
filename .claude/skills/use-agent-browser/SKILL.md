---
name: use-agent-browser
description: "ALWAYS use agent-browser (the `agent-browser` CLI / MCP) for live browser execution against the XR Portal UAT environment — opening pages, snapshotting, clicking, filling, uploading, screenshotting, and step-by-step verification of admin/SM/CP/buyer flows. Use instead of writing one-off headed Playwright scripts or popping headed browser windows. Auth is reused from the saved Playwright session files via `--state`. Use when: running or verifying a UAT flow, driving a destructive test step-by-step, capturing a screenshot, exploring a page, or any 'open/click/fill/check the portal' task."
user-invocable: true
allowed-tools: Bash(agent-browser:*), Bash(npx agent-browser:*)
---

# Use agent-browser for live browser execution

`agent-browser` (v0.28+) is the standard tool for driving the live XR Portal UAT
environment. It is a fast, CDP-based browser-automation CLI built for AI agents:
accessibility-tree snapshots with compact `@eN` refs let you act on a page in a
few hundred tokens. **Prefer it over ad-hoc headed Playwright scripts** for any
interactive/exploratory/step-by-step browser work.

The committed Playwright spec suite (`tests/**`) remains the automated regression
layer and still produces the xlsx/step-reporter/screenshot deliverables. Use
agent-browser for **interactive execution, verification, capture, and the
careful step-by-step destructive runs** — and record results into the same
artifacts (xlsx via `scripts/xlsx-write-results.js`, screenshots into
`manual-qa-repository/07-execution/screenshots/<Module>/`).

## Auth — reuse the saved Playwright sessions

agent-browser's `--state <path>` loads a Playwright-format storageState
(cookies + localStorage). Reuse the per-portal session files directly:

| Portal | `--state` file |
|---|---|
| Admin | `automation-repository/fixtures/.auth/admin.json` |
| Sales Manager | `automation-repository/fixtures/.auth/sales-manager.json` |
| Channel Partner | `automation-repository/fixtures/.auth/channel-partner.json` |
| Buyer | `automation-repository/fixtures/.auth/buyer.json` |

If a flow redirects to login, the session expired — run `npm run auth:setup`
(or the per-portal auth project) to refresh, then retry. UAT mobile `8888888888`;
admin/SM OTP `258369`, CP/buyer OTP `147258`.

## The core loop

```bash
agent-browser --state automation-repository/fixtures/.auth/admin.json open "https://uat-web.xrportal.in/admin/customers"
agent-browser snapshot -i -c          # interactive elements only, compact → @eN refs
agent-browser fill @e19 "8888888888"  # act on refs
agent-browser press Enter
agent-browser wait --load networkidle
agent-browser snapshot -i -c          # RE-SNAPSHOT after any page change — refs go stale
agent-browser screenshot path.png     # capture evidence
agent-browser close                   # when done (browser persists across commands via daemon)
```

Refs (`@e1`…) are reassigned on every snapshot and go stale the moment the page
changes (navigation, submit, modal open, re-render). **Always re-snapshot before
the next ref interaction.** When refs are awkward, use semantic locators:
`agent-browser find role button click --name "Submit"`,
`find text "View Milestones" click`, `find label "Amount" fill "1000"`.

## Pipeline Discipline still applies (non-negotiable)

- **Rule #7 — no live mutation without user OK.** Open modals / drawers / snapshots
  are safe. Never Submit / Delete / Save / Approve / Confirm on a fixture without
  explicit authorisation. Destructive runs use the approved fixture pool
  (`automation-repository/fixtures/destructive-pool.json`); retire a consumed row
  with `node scripts/consume-fixture.js <category> <regId> "<reason>"`.
- **Rule #5 — ask for test data, never invent.** Mobiles, OTPs, records come from
  the user / `constants/testData.js` / the destructive pool.
- **Rule #6 — silent UX is not a bug.** Verify the backend side-effect before
  flagging a missing toast.
- After each verified flow: screenshot → archive → record Pass/Skip/Fail to the
  module's `- Exec` + `- Master` sheets via `scripts/xlsx-write-results.js`.

## Reference

Load the bundled command reference when needed:
`agent-browser skills get core --full`. Specialized skills exist for Electron,
Slack, exploratory testing, and cloud browser providers
(`agent-browser skills list`).
