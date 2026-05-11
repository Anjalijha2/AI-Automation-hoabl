# CMS / Strapi — Business Requirements Document

**Component:** CMS (Content Management System)
**Technology:** Strapi v4 (Headless CMS)
**Last Updated:** 2026-05-10
**Sprint Reference:** BRD Reverse Engineering Sprint
**Tags:** #component/cms #type/brd #status/complete

---

## Related Notes
- [[Admin-Portal-BRD]]
- [[Buyer-Portal-BRD]]
- [[CP-Portal-BRD]]
- [[Backend-Functional-BRD]]

---

## 1. Overview

Strapi serves as the content management backend for the XR Portal. It manages all dynamic content that is displayed across the buyer portal, CP portal, and the CMS section of the admin portal. The backend fetches content from Strapi and serves it to the portals.

**URL Separation:**
- Strapi runs as a separate service from the main backend
- Backend communicates with Strapi via its REST API (`strapi.service.js`)
- Admin manages content through Strapi's built-in admin panel or through the XR Admin Portal's CMS screen

---

## 2. Content Types (Collections)

### 2.1 Band Config

**Collection:** `band-config`

**Purpose:** Defines pricing band configurations for units within a project. Bands are used in the DYNAMIC allocation algorithm to determine the order in which units are assigned to buyers.

**Key Fields:**
- Band name/identifier
- Band order sequence
- Associated typology/unit type
- Project linkage

**Business Use:**
- DYNAMIC allocation uses band_order to do round-robin unit assignment
- Units in Band 1 are offered first, then Band 2, etc.
- Within each band, units are assigned based on the tower sequence

---

### 2.2 Default Form Field

**Collection:** `default-form-field`

**Purpose:** Defines the default fields that appear in the buyer registration form and other forms across the portal.

**Components Used:**
- form-fields/input — Text input configuration
- form-fields/radio — Radio button options
- form-fields/select — Dropdown options
- form-fields/textarea — Multi-line text
- form-fields/file-upload — Document upload configuration
- form-fields/carpet-area — Carpet area display
- form-fields/topology — Typology selector
- form-fields/topology-config — Typology configuration options
- form-fields/values — Predefined option values

**Business Use:**
- Controls what fields appear in the registration form
- Allows non-technical admins to customize forms without code changes
- Supports different field types for different data collection needs

---

### 2.3 Form

**Collection:** `form`

**Purpose:** Defines complete form structures for various flows in the portal (registration, KYC, preferences, etc.).

**Components Used:**
- form-fields/steps — Multi-step form flow definition
- form-fields/conf-project — Project configuration fields

**Business Use:**
- Multi-step forms for registration and KYC
- Form steps can be reordered or modified through Strapi
- `steps-master` is a related collection defining individual step configurations

---

### 2.4 General

**Collection:** `general`

**Purpose:** General project settings and configuration that apply across the portal.

**Business Use:**
- Global configuration values
- Announcement messages
- Feature flags at the content level

---

### 2.5 Project

**Collection:** `project`

**Purpose:** Contains all project-level content — the main content source for project information displayed in buyer and CP portals.

**Sections (Components):**

| Component | Purpose |
|-----------|---------|
| project-section/hero-section | Hero banner images and messaging |
| project-section/about-us | Project description and developer information |
| project-section/banner | Banner images and text |
| project-section/banner-data | Extended banner configuration |
| project-section/gallery | Photo gallery images |
| project-section/gallery-data | Gallery metadata |
| project-section/amenities | Amenities list (gym, pool, clubhouse, etc.) |
| project-section/amenities-data | Amenities details |
| project-section/documents | Legal/RERA documents |
| project-section/document-data | Document metadata |
| project-section/details | Project highlights and key facts |
| project-section/details-data | Detailed project data |
| project-section/configurations | Unit configuration options |
| project-section/conf-data | Configuration data |
| project-section/band-conf | Band configuration per project |
| project-section/form-step | Form step definitions |

**Business Use:**
- All content seen on the "Project Information" tab in buyer and CP portals
- RERA documents accessible to buyers for legal compliance
- Amenities showcase for sales purposes
- Gallery managed by marketing team without code deployment

---

### 2.6 Project Conf (Project Configuration)

**Collection:** `project-conf`

**Purpose:** Project-specific configuration for the allocation event and buyer experience.

