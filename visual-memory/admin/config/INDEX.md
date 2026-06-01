# Visual Memory — Admin Portal / Config

**Captured:** 2026-06-01
**Viewport (desktop):** 1920×900
**Environment:** UAT (https://uat-web.xrportal.in/admin/cms)
**CAPTURE_STATUS:** FULL

> **Route note:** Sidebar item "Config" navigates to `/admin/cms` — this is the canonical URL for this module.
> Module was previously named "CMS" — URL slug `/admin/cms` retained for backward compatibility. Display name is now "Config".
> `/admin/config` is **not yet** a valid route (302-redirects to `/admin/customers`) — intentionally not updated to avoid routing impact.
> The separate sidebar "CMS" item → `https://manage-uat.xrportal.in/admin/auth/login` (external Strapi) is **excluded entirely** per CLAUDE.md constraint #2.
> **Canonical folder**: `visual-memory/admin/config/` — use this for all TC generation. `admin/admin-cms/` is deprecated.

---

## Screens

| File | Screen | When Captured |
|------|--------|--------------|
| `screenshot-desktop.png` | Configurations — viewport-cropped top of page showing Tower Configuration grid (1920×900) | Live inspection via MCP browser |
| `screenshot-ui.png` | Configurations — full-page capture showing all 9 sections end-to-end | Live inspection via MCP browser |

---

## Key Structural Notes

### Page Heading
- Page title: `h5` "Configurations"

### Section Map (9 sections, top to bottom)
| # | Section heading (h5) | Purpose | Key controls |
|---|----------------------|---------|--------------|
| 1 | Tower Configuration | Enable/disable each of 18 towers | per-tower `button "View Tower"` + `switch.ant-switch` (Active/Inactive); footer `button "Update Tower Configuration"` |
| 2 | Registration Status | Bulk upload registration status changes | `button "Sample File Download"` · `button "upload Upload File"` · `button "Submit"` · counters "Total active registration: 8677" / "Total inactive registration: 5" |
| 3 | Unit Status | Bulk upload unit active/inactive | `button "Sample File Download"` · `button "upload Upload File"` · `button "Submit"` · counters "Total active unit: 3729" / "Total inactive unit: 738" |
| 4 | Unit Cost Update | Bulk upload unit cost changes | `button "Available Unit Inventory Download"` · `button "upload Upload File"` · `button "Submit"` · same counters |
| 5 | Bulk Booking Cancellation | Bulk cancel bookings via upload | `button "Sample File Download"` · `button "upload Upload File"` · `button "Submit"` |
| 6 | Bulk Registration Cancellation | Bulk cancel registrations via upload | `button "Sample File Download"` · `button "upload Upload File"` · `button "Submit"` |
| 7 | Sales Managers | Bulk Sales Manager assignment upload | `button "Sample File Download"` · `button "upload Upload File"` · `button "Submit"` |
| 8 | Customer Actions Card | Toggle additional-registration permission per BHK type | `switch` "Allow Additional Registrations" + checkboxes "Allow 1 Bed Growth Home" / "Allow 2 Bed Growth Home" / "Allow 2 Bed Rise Home" + Ant Select per checkbox showing current value (15/17/20) + `button "Submit"` |
| 9 | Max Preferences Per Unit | Limit preferences allowed per unit | `h6` "Max Preferences Per Unit" + helper "Set the maximum number of preferences a user can select for each unit" + Ant Select (current value "6") + `button "Update"` |

### Tower Configuration grid detail
- 18 tower cards: Tower 8-Crest, 9-Triumph, 10-Crown, 13-Prestige, 14-Horizon, 15-Radiance, 6-Aspire, 7-Blossom, 12-Pinnacle, 16-Fortune, 17-Bright, 18-Grand, 1-Dawn, 2-Aura, 3-Glory, 4-Pride, 5-Grace, 11-Prime
- Each card structure: `.tower-configuration-section` → `.tower-configuration-header` (h5 name + View Tower button) + `.tower-configuration-switch` (Ant `<button role="switch">`)
- Inactive default in current UAT data: Horizon, Pinnacle, Bright (switches unchecked)

### Controls Summary (counts)
- Total switches on page: 19 (18 tower toggles + 1 "Allow Additional Registrations" master)
- Total "Upload File" buttons: 6 (sections 2, 3, 4, 5, 6, 7)
- Total "Sample File Download" buttons: 5 (sections 2, 3, 5, 6, 7) — section 4 uses a different label "Available Unit Inventory Download"
- Total "Submit" buttons: 7 (sections 2, 3, 4, 5, 6, 7, 8) — section 9 uses "Update"

### Containers & CSS Classes
- Top wrapper: `main.ant-layout-content.page-content`
- Form wrapper: `.form-section-wrapper`
- Tower section: `.tower-configuration-wrapper` → `.tower-configuration-section` (×18)
- Tower header: `.tower-configuration-header`
- Tower switch: `.tower-configuration-switch` (contains Ant `.ant-switch`)

### Sidebar Navigation
Same as other admin pages. The "Config" sidebar item is `<a href="/admin/cms">` — note the URL hash mismatch with the module display name.

### API / Network Notes (inferred)
- Bulk upload sections likely target `/api/admin/bulk-<entity>/upload` endpoints with multipart form data
- Counters next to each section ("Total active … : N" / "Total inactive … : N") are read-only stats; likely polled with the same endpoints that populate Customer/Towers dashboards
- Sample file downloads are static GET links per section
- Customer Actions Card likely persists via `POST /api/admin/config/customer-actions` with body listing BHK toggles + max counts
- Max Preferences likely persists via `POST /api/admin/config/preferences` with `{ maxPreferencesPerUnit: 6 }`

### Ant Design Notes
- Switches use `ant-switch` (state captured in `aria-checked` and `class*="ant-switch-checked"`)
- Selects use `ant-select-lg`
- Checkbox + helper rows use Ant `Checkbox` + custom `h6` labels
