# Admin Portal — Admin CMS (External) User Guide

**Audience:** Admin / Content Team
**URL:** `https://uat-web.xrportal.in/admin/cms` (sidebar link) → opens external Strapi instance at `https://manage-uat.xrportal.in`
**Sources:** ADMIN-BRD-Config-CMS.md (disambiguation note) · ADMIN-FS-Config-CMS.md
**Last Updated:** 2026-05-22

---

## Overview

The **CMS** entry in the left sidebar opens an **external Strapi content management system** at `https://manage-uat.xrportal.in`. This is distinct from the **Config** entry (`/admin/cms` titled "Configurations") which is the in-portal admin operations panel documented in `config.md`.

This guide covers what admins need to know about the external CMS link from the Admin Portal perspective. The Strapi instance itself is explicitly **out of scope** for in-portal source scans and BRD/FRD documentation under the project's constraints (see `CLAUDE.md` — Strapi is excluded from all source scans; test only downstream portal effects).

---

## Disambiguation — Two Sidebar Entries

| Sidebar Entry | Where it goes | What it controls | Documented in |
|---------------|---------------|------------------|----------------|
| **Config** | `/admin/cms` (in-portal page titled "Configurations") | 9 operational sections — Tower toggles, Unit Status, Pricing, Sales Managers bulk upload, Customer Actions, Max Preferences | `config.md` |
| **CMS** | External link → `https://manage-uat.xrportal.in` (Strapi) | Buyer-facing content — banners, marketing pages, hero copy, image assets, FAQs | `admin-cms.md` (this file) |

**Critical:** Do not click "Submit" or upload files into Config Section X expecting CMS behaviour, or vice versa. They are entirely separate systems.

---

## Page Layout (At a Glance)

This entry opens a **new browser tab / window** to the external Strapi admin UI:
- Strapi login screen (separate credentials from XR Portal Admin).
- Strapi admin shell — Collection Types, Single Types, Media Library, Plugins, Settings.

The Admin Portal does NOT render the CMS inside its own UI shell. Auth context does NOT transfer — Strapi has its own user accounts.

---

# Feature 1 — Open the External CMS

### What it does
Navigates from the XR Portal Admin sidebar to the external Strapi content management system.

### Preconditions
- Admin session in XR Portal Admin.
- Separate Strapi admin credentials provisioned for your account in the Strapi instance.

### How to use
1. Click **CMS** in the left sidebar of the XR Portal Admin.
2. A new browser tab opens to `https://manage-uat.xrportal.in` (UAT) — production points to the equivalent prod Strapi URL.
3. **Log in to Strapi** using your Strapi-issued email + password. **XR Portal Admin OTP credentials do NOT work here** — Strapi is a separate auth realm.

### Result
You are inside the Strapi admin shell with access to whatever Collection Types and Single Types your Strapi role grants.

### Warning
The XR Portal session and Strapi session are independent. Logging out of XR Portal does NOT log you out of Strapi. Manage Strapi access via Strapi's own user/role configuration.

---

# Feature 2 — Edit Buyer-Facing Content (high-level guide)

### What it does
Strapi is used to manage content rendered on the buyer-facing portals (e.g. banners, marketing pages, FAQs, hero images). Changes published in Strapi propagate to the buyer portal on next page load / cache refresh.

### Preconditions
- Strapi admin login.
- Role with edit/publish permissions on the relevant Collection or Single Type.

### How to use (general pattern)
1. In Strapi, choose the Collection Type (e.g. **Banners**) or Single Type (e.g. **Home Page Hero**) from the left nav.
2. Edit the entry — text, image, dates, etc.
3. Click **Save** (creates a draft) then **Publish** (makes it live to the buyer portal).
4. Test the change by reloading the buyer-facing page (clear cache if necessary).

### Result
The buyer-facing portal reflects the new content on its next render or cache refresh.

### Warning
- Strapi content schemas, Collection Types, and publish workflows are managed within Strapi and are **out of scope** for this manual.
- Treat any change here as having immediate user-visible impact; coordinate with marketing / product before publishing.

---

# Feature 3 — Downstream Effects on Admin Portal

### What changes can affect the Admin Portal?
Most Strapi content is rendered on buyer-facing portals (`uat.xrportal.in`, CP portal). The Admin Portal itself is largely independent of Strapi content. Known crossover surfaces:

| Surface | Type of CMS influence |
|---------|----------------------|
| Customer Portal banners / hero images | Strapi-driven |
| Buyer FAQ / marketing pages | Strapi-driven |
| Admin Portal UI labels and navigation | **Not** Strapi-driven (built into the React app) |
| Allocation / Towers / Customers operational data | **Not** Strapi-driven (backend DB + Config) |

### Result
Admin Portal users typically do not see immediate effects from a Strapi change. Buyer Portal QA is the right place to validate Strapi-driven content.

---

## Business Rules

1. **CMS sidebar = external Strapi.** The in-portal Config page is a separate system — see `config.md`.
2. **Separate auth realm.** Strapi has its own user accounts and roles; XR Portal Admin OTP does not authenticate to Strapi.
3. **Out of QA framework scope.** Per `CLAUDE.md` constraints, Strapi is excluded from in-portal source scans. The QA framework tests only the downstream effects on buyer portals.
4. **Content publishing is immediate.** Changes published in Strapi propagate on the next buyer-portal page load / cache refresh — no admin approval workflow inside the XR Portal.
5. **Coordinate with product/marketing** before publishing live content changes.

---

## Role Restrictions

- Strapi admins (separate user table) — full content management capability.
- XR Portal Admin role (roleId 1) — sees the **CMS** sidebar entry and can launch Strapi but cannot access Strapi without separate credentials.

---

## API Reference

Strapi exposes its own REST and GraphQL APIs at `https://manage-uat.xrportal.in` for content retrieval by the buyer portals. These endpoints are NOT documented here — refer to Strapi's own API documentation in the Strapi admin UI (Content-Type Builder → API ID reveals the endpoint path).

---

## Integrations

- **Buyer Portal (`uat.xrportal.in`)** — consumes Strapi content for marketing surfaces.
- **CP Portal** — may consume Strapi content for any CP-facing marketing assets.
- **Admin Portal** — does NOT consume Strapi for its own UI.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Click CMS in sidebar — new tab fails to load | Network or Strapi down | Try `https://manage-uat.xrportal.in` directly; escalate to DevOps if persistent |
| Strapi login rejects XR Portal mobile/OTP | Separate auth realm | Use your Strapi-issued email + password |
| Published a banner but buyers don't see it | Buyer portal cache or build-time embedding | Force-refresh the buyer page; if still stale, ask product about cache TTL |
| Looking for Tower toggles in CMS | Wrong sidebar entry — those live in **Config** | Use `/admin/cms` (Config page) — see `config.md` |
| Looking for SM bulk upload in CMS | Wrong sidebar entry — Section 7 of Config | Go to Config → Section 7 — see `config.md` |
| Can't write tests for CMS content | Strapi is out of scope for this framework | Test only the downstream rendering in the buyer portal |
