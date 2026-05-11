---
name: CMS Config page full section map
description: /admin/cms has 9 sections — existing TC_ADMIN_CMS.md only covered 4; the remaining 5 are new discoveries
type: project
---

The /admin/cms "Configurations" page has 9 distinct functional sections:

1. Tower Configuration — toggle Active/Inactive per tower (18 towers); batch save
2. Registration Status — CSV bulk upload; Allow or Forbid registrations from allocation
3. Unit Status — CSV bulk upload; AVAILABLE/RESERVED per unit; Update=1/0 row control
4. Unit Cost Update — XLSX download current pricing; re-upload to update Agreement_Value + EarlyBird
5. Bulk Booking Cancellation — CSV upload to cancel confirmed bookings (NEW — not in prior TCs)
6. Bulk Registration Cancellation — CSV upload to cancel full registration records (NEW)
7. Sales Managers — CSV bulk upload to provision SM accounts (NEW)
8. Customer Actions Card — toggle Allow Additional Registrations; per-typology limits (NEW)
9. Max Preferences Per Unit — system-wide numeric cap on customer preference selections (NEW)

Existing TC_ADMIN_CMS.md covered sections 1-4 only. BRD cms-config.md covers all 9.

Live UAT stats (2026-05-08):
- Total active registration: 8,675 | inactive: 5
- Total active unit: 3,778 | inactive: 737
- Max Preferences Per Unit current value: 6
- Customer Actions Card: Allow Additional Registrations = Active; 1Bed limit=15, 2BedGrowth limit=17, 2BedRise limit=20
- All 18 towers are Active

**How to apply:** When writing test cases or selectors for CMS module, scope must include all 9 sections, not just the 4 from the old TC file.
