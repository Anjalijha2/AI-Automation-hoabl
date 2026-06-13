# Context Engineer — Reference Checklist

Detailed audit criteria organized by category. Each check includes what to look for, why it matters, and how to fix it.

## 1. CLAUDE.md Health

### 1.1 Existence and Location
- [ ] Root CLAUDE.md exists
- [ ] Subdirectory CLAUDE.md files exist where needed (monorepo services, distinct code areas)
- [ ] No orphaned CLAUDE.md in dead/archived directories

**Why:** CLAUDE.md is the primary context injection point. Missing = Claude navigates blind. Wrong location = context loads for wrong scope.

### 1.2 Size and Density
- [ ] Root CLAUDE.md under 300 lines (ideal: 100-200)
- [ ] Each line earns its place — no filler, no verbose explanations of obvious things
- [ ] Subdirectory CLAUDE.md files under 100 lines each

**Impact:** Every line of CLAUDE.md consumes ~4 tokens. A 500-line file = ~2,000 tokens every session. At 50 sessions/week, that's 100K tokens/week on context alone.

### 1.3 Content Classification
- [ ] **Timeless conventions** (repo structure, naming, workflows) — belongs in CLAUDE.md
- [ ] **Time-sensitive status** (current sprint, FRD versions, epic IDs) — belongs in vault/docs/git, NOT CLAUDE.md
- [ ] **Domain knowledge** (brief glossary, key concepts) — belongs in CLAUDE.md if short, or rules file if domain-specific
- [ ] **Stale references** — no outdated file paths, deprecated APIs, old version numbers

**Anti-pattern:** CLAUDE.md as a changelog or status dashboard. It should describe HOW to work with the project, not WHAT the current state is.

### 1.4 Instruction Quality
- [ ] Instructions are actionable ("always create both .md and .html") not aspirational ("try to be consistent")
- [ ] No instructions compensating for old model limitations (check if rule was needed for Claude 3.5 but not 4+)
- [ ] No contradictory instructions across root and subdirectory files
- [ ] Workflow steps reference actual file paths, not vague descriptions

## 2. Memory System

### 2.1 Memory Index (MEMORY.md)
- [ ] Exists and is under 200 lines (hard cap — lines beyond 200 are invisible)
- [ ] Functions as an index with pointers, not as content storage
- [ ] Each entry is one line under ~150 characters
- [ ] No duplication of CLAUDE.md content
- [ ] No duplication of information derivable from code/git

**Impact:** MEMORY.md is auto-injected every session. Bloated index = wasted tokens + potential contradictions with CLAUDE.md.

### 2.2 Memory Files
- [ ] Total file count reasonable (under 15 for most projects)
- [ ] Total size under 30 KB (ideally under 15 KB)
- [ ] No `project_*.md` shadow copies of repo state (status belongs in the repo, not memory)
- [ ] No stale files with "as of [date]" older than 30 days without being verified
- [ ] Each file has clear frontmatter (name, description, type)
- [ ] Types are appropriate: user (who), feedback (how), project (why/what), reference (where)

**Anti-pattern: Shadow Copies** — Memory files that duplicate repo state (module status, story counts, current sprint). These always drift from the source of truth. Impact: Claude reads stale info from memory, contradicts current repo state, user corrects, wastes a turn.

### 2.3 Memory Hygiene
- [ ] Feedback loop exists to prevent memory bloat (rules, hooks, or documented protocol)
- [ ] Old memories are pruned or updated when project evolves
- [ ] No memories for things that can be derived (file paths, function signatures, git history)

## 3. Rules Files (.claude/rules/)

### 3.1 Existence
- [ ] Rules files exist for distinct work areas
- [ ] Globs are specific (e.g., `src/api/**`) not overly broad (`**/*.ts`)

**Impact:** Without rules files, all conventions load every session regardless of task. With rules files, conventions load only when touching relevant files. A project with 5 distinct areas saves ~80% of convention context per session.

### 3.2 Content Quality
- [ ] Rules contain operational instructions, not background knowledge
- [ ] Rules don't duplicate CLAUDE.md (CLAUDE.md = always-on fundamentals, rules = context-specific details)
- [ ] Rules are self-contained — Claude can follow them without needing to read other files first

### 3.3 Recommended Rules by Project Type

**Application Code:**
- `src/api/**` or `**/routes/**` — API conventions, endpoint patterns, auth requirements
- `**/*.test.*` or `**/*.spec.*` — test conventions, mocking strategy, fixture locations
- `**/migrations/**` — database migration conventions, naming, rollback rules
- `**/components/**` — UI component conventions, styling approach

**Requirements/Documentation:**
- `docs/**` or `requirements/**` — writing style, document format, versioning
- `stories/**` or `jira/**` — story format, ID conventions, file naming
- `vault/**` or `obsidian/**` — vault structure, linking, tagging conventions
- `prototypes/**` — prototype location, design language reference

**Testing/Automation:**
- `tests/**` — framework conventions, assertion patterns, data setup
- `fixtures/**` — fixture management, cleanup rules
- `ci/**` or `.github/**` — CI pipeline conventions, job naming

## 4. Deny Rules (settings.json)

