# Example Audit Report

This is a sample output from the Context Engineer skill, based on a real requirements management project.

---

# Context Audit Report: myHealthMeter Requirements

## Project Profile

**Type:** Requirements/Documentation (Obsidian vault + JIRA stories + FRDs + prototypes)
**User:** Solo Product Owner using Claude Code for FRD writing, JIRA story generation, and scope tracking.
**Workflow:** Draft FRD -> Review flows -> Freeze FRD -> Generate JIRA stories. Session-based work with vault as single source of truth.
**Repo size:** ~2,500 files (vault docs, JIRA stories, screenshots, prototypes, BMAD framework, old CRM code reference)

## Current State Metrics

| Metric | Value | Health |
|--------|-------|--------|
| CLAUDE.md lines | 197 | BLOATED — 43 lines of stale status data |
| MEMORY.md lines | 118 / 200 | APPROACHING — 40% redundant with CLAUDE.md |
| Memory files | 19 | HIGH — 6 are shadow copies of vault |
| Total always-on context | 22.7 KB | HEAVY — 72% reducible |
| Rules files | 0 | NONE — all conventions always-on |
| Deny rules | 0 | NONE — Claude searches BMAD internals, old CRM code |
| Hooks configured | 0 | NONE — session protocol unenforced |
| Conditional:always-on ratio | 0:100 | All context loads every session |

## Findings

```
[CRITICAL] AP-01: Shadow Copies — 6 project_*.md files duplicate vault module profiles
  What: 370 lines (20.7 KB) of memory files that are stale subsets of Obsidian vault profiles.
        project_dashboard.md says "as of 2026-04-20" — vault has been updated 5 times since.
  Why it matters: Claude reads outdated status from memory, contradicts vault, user must correct.
  Token cost: ~1,480 tokens/session wasted on stale information.
  Fix: Delete all 6 files. Replace with one-line vault pointers in MEMORY.md.
```

```
[CRITICAL] AP-02: Triple Redundancy — CLAUDE.md, MEMORY.md, and vault store same data
  What: JIRA convention documented in CLAUDE.md (40 lines), MEMORY.md (18 lines), AND vault.
        Epic IDs conflict: CLAUDE.md says "TBD", MEMORY.md says "HNC-2013", vault says "HNC-2013".
        Digitization FRD version: CLAUDE.md says "v0.1", MEMORY.md says "v3.0", vault says "v3.0".
  Why it matters: 15+ data conflicts between auto-injected files. Claude picks one — unpredictable which.
  Token cost: ~960 tokens/session on duplicated content.
  Fix: Each fact in exactly one place. Conventions → CLAUDE.md. Status → vault only. User prefs → memory only.
```

```
[HIGH] AP-03: Always-On Convention Bloat — all feedback rules load every session
  What: 6 feedback_*.md files (108 lines) load at session start regardless of task topic.
        JIRA story format rules load during prototype work. FRD style rules load during scope tracking.
  Why it matters: 70% of convention context irrelevant to any given session.
  Token cost: ~300 tokens/session on irrelevant rules.
  Fix: Create .claude/rules/ files with globs. JIRA rules → jira/**. FRD rules → requirements/**.
```

```
[HIGH] AP-04: No Deny Rules — Claude searches 67 BMAD framework files and old CRM code
  What: No permissions.deny configured. Claude's search reaches _bmad/ (67 files, never edited)
        and old_crm_code/ (legacy reference, rarely needed).
  Why it matters: Grep results polluted with framework internals. Extra tool calls to filter.
  Token cost: ~200-500 tokens per polluted search (estimate 3-5 searches/session = 600-2,500 tokens).
  Fix: Add deny rules for _bmad/, old_crm_code/, .claude/worktrees/, .venv/, node_modules/.
```

