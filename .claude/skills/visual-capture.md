---
name: visual-capture
description: Navigate to a live portal module using MCP browser tools, capture screenshots, and create/update the visual-memory INDEX.md for that module. Owned by Tech Lead Agent. Called after locator-map-builder completes, and in response to VISUAL_GATE_BLOCK from BA Agent.
---

# Skill: visual-capture

**Called by**: Tech Lead Agent only
**Inputs**: portal name, module name, portal URL (from CLAUDE.md), list of screens to capture
**Outputs**: screenshots in `visual-memory/<portal>/<module>/`, created/updated `visual-memory/<portal>/<module>/INDEX.md`, updated `visual-memory/INDEX.md` root

---

## Trigger Conditions

- Tech Lead Agent completing sync pipeline Step 1 (after locator-map-builder) for any affected module
- New module introduced in a sprint
- BA Agent raises VISUAL_GATE_BLOCK (INDEX.md missing for requested module)
- User explicitly requests visual refresh for a module

---

## Execution Steps

### Step 1 — Determine Screens to Capture

Read the BRD/FRD for the module to identify distinct UI states:
- Default / landing state
- Empty state (no data loaded)
- Loaded state (with data)
- Modal / drawer open state
- Error / validation state
- Any state referenced by existing TC_IDs in the current INDEX.md

### Step 2 — Check Existing INDEX.md

Read `visual-memory/<portal>/<module>/INDEX.md` if it exists.
- If exists: note which screens are already documented, only capture NEW or `NEEDS_REFRESH` screens
- If not exists: capture all screens from Step 1

### Step 3 — Navigate and Capture via MCP Browser

Use chrome-devtools MCP (`mcp__plugin_chrome-devtools-mcp_chrome-devtools__*`) or Playwright MCP (`mcp__plugin_playwright_playwright__browser_*`):

1. Set viewport to 1920×900 (desktop standard)
2. Navigate to portal URL from CLAUDE.md
3. Authenticate if required (use saved session from `automation-repository/fixtures/.auth/<portal>.json`)
4. Navigate to the specific module page
5. Wait for stable state (no spinners, data loaded)
6. For each screen state:
   a. Set up UI state (e.g., click to open modal)
   b. Take screenshot
   c. Save to `visual-memory/<portal>/<module>/<descriptive-name>.png`
   d. Use naming convention below

### Step 4 — Inspect DOM for Structural Notes

After screenshots, inspect DOM to extract:
- Page heading element type and exact text (h1/h2/h3 + text)
- Primary action button selectors (prefer data-testid → aria-label → CSS)
- Key input field selectors
- API field names visible in network requests
- Notable layout structure (sidebars, tables, modals)

Use `mcp__plugin_chrome-devtools-mcp_chrome-devtools__take_snapshot` and `mcp__plugin_chrome-devtools-mcp_chrome-devtools__evaluate_script` to inspect DOM.

### Step 5 — Write INDEX.md

Create or update `visual-memory/<portal>/<module>/INDEX.md` following this exact gold standard format (from `visual-memory/admin/login/INDEX.md`):

```
# Visual Memory — <Portal Display Name> / <Module Display Name>

**Captured:** <YYYY-MM-DD>
**Viewport (desktop):** 1920×900
**Environment:** UAT (<URL>)
**CAPTURE_STATUS:** FULL

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `<filename>.png` | <Description of what screen shows> | <Live inspection / TC_ID reference> |

---

## Key Structural Notes

- <Heading element and text>
- <Primary action button selector>
- <Key input field selectors>
- <API field names if observed>
- <Any notable structural observations>
```

### Step 6 — Update Root INDEX.md

Update `visual-memory/INDEX.md` to add/update this module's row:
- Change status from `STUB` or `MISSING` to `FULL`
- Add the module row if not yet listed

---

## Screenshot Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Initial loaded state | `screenshot-desktop.png` | `screenshot-desktop.png` |
| UI/UX baseline | `screenshot-ui.png` | `screenshot-ui.png` |
| Specific state | `<module>-<state>-<notes>.png` | `allocation-table-loaded-1920.png` |
| TC-specific | `<tc-id-lowercase>.png` | `tc-alloc-e2e-001.png` |
| Error state | `<module>-error-<type>.png` | `allocation-error-empty.png` |

---

## Stub Mode (Bootstrap Only)

When called in stub mode (module has PNGs but no INDEX.md), skip Steps 1-4 and only execute Step 5:
- Document only existing screenshots in the Screens table
- Set `CAPTURE_STATUS: STUB` instead of `FULL`
- Mark structural notes section as `⚠ STRUCTURAL NOTES PENDING`
- Stubs are sufficient to unblock BA Agent but must be upgraded before automation specs are written

---

## Constraints

- Never delete any existing screenshots — only add new ones
- Never overwrite an existing INDEX.md — only append/update rows and notes
- Always capture at 1920×900 unless TC explicitly requires different viewport
- Viewport-specific captures must include viewport in filename
- If live portal is unreachable: create stub with `CAPTURE_STATUS: PORTAL_UNREACHABLE — <date>`
- Always update `visual-memory/INDEX.md` root after writing a module INDEX.md
- CAPTURE_STATUS values: `FULL` | `STUB` | `PORTAL_UNREACHABLE — <date>`
