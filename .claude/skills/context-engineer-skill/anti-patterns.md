# Context Engineer — Anti-Pattern Catalog

Common context management anti-patterns observed in real Claude Code projects. Each entry includes symptoms, root cause, quantified impact, and fix.

---

## AP-01: Shadow Copies (The #1 Killer)

**What:** Memory files that duplicate state from the repo (module status, sprint data, story counts, file inventories).

**Symptoms:**
- `project_*.md` files in memory directory
- Memory entries with "as of [date]" timestamps
- Claude contradicts itself between memory and repo state
- User constantly corrects Claude's outdated information

**Root Cause:** Developer creates a memory file to avoid reading the repo file each session. File works for 2 weeks, then drifts as the repo evolves. Now there are two sources of truth, one stale.

**Impact:**
- Token waste: Each shadow file = 50-300 lines = 200-1,200 tokens loaded every session, containing wrong information
- Accuracy: Claude confidently states stale facts from memory, user must correct, wastes 1-2 turns
- Compounding: More shadow copies = more contradictions = more corrections = slower sessions

**Fix:** Delete all shadow copy files. Replace with one-line pointers in MEMORY.md: "Module status: read `path/to/actual/file.md`". The repo file is always current — trust it.

**Real example:** A requirements project had 6 `project_*.md` files (370 lines, 20.7 KB) that were subsets of their Obsidian vault profiles. After deletion: 72% memory size reduction, zero contradictions.

---

## AP-02: Triple Redundancy

**What:** The same information stored in CLAUDE.md, MEMORY.md, AND a repo file (vault, docs, or code comments).

**Symptoms:**
- CLAUDE.md says "Dashboard Epic: TBD" while MEMORY.md says "HNC-2013" and the vault says "HNC-2013"
- Same convention documented in 3 places with slight wording differences
- Session workflow described in both CLAUDE.md and MEMORY.md

**Root Cause:** Information starts in CLAUDE.md, gets copied to MEMORY.md for "quick access," then the repo file is updated but CLAUDE.md and MEMORY.md aren't. Or: MEMORY.md auto-captures facts already in CLAUDE.md.

