# Visual Memory — Admin Portal / Admin CMS

**CAPTURE_STATUS:** DEPRECATED

> **This folder is deprecated.** The module was renamed from "CMS" to "Config".
>
> **Canonical folder**: `visual-memory/admin/config/INDEX.md`
>
> **Why deprecated**: The sidebar item "Config" (previously "CMS") navigates to `/admin/cms`. This folder (`admin-cms`) was created under the old module name and duplicates `admin/config`. All BA Agent TC generation and QA automation must use `admin/config/` only.
>
> **Do not generate test cases from this folder.** Read `../config/INDEX.md` instead.
>
> **URL clarification**:
> - Module "Config" (renamed from "CMS") lives at: `https://uat-web.xrportal.in/admin/cms` — URL slug kept for backward compat
> - External Strapi "CMS" sidebar item → `https://manage-uat.xrportal.in/admin/auth/login` — excluded from QA scope entirely
>
> **Spec files to archive** (QA Agent action required):
> - `tests/e2e/admin/admin-cms.spec.js` → archive to `tests/archived/`
> - `tests/ui-ux/admin/admin-cms.spec.js` → archive to `tests/archived/`
> - Use `tests/e2e/admin/config.spec.js` and `tests/ui-ux/admin/config.spec.js` instead
