# Test Cases — Admin Portal Shell & CMS Link
**Portal:** Admin Portal
**BRD Reference:** ADMIN-BRD-Admin-Portal.md
**FSD Reference:** `manual-qa-repository/03-user-manual/admin/fsd-admin-cms.md`
**Last FSD Sync:** 2026-05-24

---

## [FSD-CORRECTION] Source-verified facts

- **There is NO traditional CMS in the XR backend.** The "CMS" admin sidebar link is actually a **config / bulk-upload console** (Config, Bulk Cancel, Bulk Refund, Customer Actions, etc.) — NOT a banner/gallery/testimonial CMS.
- **The real CMS is Strapi**, consumed by the backend as read-only feed (project content, banners, FAQs). Per project constraint, Strapi internals are OUT OF SCOPE for these tests.
- Any test that asserts the admin can publish/edit a banner, video, gallery item, FAQ, or testimonial from within the admin portal is INCORRECT — these are managed in Strapi externally.
- No source code in `admin.controller.js` or admin routes supports image-banner CRUD, video CRUD, gallery CRUD, FAQ CRUD, or testimonial CRUD from the XR admin portal.

---

## Portal Shell & Sidebar Navigation

### ADM_CMS_001 — Admin portal shell loads after successful login

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Admin completed OTP login |
| **Test Steps** | 1. Complete login flow<br>2. Observe portal layout |
| **Expected Result** | Left sidebar navigation, top header, and main content area render; default landing is Customers page |
| **Priority** | Critical |

---

### ADM_CMS_002 — Left sidebar shows all 10 module links plus Logout

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Inspect left sidebar |
| **Expected Result** | Sidebar shows: Customers, Config, Allocation, Offers, Towers, JBP Mgmt, Channel Partners, Sales Managers, Transactions, CMS (external), Logout |
| **Priority** | High |

---

### ADM_CMS_003 — Sidebar persistent across all admin pages

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Navigate to Towers, then Allocation, then Offers |
| **Expected Result** | Sidebar remains visible and consistent on every page |
| **Priority** | High |

---

### ADM_CMS_004 — Click Customers in sidebar navigates to /admin/customers

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Admin on any admin page |
| **Test Steps** | 1. Click "Customers" in sidebar |
| **Expected Result** | URL becomes /admin/customers; Customers page loads |
| **Priority** | Critical |

---

### ADM_CMS_005 — Click Config navigates to /admin/cms

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Click "Config" in sidebar |
| **Expected Result** | URL becomes /admin/cms; Configurations page loads |
| **Priority** | Critical |

---

### ADM_CMS_006 — Click Allocation navigates to /admin/allocation

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Click "Allocation" in sidebar |
| **Expected Result** | URL becomes /admin/allocation |
| **Priority** | High |

---

### ADM_CMS_007 — Click Offers navigates to /admin/offers

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Click "Offers" in sidebar |
| **Expected Result** | URL becomes /admin/offers |
| **Priority** | High |

---

### ADM_CMS_008 — Click Towers navigates to /admin/towers

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Click "Towers" in sidebar |
| **Expected Result** | URL becomes /admin/towers |
| **Priority** | High |

---

### ADM_CMS_009 — Click JBP Mgmt navigates to /admin/jbp-management

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Click "JBP Mgmt" in sidebar |
| **Expected Result** | URL becomes /admin/jbp-management |
| **Priority** | High |

---

### ADM_CMS_010 — Click Channel Partners navigates to /admin/channel-partners

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Click "Channel Partners" in sidebar |
| **Expected Result** | URL becomes /admin/channel-partners |
| **Priority** | High |

---

### ADM_CMS_011 — Click Sales Managers navigates to /admin/sales-managers

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Click "Sales Managers" in sidebar |
| **Expected Result** | URL becomes /admin/sales-managers |
| **Priority** | High |

---

### ADM_CMS_012 — Click Transactions navigates to /admin/payment-transactions

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Click "Transactions" in sidebar |
| **Expected Result** | URL becomes /admin/payment-transactions |
| **Priority** | High |

---

### ADM_CMS_013 — Current page is highlighted in sidebar

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Admin on a module page |
| **Test Steps** | 1. Navigate to Towers<br>2. Inspect sidebar |
| **Expected Result** | Towers sidebar item visually highlighted (different color/background) |
| **Priority** | Medium |

---

