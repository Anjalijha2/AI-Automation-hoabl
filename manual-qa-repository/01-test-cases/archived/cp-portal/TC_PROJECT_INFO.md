# Test Cases — Project Information (CP)
**Portal:** Channel Partner Portal
**Module:** Project Information
**BRD Reference:** CP-FS-Project-Information.md
**Total TCs:** 8

---

## UI Tests

### TC_CPPROJ_UI_001 — Project Information page loads

| Field | Value |
|-------|-------|
| **Sub Module** | Project Hub |
| **Scenario** | Verify project hub loads |
| **Precondition** | CP logged in |
| **Test Steps** | 1. Navigate to /project<br>2. Wait for content |
| **Test Data** | Logged-in CP |
| **Expected Result** | Top overview loads; tab navigation visible |

### TC_CPPROJ_UI_002 — All 6 sections accessible via tabs

| Field | Value |
|-------|-------|
| **Sub Module** | Tabs |
| **Scenario** | About / Gallery / Amenities / Documents / Key Points / Videos |
| **Precondition** | On project page |
| **Test Steps** | 1. Click each tab in sequence |
| **Test Data** | N/A |
| **Expected Result** | Each tab loads its content from Strapi |

## Functional Positive Tests

### TC_CPPROJ_FUNC_001 — Documents section shows RERA

| Field | Value |
|-------|-------|
| **Sub Module** | Documents |
| **Scenario** | RERA registration available |
| **Precondition** | RERA published in Strapi |
| **Test Steps** | 1. Click Documents<br>2. Locate RERA file |
| **Test Data** | N/A |
| **Expected Result** | RERA file downloadable |

### TC_CPPROJ_FUNC_002 — Amenities lists project features

| Field | Value |
|-------|-------|
| **Sub Module** | Amenities |
| **Scenario** | Amenities section renders feature list |
| **Precondition** | Amenities published |
| **Test Steps** | 1. Click Amenities tab |
| **Test Data** | N/A |
| **Expected Result** | Full amenity list displayed |

### TC_CPPROJ_FUNC_003 — Key Points section renders sales bullets

| Field | Value |
|-------|-------|
| **Sub Module** | Key Points |
| **Scenario** | Key selling points list visible |
| **Precondition** | Key points published |
| **Test Steps** | 1. Click Key Points tab |
| **Test Data** | N/A |
| **Expected Result** | List of key points displayed for sales reference |

## Functional Negative Tests

### TC_CPPROJ_NEG_001 — Unauth user blocked

| Field | Value |
|-------|-------|
| **Sub Module** | Auth Gate |
| **Scenario** | Without login, page redirects |
| **Precondition** | No session |
| **Test Steps** | 1. Open /project1/about without login |
| **Test Data** | None |
| **Expected Result** | Redirect to CP login |

## Edge Cases

### TC_CPPROJ_EDGE_001 — Empty Videos section graceful

| Field | Value |
|-------|-------|
| **Sub Module** | Empty State |
| **Scenario** | Videos section with no content |
| **Precondition** | No videos published |
| **Test Steps** | 1. Click Videos tab |
| **Test Data** | Empty section |
| **Expected Result** | Empty state shown; no crash |

## API Tests

### TC_CPPROJ_API_001 — Project content endpoint

| Field | Value |
|-------|-------|
| **Sub Module** | API |
| **Scenario** | API returns Strapi content |
| **Precondition** | Valid JWT |
| **Test Steps** | 1. GET project content endpoint |
| **Test Data** | JWT |
| **Expected Result** | 200 OK; sections returned |

## DB Tests

### TC_CPPROJ_DB_001 — Read-only — no DB writes from view

| Field | Value |
|-------|-------|
| **Sub Module** | Read-Only |
| **Scenario** | Confirm browsing does not modify CMS data |
| **Precondition** | CP browses sections |
| **Test Steps** | 1. Check DB before<br>2. Browse all tabs<br>3. Check DB after |
| **Test Data** | N/A |
| **Expected Result** | No DB writes |