**Impact:**
- Token waste: 2x-3x tokens for the same information
- Accuracy: When copies drift, Claude reads conflicting data. Which one does it trust? Unpredictable.
- Maintenance: Every update must be made in 3 places (it won't be)

**Fix:** Each fact lives in exactly one place. Rule of thumb:
- Timeless conventions → CLAUDE.md
- User preferences, external refs → Memory
- Project state, status, decisions → Repo files only
- Remove duplicates. Add pointers instead of copies.

---

## AP-03: Always-On Convention Bloat

**What:** All project conventions loaded every session, even when irrelevant to the current task.

**Symptoms:**
- CLAUDE.md is 400+ lines with detailed conventions for every aspect of the project
- "Always read these 6 files at session start" instructions
- Simple tasks (fix a typo) require reading 5+ context files before Claude can act

**Root Cause:** No conditional loading mechanism. Developer keeps adding conventions to CLAUDE.md because it's the only place Claude reads reliably.

**Impact:**
- Token waste: If 70% of CLAUDE.md is irrelevant to the current task, that's ~1,400 tokens wasted on a 500-line file
- Speed: More context = slower first response
- Accuracy: Irrelevant instructions compete for Claude's attention (e.g., JIRA formatting rules loaded during a code review)

**Fix:** Move specific conventions to `.claude/rules/` files with glob patterns. CLAUDE.md keeps only universal fundamentals (project overview, repo structure, key workflow). Rules files activate only when matching files are touched.

---

## AP-04: No Deny Rules (The Wandering Agent)

**What:** Claude can search/read every file in the repo, including generated code, vendor directories, and build artifacts.

**Symptoms:**
- `grep` results polluted with `node_modules/`, `.venv/`, `dist/` matches
- Claude reads a minified JS file and tries to understand it
- Search for a function name returns 500 results across 200 vendor files
- Claude wastes 3-4 tool calls narrowing down the right file

**Root Cause:** Default Claude Code settings allow reading everything. Developer never configured deny rules.

**Impact:**
- Token waste: Each irrelevant search result = ~50-100 tokens. A polluted grep returning 20 irrelevant results = ~1,000-2,000 tokens wasted
- Speed: Extra tool calls to filter results = 5-15 seconds per search
- Accuracy: Claude may act on vendor code instead of project code

**Fix:** Add deny rules in `.claude/settings.json` for: `node_modules/`, `.venv/`, `vendor/`, `dist/`, `build/`, `coverage/`, `__pycache__/`, lock files, and any framework internals not user-editable.

---

## AP-05: Unenforced Protocols (Hope-Based Engineering)

**What:** Session protocols, update rules, and coding standards exist as text instructions but have no enforcement mechanism.

**Symptoms:**
- CLAUDE.md says "always update the Decision Log" but it's skipped in 50% of sessions
- "Run tests before committing" rule is ignored under time pressure
- Memory says "vault-first" but Claude searches the full project anyway

**Root Cause:** Text instructions are hints, not guardrails. Claude may follow them, or may not, depending on context window pressure and task focus.

**Impact:**
- Accuracy: Protocols exist for a reason. Skipping "update the Decision Log" means lost decisions. Skipping "run tests" means broken code.
- Compounding: Each skipped update creates drift that makes future sessions harder

**Fix:** Critical rules → Hooks (deterministic enforcement). Important conventions → Rules files (loaded when relevant). Nice-to-haves → CLAUDE.md text (best effort).

Priority for hook enforcement: session-end protocols, memory hygiene checks, lint/format before commit.

---

## AP-06: Monolith CLAUDE.md

**What:** A single root CLAUDE.md covering all aspects of a complex project — from API conventions to frontend patterns to database migrations to deployment.

**Symptoms:**
- CLAUDE.md is 500+ lines
- Sections for different services/areas that are irrelevant to each other
- Developer working on frontend gets 200 lines of backend conventions in context

**Root Cause:** Developer started with one CLAUDE.md and kept adding to it as the project grew. No one restructured it.

**Impact:**
- Token waste: Proportional to irrelevant sections. If working on frontend and backend sections are 200 lines, that's ~800 wasted tokens per session
- Accuracy: Cross-contamination — backend patterns influence frontend suggestions and vice versa

**Fix:** Split into root CLAUDE.md (50-100 lines: project overview, universal conventions) + subdirectory CLAUDE.md files for each service/area. Claude walks up the directory tree and loads additively — working in `src/api/` loads both root and `src/api/CLAUDE.md`.

---

## AP-07: Stale Model Compensation

**What:** Instructions that compensate for older model limitations but constrain newer models.

**Symptoms:**
- "Break all refactors into single-file changes" (compensated for older models that struggled with multi-file edits)
- "Always show your reasoning step by step before acting" (compensated for older models that skipped steps)
- "Never modify more than 3 files in one turn" (arbitrary limit based on old context window sizes)

**Root Cause:** Instructions added when using Claude 3.5/Sonnet that are no longer needed with Claude 4+/Opus. Never cleaned up.

**Impact:**
- Speed: Artificial constraints slow down work that newer models handle natively
- Quality: Preventing multi-file refactors means incomplete changes

**Fix:** Review all CLAUDE.md instructions with the question: "Would Claude do the wrong thing if I removed this?" If the answer is "probably not with current models," remove it. Do this review every 3-6 months or after major model releases.

---

## AP-08: Memory Without Feedback Loops

**What:** Memory files accumulate over time with no mechanism to prune, consolidate, or validate.

**Symptoms:**
- Memory file count grows monotonically (only adds, never deletes)
- MEMORY.md approaching or exceeding 200-line cap
- Memory files from 3+ months ago with no verification
- Contradictory memories (old says X, new says Y, both exist)

**Root Cause:** Auto-memory captures facts during sessions. Nobody reviews or prunes. Files accumulate until MEMORY.md hits the 200-line cap and starts losing information silently.

**Impact:**
- Accuracy: Contradictory memories cause unpredictable behavior
- Token waste: Stale memories waste tokens on irrelevant information
- Silent failure: Beyond line 200, MEMORY.md content is invisible but the files still exist, creating ghost context

**Fix:** Implement feedback loops:
1. Hard caps documented in MEMORY.md (max files, max lines)
2. Session-end hygiene check (hook or protocol)
3. Periodic audit script (monthly)
4. Ban patterns that always drift (project_*.md shadow copies)

---

## AP-09: Overly Broad Permissions

**What:** `.claude/settings.local.json` has grown to 150+ allow entries, many overly specific or duplicate.

**Symptoms:**
- Permissions file is 100+ lines
- Entries like `Bash(cd "C:/specific/path/to/very/specific/file" && very specific command)`
- Same tool allowed multiple times with slightly different patterns
- `Bash(*)` or `Read(**)` granting blanket access

**Root Cause:** Each time Claude asks for permission, user clicks "allow" and it gets saved. Over months, the list grows with one-off commands that will never be used again.

**Impact:**
- Security: Overly broad permissions reduce the safety guardrail value
- Maintenance: Impossible to audit what's actually allowed
- No direct token impact, but creates a false sense of security

**Fix:** Periodically clean up `settings.local.json`. Replace specific one-off commands with pattern-based allows (`Bash(python:*)` instead of 20 specific python commands). Remove entries for tools/paths that no longer exist.

---

## AP-10: Missing Subdirectory Scoping (Monorepo)

**What:** Monorepo with multiple services but Claude always runs from root, loading all context for all services.

**Symptoms:**
- `cd` to service directory at start of every session
- Claude suggests imports from wrong service
- Test commands run the full suite instead of service-specific tests
- Search results span all services

**Root Cause:** Developer always opens Claude from repo root out of habit. No per-service CLAUDE.md files exist.

**Impact:**
- Token waste: Loading 5 services' worth of context when working on 1 = ~80% waste
- Accuracy: Cross-service confusion in suggestions
- Speed: Searches across entire monorepo instead of relevant service

**Fix:** Create CLAUDE.md in each service directory with service-specific conventions, test commands, and key file locations. Open Claude from the service directory, not root. Use deny rules to exclude other services' build artifacts.