### ADM_CMS_014 — Sidebar item order matches BRD specification

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Read sidebar items top-to-bottom |
| **Expected Result** | Order: Customers, Config, Allocation, Offers, Towers, JBP Mgmt, Channel Partners, Sales Managers, Transactions, CMS, Logout |
| **Priority** | Medium |

---

## External CMS Link

### ADM_CMS_015 — Sidebar shows separate CMS link

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Locate "CMS" item in sidebar (separate from Config) |
| **Expected Result** | "CMS" link is visible and distinct from "Config" |
| **Priority** | High |

---

### ADM_CMS_016 — Clicking external CMS opens different domain

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Click "CMS" in sidebar |
| **Expected Result** | Opens external content management system at a different domain (Strapi); not part of admin portal |
| **Priority** | Medium |

---

### ADM_CMS_017 — External CMS opens in new tab/window

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Click CMS link |
| **Expected Result** | External CMS opens in new tab; admin portal session remains in original tab |
| **Priority** | Medium |

---

### ADM_CMS_018 — External CMS is documented as out-of-scope

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | N/A |
| **Test Steps** | 1. Review BRD for CMS link |
| **Expected Result** | BRD confirms external CMS is separate system, excluded from admin portal scope and testing |
| **Priority** | Medium |

---

### ADM_CMS_038 — External CMS link href points to non-XR domain

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **BRD/FRD Req** | FSD §1 (Strapi is the external CMS) |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Right-click "CMS" item in sidebar → Copy Link Address |
| **Expected Result** | URL points to a different domain than `uat-web.xrportal.in/admin` (Strapi-hosted CMS); confirms it is external |
| **Priority** | Medium |

---

### ADM_CMS_039 — External CMS link has target="_blank" / rel="noopener"

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Inspect HTML of the CMS sidebar item via DevTools |
| **Expected Result** | Anchor has `target="_blank"` and ideally `rel="noopener noreferrer"` so external CMS opens in a new tab without leaking session |
| **Priority** | High |

---

### ADM_CMS_040 — CMS link does not break admin session in original tab

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Admin logged in on /admin/customers |
| **Test Steps** | 1. Click CMS link (opens new tab)<br>2. Return to original tab<br>3. Refresh /admin/customers |
| **Expected Result** | Original tab still shows logged-in admin with Customers page; session unaffected by external CMS open |
| **Priority** | High |

---

### ADM_CMS_041 — CMS link is separate from /admin/cms Config route

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **BRD/FRD Req** | FSD §1 (Config != CMS) |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Click "Config" → confirm URL = /admin/cms<br>2. Click "CMS" → confirm URL is external Strapi domain |
| **Expected Result** | Two distinct sidebar items with different destinations: Config = internal /admin/cms config-console; CMS = external Strapi |
| **Priority** | High |

---

## Logout & Session

### ADM_CMS_019 — Logout button visible at bottom of sidebar

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Inspect bottom of sidebar |
| **Expected Result** | Logout button visible |
| **Priority** | High |

---

### ADM_CMS_020 — Click Logout ends session

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Click Logout in sidebar<br>2. Observe redirect |
| **Expected Result** | Session ended; redirected to /admin login page |
| **Priority** | Critical |

---

### ADM_CMS_021 — After logout, JWT token is invalidated

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Just logged out |
| **Test Steps** | 1. Try to use old token to access protected API endpoint |
| **Expected Result** | API rejects request with 401 Unauthorized; token no longer valid |
| **Priority** | Critical |

---

### ADM_CMS_022 — After logout, accessing protected route redirects to login

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Just logged out |
| **Test Steps** | 1. Try to navigate to /admin/customers via URL |
| **Expected Result** | Redirected to /admin login page |
| **Priority** | Critical |

---

### ADM_CMS_023 — Logout clears browser session storage

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Just logged out |
| **Test Steps** | 1. Open DevTools → Application → Local/Session Storage |
| **Expected Result** | Admin session keys cleared from browser storage |
| **Priority** | High |

---

## Access Control & Roles

### ADM_CMS_024 — Admin (roleId=1) can access all modules

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Logged in as Admin role |
| **Test Steps** | 1. Click each sidebar item in turn |
| **Expected Result** | All 9 portal pages load without access denied errors |
| **Priority** | Critical |

---

