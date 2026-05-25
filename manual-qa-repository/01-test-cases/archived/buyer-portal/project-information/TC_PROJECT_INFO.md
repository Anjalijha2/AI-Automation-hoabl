# Test Cases — Project Information
**Portal:** Buyer Portal
**Module:** Project Information
**BRD Reference:** BUYER-FS-Project-Information.md
**Total TCs:** 8

---

## UI Tests

### TC_PROJ_UI_001 — Project page loads with section tabs

| Field | Value |
|-------|-------|
| **Sub Module** | Project Hub |
| **Scenario** | Verify project page loads with navigation tabs |
| **Precondition** | Buyer logged in |
| **Test Steps** | 1. Navigate to https://uat.xrportal.in/project<br>2. Wait for content |
| **Test Data** | Logged-in buyer |
| **Expected Result** | TopBarProject visible; Overview / Towers / Gallery / Documents / Videos tabs render |

### TC_PROJ_UI_002 — Gallery section displays images

| Field | Value |
|-------|-------|
| **Sub Module** | Gallery |
| **Scenario** | Gallery loads images from Strapi |
| **Precondition** | Gallery content published in Strapi |
| **Test Steps** | 1. Click Gallery tab<br>2. Wait for images |
| **Test Data** | N/A |
| **Expected Result** | Photo grid displays project imagery |

## Functional Positive Tests

### TC_PROJ_FUNC_001 — Documents section lists RERA

| Field | Value |
|-------|-------|
| **Sub Module** | Documents |
| **Scenario** | Verify RERA registration document available |
| **Precondition** | Document content published |
| **Test Steps** | 1. Click Documents tab<br>2. Locate RERA file |
| **Test Data** | N/A |
| **Expected Result** | RERA registration link/file shown; downloadable |

### TC_PROJ_FUNC_002 — Tower specifications section renders

| Field | Value |
|-------|-------|
| **Sub Module** | Towers |
| **Scenario** | TowerSection and TowerTabs load |
| **Precondition** | On Project page |
| **Test Steps** | 1. Click Towers tab<br>2. Inspect tower list |
| **Test Data** | N/A |
| **Expected Result** | Tower-wise specs shown with TowerTabs navigation |

### TC_PROJ_FUNC_003 — Videos section plays videos

| Field | Value |
|-------|-------|
| **Sub Module** | Videos |
| **Scenario** | Verify video playback works |
| **Precondition** | Video content published |
| **Test Steps** | 1. Click Videos tab<br>2. Play a video |
| **Test Data** | N/A |
| **Expected Result** | Video plays in browser |

## Functional Negative Tests

### TC_PROJ_NEG_001 — Project page not accessible without login

| Field | Value |
|-------|-------|
| **Sub Module** | Auth Gate |
| **Scenario** | Unauthenticated access blocked |
| **Precondition** | No session |
| **Test Steps** | 1. Clear session<br>2. Navigate to /project |
| **Test Data** | None |
| **Expected Result** | Redirect to login |

## Edge Cases

### TC_PROJ_EDGE_001 — Empty section graceful

| Field | Value |
|-------|-------|
| **Sub Module** | Empty State |
| **Scenario** | Section with no Strapi content shows graceful message |
| **Precondition** | Admin has not published one section |
| **Test Steps** | 1. Open the empty section tab |
| **Test Data** | Empty section |
| **Expected Result** | Empty state shown; no error |

## API Tests

### TC_PROJ_API_001 — Project content fetch endpoint

| Field | Value |
|-------|-------|
| **Sub Module** | API |
| **Scenario** | Project content endpoint returns Strapi data |
| **Precondition** | Valid JWT |
| **Test Steps** | 1. GET project content endpoint<br>2. Inspect response |
| **Test Data** | JWT |
| **Expected Result** | 200 OK; sections include gallery/documents/videos arrays |

## DB Tests

### TC_PROJ_DB_001 — No write occurs from buyer

| Field | Value |
|-------|-------|
| **Sub Module** | Read-only |
| **Scenario** | Confirm buyer access does not insert/modify project content |
| **Precondition** | Project page browsed by buyer |
| **Test Steps** | 1. Browse all tabs<br>2. Compare project content DB before/after |
| **Test Data** | Logged-in buyer |
| **Expected Result** | No DB changes; content is purely read |