```
[HIGH] AP-05: Unenforced Session Protocol — 9-step session workflow is text-only
  What: CLAUDE.md describes a 9-step session-end protocol (create session file, update Decision Log,
        update _Index.md, etc.) but nothing enforces it.
  Why it matters: Protocol skipped in ~40% of sessions based on vault gap analysis.
        Missing session files = lost context for future sessions.
  Token cost: No direct token cost, but missing context causes 2-3 extra orientation tool calls
        in subsequent sessions (~150-300 tokens/session downstream).
  Fix: Stop hook that fires on turn end, reminds about vault updates and session files.
```

```
[MEDIUM] AP-06: BMAD Section Bloat — 28 lines of unused framework docs in CLAUDE.md
  What: BMAD framework section (28 lines) describes workflows not used in actual project workflow.
        Project workflow is "Draft FRD -> Freeze -> JIRA stories" not the BMAD pipeline.
  Why it matters: 28 lines = ~112 tokens/session on irrelevant content.
  Token cost: ~112 tokens/session.
  Fix: Trim to 3-line summary. Full BMAD docs are in _bmad/ if ever needed.
```

```
[LOW] AP-09: Permission Bloat — 150+ allow entries in settings.local.json
  What: settings.local.json has 150+ specific bash command patterns, many one-off.
  Why it matters: No direct token impact but makes security audit difficult.
  Token cost: 0 (not injected into context).
  Fix: Periodic cleanup — replace specific one-off commands with pattern-based allows.
```

## Workflow Optimization Opportunities

1. **Session startup currently requires 7-8 file reads (550+ lines) before any work.** After fixes: 3-4 reads (200 lines). Saves ~1,400 tokens and 15-20 seconds per session start.

2. **Manual vault navigation** — user tells Claude which module profile to read each session. Could be automated: a start hook reads `_Index.md` and pre-loads the relevant module profile based on the user's first message.

3. **JIRA story creation is a multi-step manual process** that repeats the same pattern. The existing `/jira-sync` skill handles import but there's no `/create-story` skill for the export direction.

## Implementation Plan

**Quick Wins (< 5 min each):**
1. Delete 6 `project_*.md` shadow copies — saves ~1,480 tokens/session
2. Add deny rules for `_bmad/`, `old_crm_code/`, `.claude/worktrees/` — eliminates search pollution
3. Trim BMAD section in CLAUDE.md from 28 lines to 3 — saves ~112 tokens/session

**Medium Effort (15-30 min each):**
4. Create 4 rules files (jira, frd, prototypes, vault) — saves ~300 tokens/session, improves relevance
5. Consolidate 6 feedback files into 2 — reduces file count, easier maintenance
6. Remove stale status data from CLAUDE.md (epic IDs, FRD versions) — fixes 15+ contradictions
7. Rewrite MEMORY.md as lean index with vault pointers — removes duplication with CLAUDE.md

**Larger Changes (30-60 min):**
8. Create stop hook for session-end protocol enforcement — eliminates protocol skipping
9. Create memory audit script for periodic health checks — prevents future drift
10. Clean up settings.local.json permissions — better security posture

**Estimated Total Impact:**
- Token savings: ~3,500-5,000 tokens/session (35-50% reduction in context overhead)
- Accuracy improvement: Eliminate 15+ contradictions between auto-injected files
- Speed improvement: Session startup ~50% faster (7 reads → 3 reads)
- Maintenance: Feedback loops prevent re-accumulation of debt

## What NOT to Do

- **Don't add LSP configuration** — this is a docs/requirements project, not a codebase. No code to navigate.
- **Don't create a start hook to auto-load module profiles** — the user's topic varies each session; auto-guessing is more likely to load the wrong module than the right one.
- **Don't bundle as a plugin** — single user, single project. Plugin overhead isn't justified yet.
- **Don't add MCP servers** — no external APIs or tools to connect to. Everything is local files.
- **Don't restructure the vault** — the Obsidian vault structure is well-designed. The problem is the Claude Code config around it, not the vault itself.

---

> I'm available to deep-dive into any finding, help draft specific files, or discuss alternative approaches. What would you like to explore first?
