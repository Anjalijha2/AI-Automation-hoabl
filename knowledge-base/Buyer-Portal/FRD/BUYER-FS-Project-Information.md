# Feature-Spec: Project Information

**Portal:** Buyer Portal
**URL:** `https://uat.xrportal.in/project`
**Created:** 2026-05-12
**Status:** Complete

---

## Feature 1: Browse Project Information

### 1.1 Objective

Allow buyers to access comprehensive information about the real estate project — including photos, amenities, official documents, and virtual tours — to better understand their investment.

### 1.2 Scope

Read-only section. Content is managed by the admin via Strapi CMS. Available to all registered buyers regardless of allocation status.

### 1.3 Preconditions

- Buyer must be logged in

### 1.4 Project Information Sections

| Section | Component | Content |
|---------|-----------|---------|
| Project Overview | TopBarProject | Overview with navigation tabs |
| Tower Specifications | TowerSection, TowerTabs | Tower-wise specs and details |
| Gallery | Gallery | Photo gallery managed via Strapi |
| Documents | Documents | RERA registration, approvals, brochures |
| Videos | Videos | Virtual tours and promotional videos |

### 1.5 Business Rules

1. Content is managed via Strapi CMS — buyers cannot edit anything
2. RERA registration documents are included in the Documents section for legal compliance
3. Content is available from the moment of registration, before and after allocation
4. Gallery, documents, and videos update when the admin publishes new content via Strapi

---

## How to Use: Exploring Project Information

**Who does this:** Buyer, at any stage of the journey

---

**Step 1 — Navigate to Project**

From the navigation menu, tap or click **Project**. The project information hub will open.

**Step 2 — Browse the sections**

Use the tabs to explore:

- **Overview** — General project description and highlights
- **Towers** — Specifications for each tower (heights, configurations, typologies)
- **Gallery** — Photos of the project, interiors, and surroundings
- **Documents** — Official RERA registration, legal approvals, and project brochures
- **Videos** — Virtual tours and walkthroughs

**Step 3 — Download or share documents**

In the Documents section, you can view and download RERA registration and other official documents. These are useful for your records and for sharing with your financial advisor or bank.

> **Note:** All content is maintained by the developer's team. If you notice missing or outdated information, contact your Sales Manager or Channel Partner.
