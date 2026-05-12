# CMS (Strapi) — BRD

**Type:** System Component Reference
**Created:** 2026-05-12
**Status:** Complete

---

## 1. Purpose

Strapi is the Content Management System (CMS) for the XR Portal. It controls all dynamic content displayed across the Buyer Portal, CP Portal, and Admin Portal's CMS screen — project information, gallery images, forms, and allocation page configuration. Content changes made in Strapi take effect without any code deployment.

---

## 2. Who Uses This

| Audience | Role |
|----------|------|
| Marketing / Content Team | Manages gallery, banners, project descriptions, documents |
| Admin | Configures allocation page layout and hero slides before each event |
| Development Team | Manages form field structure, KYC field configuration, band config |

---

## 3. What Strapi Controls

| Content Type | What It Manages | Who Updates It |
|-------------|----------------|----------------|
| **Project** | Gallery, hero banners, about section, amenities, RERA documents, project details | Marketing team |
| **Project Configuration** | Allocation event page layout, hero slides, header messages | Admin before each campaign |
| **Band Config** | DYNAMIC allocation band order — which units are offered in which sequence | Development / Admin |
| **Form Fields** | Registration and KYC form field definitions — labels, types, validation rules | Development team |
| **Forms** | Complete multi-step form structures for registration and KYC | Development team |
| **Steps Master** | Individual step definitions for multi-step form flows | Development team |
| **General** | Global configuration values and feature flags at content level | Admin / Development |

---

## 4. How Content Reaches Users

```
Marketing / Admin Team
    │ (updates content in Strapi admin panel)
    ▼
Strapi CMS (headless)
    │ (REST API call from backend)
    ▼
XR Portal Backend (strapi.service.js fetches on demand)
    │ (backend serves to portals via API response)
    ▼
Buyer Portal / CP Portal / Admin CMS Screen
    │
    ▼
End Users (buyers, CPs) see updated content
```

**No code deployment needed.** Content updates in Strapi are live on the next page load.

---

## 5. Project Content Sections

When a buyer or CP views the Project Information tab, every section comes from Strapi:

| Section | Content |
|---------|---------|
| Hero Banner | Main image and headline text |
| About the Project | Description and developer information |
| Gallery | Photo gallery (managed by marketing) |
| Amenities | List of facilities (gym, pool, clubhouse, etc.) |
| Documents | RERA certificate, approvals, legal documents |
| Unit Configurations | Available unit types and carpet area details |
| Project Details | Key facts and highlights |

---

## 6. Allocation Page Configuration

Before each allocation event, admin must update the **Project Configuration** in Strapi:

| Setting | Purpose |
|---------|---------|
| Hero Slides | Animated banners buyers see when allocation opens |
| Header Messages | Real-time status messages (e.g., "Round 2 starting in 5 minutes") |
| Allocation Page Layout | Controls the visual structure of the allocation screen |

---

## 7. Form Configuration

Registration and KYC forms are defined in Strapi — field labels, types, validation rules, and step order. Supported field types:

| Field Type | Example Use |
|-----------|------------|
| Text Input | Name, email, address |
| Radio | Purchase purpose (self / investment) |
| Dropdown | State, occupation |
| Textarea | Special instructions |
| File Upload | KYC document upload |
| Typology Selector | Unit type preference |

---

## 8. Band Configuration (DYNAMIC Allocation)

In DYNAMIC allocation, units are assigned in band order. Band config in Strapi defines:
- Band name and identifier
- Band sequence order (Band 1 first, Band 2 next, etc.)
- Which typology/unit type each band contains
- Which project the band applies to

**Critical:** Band configuration in Strapi must align with unit data in the main database. Misalignment causes incorrect unit assignment during DYNAMIC campaigns.

---

## 9. Key Business Rules

1. Content changes in Strapi take effect without code deployment.
2. RERA documents stored in Strapi must be publicly accessible for legal compliance.
3. Allocation hero slides and header messages must be updated before each campaign.
4. Band configuration must match the unit structure in the main database.
5. If Strapi is unavailable, portal pages may show cached content or blank sections — core platform functions (payments, allocation) are unaffected.
6. Gallery images must be uploaded to Strapi's media library before they can be used in page sections.

---

## How to Use: CMS

---

### Admin: Updating Allocation Page Content Before a Campaign

**Step 1:** Log into the Strapi admin panel (separate from the XR Admin Portal).

**Step 2:** Navigate to **Project Configuration** → find the current project.

**Step 3:** Update the **Hero Slides** with fresh campaign imagery and messaging.

**Step 4:** Update **Header Messages** with any pre-campaign announcements.

**Step 5:** Publish the changes. Buyers will see the updated content when the campaign goes live.

---

### Admin: Updating Project Gallery or Documents

**Step 1:** Log into the Strapi admin panel.

**Step 2:** Navigate to **Project** → select the project.

**Step 3:** Go to the relevant section (Gallery, Documents, Amenities).

**Step 4:** Upload new images to the Strapi media library, then add them to the section.

**Step 5:** For documents (RERA, approvals): upload the PDF and set visibility to Public.

**Step 6:** Publish. Changes appear on the portal on next page load — no deployment needed.

---

### Admin: What Happens If Strapi Is Down

- Project Information tab may show blank content or cached data.
- KYC and registration forms may not load field definitions.
- Core actions (payments, allocation processing, unit booking) are **not affected** — they do not depend on Strapi.
- Contact technical support to restore the Strapi service. Do not stop any active campaigns.

---

## 10. Related Documents

- [[BRD-Admin-Overview]] — Admin CMS module overview
- [[BRD-Integrations]] — Strapi as inbound integration
- [[BRD-Allocation-Workflow]] — Band config context
- [[BRD-Buyer-Portal]] — Project Information feature
- [[BRD-CP-Portal]] — Project Information feature