**Components Used:**

| Component | Purpose |
|-----------|---------|
| project-section/allocation-page-configurations | Controls the allocation page layout |
| allocation/hero-slides | Hero banner slides during allocation event |
| allocation/header-message | Header messages shown during allocation |

**Business Use:**
- Controls the visual experience during allocation campaigns
- Hero slides are the animated banners buyers see when allocation opens
- Header messages communicate real-time updates (e.g., "Round 2 starting in 5 minutes")
- Admin configures these before each allocation event

---

### 2.7 Steps Master

**Collection:** `steps-master`

**Purpose:** Defines the configuration of individual steps in multi-step form flows.

**Component:** `form-fields/steps`

**Business Use:**
- Each step in the registration or KYC form is defined here
- Allows admin to add, remove, or reorder form steps
- Step labels, validation requirements, and help text managed here

---

## 3. Component Types

### Form Field Components

| Component | Description |
|-----------|-------------|
| `form-fields/input` | Standard text input |
| `form-fields/radio` | Radio button group |
| `form-fields/select` | Dropdown select |
| `form-fields/textarea` | Multi-line text |
| `form-fields/file-upload` | File/document upload |
| `form-fields/carpet-area` | Carpet area display field |
| `form-fields/topology` | Typology selector |
| `form-fields/topology-config` | Typology configuration |
| `form-fields/steps` | Multi-step flow definition |
| `form-fields/values` | Predefined option values |
| `form-fields/conf-project` | Project configuration field |

### Project Section Components

| Component | Description |
|-----------|-------------|
| `project-section/hero-section` | Main hero banner |
| `project-section/about-us` | About content |
| `project-section/banner` | Promotional banners |
| `project-section/gallery` | Image gallery |
| `project-section/amenities` | Amenity items |
| `project-section/documents` | Legal documents |
| `project-section/details` | Project details |
| `project-section/configurations` | Unit configurations |
| `project-section/band-conf` | Pricing band config |
| `project-section/form-step` | Form step config |
| `project-section/allocation-page-configurations` | Allocation page setup |

### Allocation Components

| Component | Description |
|-----------|-------------|
| `allocation/hero-slides` | Sliding banners for allocation event |
| `allocation/header-message` | Header message during allocation |

---

## 4. Strapi Roles and Access

Strapi has its own role system separate from the main application:
- **Public:** Content types configured as public are accessible without authentication
- **Authenticated:** Requires Strapi API token for access
- **Admin:** Strapi admin panel access for content editors

**API Token:**
- The main backend uses a Strapi API token (`strapi.service.js`) to authenticate when fetching content
- Token is configured in environment variables

---

## 5. Strapi Extensions

**Directory:** `strapi/src/extensions/`

Custom Strapi extensions can override default behavior:
- Custom routes
- Custom controllers
- Middleware customizations

---

## 6. Database

**Directory:** `strapi/database/migrations/`

Strapi uses its own database (typically SQLite for dev, PostgreSQL for production) separate from the main application database (MySQL).

---

## 7. How CMS Content Flows to Portals

```
Admin/Marketing Team
      ↓ (edits content in Strapi admin panel)
Strapi CMS (headless)
      ↓ (REST API call from backend)
Backend API (strapi.service.js fetches content)
      ↓ (backend serves to portals via API)
Buyer Portal / CP Portal / Admin CMS Screen
      ↓ (renders content to users)
End Users (Buyers and CPs)
```

**Caching:**
- Backend may cache Strapi responses to reduce load
- Cache invalidation occurs when admin updates content

---

## 8. Content Update Workflow

1. Marketing/Content team logs into Strapi admin panel
2. Selects the content type to update (e.g., Project → Gallery)
3. Uploads new images or updates text
4. Publishes the content
5. Backend fetches updated content on next API call
6. Portals reflect the changes in real time (or on next page load)

---

## 9. Business Rules

- Gallery images must be uploaded to Strapi's media library before use
- Documents (RERA, approvals) stored in Strapi's public uploads directory
- Allocation hero slides should be updated before each allocation event
- Band configuration in CMS must align with the unit data in the main database
- Steps master configuration must match the KYC/registration form field structure
- Content changes do not require code deployment — zero-downtime updates
- RERA documents must be publicly accessible for legal compliance