### ADM_CMS_025 — Sales Manager Admin (roleId=4) accesses all modules

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Logged in as SM Admin |
| **Test Steps** | 1. Navigate through all sidebar items |
| **Expected Result** | All modules accessible (with possible config restrictions per BRD) |
| **Priority** | High |

---

### ADM_CMS_026 — Buyer role cannot access admin portal

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Buyer session token (non-admin) |
| **Test Steps** | 1. Try to access /admin with buyer credentials |
| **Expected Result** | Access denied; redirected away from admin portal |
| **Priority** | Critical |

---

### ADM_CMS_027 — CP role cannot access admin portal

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | CP session token |
| **Test Steps** | 1. Try to access /admin |
| **Expected Result** | Access denied or redirected to CP portal |
| **Priority** | Critical |

---

### ADM_CMS_028 — Standard SM (non-admin) cannot access admin portal

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Standard SM (not SM Admin) session |
| **Test Steps** | 1. Try to access /admin |
| **Expected Result** | Access denied; redirected to SM portal |
| **Priority** | High |

---

## Page Rendering & Responsiveness

### ADM_CMS_029 — Sidebar always visible (no full-screen mode)

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Admin on any module |
| **Test Steps** | 1. Look for any toggle to hide/collapse sidebar |
| **Expected Result** | Sidebar always visible per BRD; no full-screen mode toggle |
| **Priority** | Medium |

---

### ADM_CMS_030 — Browser back button navigates module history

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Navigated Customers → Towers → Offers |
| **Test Steps** | 1. Click browser Back button |
| **Expected Result** | Returns to Towers page; sidebar reflects active page |
| **Priority** | Medium |

---

### ADM_CMS_031 — Direct URL navigation works for all modules

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Type /admin/offers directly in URL bar<br>2. Press Enter |
| **Expected Result** | Offers page loads directly without navigating via sidebar |
| **Priority** | High |

---

### ADM_CMS_032 — Invalid /admin/xyz URL shows 404 or redirects

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Navigate to /admin/nonexistent-module |
| **Expected Result** | 404 page or redirect to /admin/customers |
| **Priority** | Medium |

---

### ADM_CMS_033 — Page renders correctly at 1920x1080 desktop resolution

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Browser at 1920x1080 |
| **Test Steps** | 1. Load any admin page |
| **Expected Result** | All elements visible without scrolling for primary content |
| **Priority** | Medium |

---

### ADM_CMS_034 — Page renders at 1366x768 laptop resolution

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Browser at 1366x768 |
| **Test Steps** | 1. Load each module |
| **Expected Result** | All elements visible; sidebar and content area readable |
| **Priority** | Medium |

---

### ADM_CMS_035 — F5 refresh maintains session and page

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell |
| **Pre-conditions** | Admin on /admin/towers |
| **Test Steps** | 1. Press F5 |
| **Expected Result** | Towers page reloads; user stays logged in |
| **Priority** | High |

---

## [FSD-CORRECTION] New TCs — XR "Admin CMS" is NOT a content CMS

### ADM_CMS_FSD_036 — [FSD-CORRECTION] No banner/gallery/testimonial CRUD exists in XR admin portal

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell / CMS |
| **BRD/FRD Req** | FSD §1 / source: no admin routes for content CRUD |
| **Pre-conditions** | Admin logged in |
| **Test Steps** | 1. Look for any UI in /admin to create or edit a banner, image gallery, testimonial, FAQ, or homepage content<br>2. Inspect all sidebar items |
| **Expected Result** | No such UI exists. The "CMS" entry in the sidebar opens config/bulk-upload screens (Customer Actions, Bulk Cancel, Bulk Refund). All visual content shown on the buyer portal home page comes from Strapi (external CMS) — not editable from XR admin. Document as platform constraint. |
| **Priority** | High |

---

### ADM_CMS_FSD_037 — [FSD-CORRECTION] Strapi-sourced content is NOT testable from XR admin portal

| Field | Value |
|-------|-------|
| **Module** | ADM – Portal Shell / Strapi |
| **BRD/FRD Req** | FSD §1 / project constraint (Strapi excluded) |
| **Pre-conditions** | Buyer home page has Strapi-driven banner/content visible |
| **Test Steps** | 1. As admin, try to find any way to modify the buyer home page banner content from within /admin |
| **Expected Result** | Not possible. All such content edits happen in Strapi admin (out of scope). Any test asserting admin-side content editability is INVALID. |
| **Priority** | Medium |

---
