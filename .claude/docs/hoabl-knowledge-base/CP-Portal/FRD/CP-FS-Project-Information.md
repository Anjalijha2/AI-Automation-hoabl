# Feature-Spec: Project Information

**Portal:** Channel Partner Portal
**URLs:** `/project1/about`, `/project1/gallery`, `/project1/amenities`, `/project1/documents`, `/project1/keyPoints`, `/project1/videos`
**Created:** 2026-05-12
**Status:** Complete

---

## Feature 1: Browse Project Information

### 1.1 Objective

Provide CPs with access to all project marketing materials and information so they can support their sales conversations with accurate, up-to-date content.

### 1.2 Scope

Read-only section. Content is managed by the admin via Strapi CMS. CPs can browse and share project information links with prospective buyers.

### 1.3 Preconditions

- CP must be logged in

### 1.4 Project Information Sections

| Section | URL | Content |
|---------|-----|---------|
| Project Overview | `/project` | Top-level project introduction and navigation tabs |
| About the Project | `/project1/about` | Background, location, developer information |
| Gallery | `/project1/gallery` | Photos of the project, lifestyle imagery |
| Amenities | `/project1/amenities` | Full list of project amenities and features |
| Documents | `/project1/documents` | RERA registration, approvals, brochures |
| Key Points | `/project1/keyPoints` | Key selling points for sales conversations |
| Videos | `/project1/videos` | Virtual tours, walkthroughs, promotional videos |

### 1.5 Business Rules

1. All content is managed via Strapi CMS — CPs cannot edit any content from this portal
2. Documents section includes RERA registration documents (required for legal compliance)
3. Content is read-only for all CPs regardless of Master or Member status
4. Content is available to CPs at all times regardless of allocation campaign status

### 1.6 System Actions

1. CP navigates to a section → backend fetches content from Strapi CMS API
2. Content is displayed dynamically based on what the admin has published

---

## How to Use: Browsing Project Information

**Who does this:** Channel Partner, to prepare for or support customer sales conversations

---

**Step 1 — Navigate to Project Information**

From the navigation menu, click **Project** or **Project Information**. The project overview will load.

**Step 2 — Browse the sections**

Use the tabs to navigate between sections:

- **About** — Read the project background, developer details, and location advantages
- **Gallery** — View and share photos of the project
- **Amenities** — See the full list of features and facilities
- **Documents** — Access official documents including RERA registration (important for compliance conversations with customers)
- **Key Points** — Quick-reference selling points for your pitch
- **Videos** — Watch virtual tours and promotional videos to share with customers

**Step 3 — Share with customers**

You can share any section's link with a prospective buyer so they can explore the project themselves.

> **Note:** All content here is managed by the admin team. If you notice outdated or missing information, contact your manager to request a content update.