### 4.1 Existence and Coverage
- [ ] Deny rules exist in `.claude/settings.json`
- [ ] Generated/vendored directories excluded: `node_modules/`, `.venv/`, `vendor/`, `dist/`, `build/`
- [ ] Framework/tool internals excluded if not user-editable
- [ ] Lock files excluded if not manually edited (`package-lock.json`, `yarn.lock`, `poetry.lock`)
- [ ] Stale worktrees excluded (`.claude/worktrees/`)

**Impact:** Without deny rules, Claude's search tools return results from irrelevant directories. A `node_modules/` with 50K files means grep results are polluted with library internals. Each irrelevant result wastes tokens and may send Claude down the wrong path.

### 4.2 Not Over-Denied
- [ ] No deny rules blocking directories the user regularly needs Claude to read
- [ ] Legacy/archive directories can be accessed if explicitly needed (deny with override path)

## 5. Hooks

### 5.1 Stop Hook (Session Discipline)
- [ ] Stop hook exists for session-end enforcement (if project has session protocols)
- [ ] Hook checks for common drift patterns (memory bloat, missing updates)
- [ ] Hook timeout is short (<15s) to not block workflow

**Impact:** Without enforcement, session protocols are aspirational. In our real-world test, a "vault-first" rule was violated in 40% of sessions before a hook was added. After: 0% violations.

### 5.2 PreToolUse Hooks (Guardrails)
- [ ] Consider PreToolUse hooks for destructive operations (if applicable)
- [ ] Lint/format hooks for code projects (more reliable than asking Claude to remember)

### 5.3 Not Over-Hooked
- [ ] Hooks don't add >2 seconds of latency per turn
- [ ] No hooks that fire on every tool call for non-critical checks
- [ ] Hook failures are non-blocking for non-critical checks

## 6. Slash Commands & Skills

### 6.1 Quality
- [ ] Each command has a clear `description` in frontmatter
- [ ] Descriptions include trigger phrases for auto-invocation
- [ ] Commands are concise (under 100 lines for simple tasks)
- [ ] Complex workflows use supporting files, not 500-line monoliths

### 6.2 Coverage
- [ ] Common repetitive tasks have commands (deploy, test, release, sync)
- [ ] No duplicate commands doing the same thing with different names
- [ ] Commands use dynamic context (`!command`) not hardcoded paths

## 7. Context Layering Strategy

### 7.1 Separation of Concerns

| Layer | Contains | Loads When |
|-------|----------|------------|
| CLAUDE.md (root) | Project overview, universal conventions, key workflows | Every session |
| CLAUDE.md (subdir) | Service/area-specific conventions | When working in that directory |
| Rules files | Detailed conventions for specific file types | When matching files are touched |
| Memory | User preferences, external system refs, feedback corrections | Every session (MEMORY.md) or on-demand (child files) |
| Hooks | Enforcement, reminders, automation | On matching events |
| Deny rules | Noise reduction | Always active (filter, not injection) |

### 7.2 No Layer Violations
- [ ] Status/state data is NOT in CLAUDE.md or memory (it belongs in repo files, git, or docs)
- [ ] Conventions are NOT only in memory (they belong in CLAUDE.md or rules files)
- [ ] Enforcement is NOT only in CLAUDE.md text (it belongs in hooks for critical rules)
- [ ] File paths and credentials are NOT in CLAUDE.md (they belong in memory reference files)

## 8. Workflow Efficiency

### 8.1 Session Startup
- [ ] Claude can orient in under 3 tool calls (read CLAUDE.md → read relevant file → start working)
- [ ] No "always read these 5 files first" protocols (move to conditional loading or hooks)
- [ ] No manual context gathering that could be automated

### 8.2 Search Efficiency
- [ ] Claude finds the right file within 1-2 searches (deny rules filter noise, CLAUDE.md has pointers)
- [ ] No broad project-wide grep needed for common lookups (indexed in CLAUDE.md or rules files)
- [ ] Monorepos use subdirectory scoping so Claude doesn't search the entire repo

### 8.3 Repetitive Task Automation
- [ ] Tasks done more than 3x per week have slash commands
- [ ] Multi-step protocols have hooks or commands, not just written instructions
- [ ] File creation templates exist for common artifacts (stories, components, tests)

## 9. Project-Type-Specific Checks

### 9.1 Monorepo Specifics
- [ ] Each service/package has its own CLAUDE.md
- [ ] Test commands are per-service in CLAUDE.md, not full-suite
- [ ] Deny rules exclude other services' build artifacts
- [ ] Rules files are service-scoped (globs include service path prefix)

### 9.2 Documentation/Requirements Specifics
- [ ] Single source of truth identified (vault? wiki? repo docs?)
- [ ] No parallel state tracking in memory that duplicates the docs
- [ ] Document conventions (format, naming, versioning) in rules files, not always-on
- [ ] Session protocols enforced by hooks, not just documented

### 9.3 Testing/Automation Specifics
- [ ] Test conventions documented per test type (unit, integration, e2e)
- [ ] Test data/fixture locations documented
- [ ] Generated reports and coverage files denied from search
- [ ] CI/CD configuration referenced in CLAUDE.md if Claude needs to understand pipeline
