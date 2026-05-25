# Test Cases — Project Information
**Portal:** Channel Partner Portal
**BRD Reference:** CP-BRD-CP-Portal.md / CP-FS-Project-Information.md

---

## Navigation and Access

### CP_PROJ_001 — Open Project Information from main nav

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | CP logged in |
| **Test Steps** | 1. Click **Project** in the navigation menu |
| **Expected Result** | URL updates to `/project`; project overview page renders with section tabs |
| **Priority** | High |

---

### CP_PROJ_002 — Section tabs are visible

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Project overview open |
| **Test Steps** | 1. Inspect tab bar |
| **Expected Result** | Tabs displayed: About, Gallery, Amenities, Documents, Key Points, Videos |
| **Priority** | High |

---

### CP_PROJ_003 — Direct URL `/project1/about` loads About page

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | CP session active |
| **Test Steps** | 1. Navigate to `https://uat.xrportal.in/project1/about` |
| **Expected Result** | About page loads with project background, location, developer info |
| **Priority** | Critical |

---

### CP_PROJ_004 — Direct URL `/project1/gallery` loads Gallery

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | CP session active |
| **Test Steps** | 1. Navigate to `/project1/gallery` |
| **Expected Result** | Gallery page loads with project photos |
| **Priority** | High |

---

### CP_PROJ_005 — Direct URL `/project1/amenities` loads Amenities

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | CP session active |
| **Test Steps** | 1. Navigate to `/project1/amenities` |
| **Expected Result** | Amenities list renders with feature names and possible icons |
| **Priority** | High |

---

### CP_PROJ_006 — Direct URL `/project1/documents` loads Documents

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | CP session active |
| **Test Steps** | 1. Navigate to `/project1/documents` |
| **Expected Result** | Documents page shows RERA, approvals, brochures with download links |
| **Priority** | Critical |

---

### CP_PROJ_007 — Direct URL `/project1/keyPoints` loads Key Points

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | CP session active |
| **Test Steps** | 1. Navigate to `/project1/keyPoints` |
| **Expected Result** | Key selling points list renders |
| **Priority** | Medium |

---

### CP_PROJ_008 — Direct URL `/project1/videos` loads Videos

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | CP session active |
| **Test Steps** | 1. Navigate to `/project1/videos` |
| **Expected Result** | Video gallery renders with embedded players or thumbnails |
| **Priority** | High |

---

### CP_PROJ_009 — Logged-out user redirected from project pages

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | No session |
| **Test Steps** | 1. Open `/project1/about` directly in a fresh browser |
| **Expected Result** | Redirect to `/login` |
| **Priority** | High |

---

## About Section

### CP_PROJ_010 — About displays project background text

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | About page open |
| **Test Steps** | 1. Scroll through About content |
| **Expected Result** | Paragraphs describing project background, location, and developer are visible |
| **Priority** | High |

---

### CP_PROJ_011 — About is read-only — no edit controls present

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | About page open |
| **Test Steps** | 1. Inspect page for Edit / Save / Delete actions |
| **Expected Result** | No edit controls; content is read-only |
| **Priority** | Critical |

---

## Gallery

### CP_PROJ_012 — Gallery loads project photos in grid

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Gallery page open |
| **Test Steps** | 1. Scroll Gallery grid |
| **Expected Result** | Photos render in a grid layout; images load without 404s |
| **Priority** | High |

---

### CP_PROJ_013 — Click a photo opens larger view

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Gallery has at least one image |
| **Test Steps** | 1. Click any thumbnail |
| **Expected Result** | Lightbox / modal opens displaying the full-size image with close control |
| **Priority** | Medium |

---

### CP_PROJ_014 — Empty Gallery shows placeholder

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Strapi returns no images |
| **Test Steps** | 1. Open Gallery |
| **Expected Result** | Empty-state message such as "No photos available yet" is displayed |
| **Priority** | Low |

---

## Amenities

### CP_PROJ_015 — Amenities list renders with names

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Amenities page open |
| **Test Steps** | 1. Read items in the amenities list |
| **Expected Result** | Amenity names displayed; categories or icons present per Strapi configuration |
| **Priority** | High |

---

### CP_PROJ_016 — Amenities content is read-only

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Amenities open |
| **Test Steps** | 1. Look for any input or edit action |
| **Expected Result** | No editable controls available |
| **Priority** | Medium |

---

## Documents

### CP_PROJ_017 — RERA document is listed

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Documents page open |
| **Test Steps** | 1. Scan the document list |
| **Expected Result** | At least one entry labelled RERA Registration is present |
| **Priority** | Critical |

---

### CP_PROJ_018 — Download a document

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Documents page lists items |
| **Test Steps** | 1. Click Download on a document |
| **Expected Result** | Browser initiates download or opens the document in a new tab |
| **Priority** | High |

---

### CP_PROJ_019 — Documents are read-only — no upload control

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Documents page open |
| **Test Steps** | 1. Look for any Upload / Delete control |
| **Expected Result** | No upload/edit controls visible — content fully read-only |
| **Priority** | Critical |

---

## Key Points

### CP_PROJ_020 — Key Points list is displayed

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Key Points page open |
| **Test Steps** | 1. Scroll list |
| **Expected Result** | Bullet/numbered list of key selling points renders as content |
| **Priority** | High |

---

### CP_PROJ_021 — Key Points are read-only

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Key Points page open |
| **Test Steps** | 1. Look for Edit/Add controls |
| **Expected Result** | No edit controls present |
| **Priority** | Medium |

---

## Videos

### CP_PROJ_022 — Videos page lists video thumbnails

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Videos page open |
| **Test Steps** | 1. Scroll list of videos |
| **Expected Result** | Video thumbnails or embeds render |
| **Priority** | High |

---

### CP_PROJ_023 — Click a video plays it inline

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Video page has at least one item |
| **Test Steps** | 1. Click a video<br>2. Click play |
| **Expected Result** | Video plays inline using the embedded player; controls work |
| **Priority** | Medium |

---

## Sharing and Content Source

### CP_PROJ_024 — Copy / share section link

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Any project subpage open |
| **Test Steps** | 1. Copy the URL from the address bar<br>2. Paste into a new tab while logged in |
| **Expected Result** | Same section page loads from the copied URL |
| **Priority** | Medium |

---

### CP_PROJ_025 — Content reflects latest Strapi publish

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Admin has published an update in Strapi CMS |
| **Test Steps** | 1. Open the affected section in CP portal<br>2. Hard refresh |
| **Expected Result** | Updated content is visible reflecting the latest Strapi publish |
| **Priority** | High |

---

### CP_PROJ_026 — All sections accessible regardless of allocation campaign state

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | Allocation campaign is closed for the project |
| **Test Steps** | 1. Open each project section |
| **Expected Result** | All sections remain accessible to CPs regardless of campaign status |
| **Priority** | Medium |

---

### CP_PROJ_027 — Master CP and Member CP have identical access

| Field | Value |
|-------|-------|
| **Module** | CP – Project Info |
| **Pre-conditions** | One Master CP and one Member CP account |
| **Test Steps** | 1. Login as Master CP, open each section<br>2. Login as Member CP, open each section |
| **Expected Result** | Both roles see identical project content with no edit controls |
| **Priority** | Medium |

---
