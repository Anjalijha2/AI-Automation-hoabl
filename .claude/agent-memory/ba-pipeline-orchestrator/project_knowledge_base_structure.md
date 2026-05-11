---
name: Knowledge Base Structure — Post-Cleanup (2026-05-10)
description: Clean knowledge base structure after 2026-05-10 reorganization — one file per module, naming convention, what was merged/deleted
type: project
---

Knowledge base at `.claude/knowledge-base/` was reorganized on 2026-05-10.

**Convention:** One file per module, named `Module - [Name].md`. All BRD content merged into module files.

**Current files:**
- `Module Index.md` — master navigation index
- `Open Questions.md` — all open clarifications across all modules
- `Module - Login.md` — Sprint 1
- `Module - Customers.md` — Sprint 1
- `Module - Config CMS.md` — Sprint 2 (merged BRD - CMS Config.md into it)
- `Module - Sales Managers.md` — Sprint 2 (merged BRD - Sales Managers.md into it)
- `Module - Allocation.md` — Sprint 3
- `Module - Towers.md` — Sprint 3
- `Module - Channel Partners.md` — Sprint 3
- `Module - JBP Management.md` — Sprint 3
- `Module - Offers.md` — Sprint 4 (merged BRD - Offers.md + Sprint 4 - Offers.md into it)
- `Module - Payment Transactions.md` — Sprint 5 BRD only (renamed from BRD - Payment Transactions.md)
- `Sprint 5 - Overview.md` — sprint record (kept)
- `Sprint 5 - Pipeline Status.md` — sprint record (kept)

**Deleted:**
- BRD - Offers.md (merged into Module - Offers.md)
- BRD - Sales Managers.md (merged into Module - Sales Managers.md)
- BRD - CMS Config.md (merged into Module - Config CMS.md)
- BRD - Payment Transactions.md (renamed to Module - Payment Transactions.md)
- Sprint 4 - Offers.md (unique content merged into Module - Offers.md)
- Sprint 5 - Clarifications.md (merged into Open Questions.md)
- 2026-05-08.md (empty file)

**Module file structure (standard sections):**
1. Overview
2. Navigation
3. Page Layout
4. Features
5. Business Rules
6. Integration Points
7. Domain Red Flags
8. Open Clarifications
9. Test Coverage

**Why:** User requested consolidation — duplicate BRD + Module files caused confusion. One source of truth per module.
**How to apply:** Always write to the single `Module - [Name].md` file. Never create separate BRD files.
