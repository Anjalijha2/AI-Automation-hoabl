# FSD — Buyer Portal: Project Information
**Source-verified:** 2026-05-24
**Backend path:** source-code/backend/src/
**Verified by:** Tech Lead Agent

---

## 1. Module Overview

The Project Information module surfaces real-estate project metadata that a Buyer can view in the portal. Two data planes feed this module:

- **Relational DB (Sequelize `Project` model)** — authoritative project master record persisted in the `projects` table. Used by every controller that needs project context (registration validation, prefix lookup, MahaRERA number). // Source: models/project.model.js:11-281
- **Strapi CMS** — content-only data fetched via a single REST call (`GET /api/projects/1?populate=deep`). Provides the marketing-tier apartment-configuration master (apartment types, carpet-area variants, registration fees, discounts). // Source: services/strapi.service.js:115-132

There is **no dedicated `GET /project` or `GET /project-info` endpoint exposed to the Buyer** in the user-route surface examined. The buyer-facing project-info is derived in-line when other endpoints execute (e.g., `getDynamicTemplateData` returns `mahaReraNumber`, `tower`, `floor`, `typology`, `unitNo` for the buyer's selected unit). // Source: controllers/allocation.controller.js:233-512

Strapi data is consumed server-side only — inside `getStrapi` of registration-controller — to validate that the apartment type/carpet-area combo a buyer submits during EOI exists in the CMS master. // Source: controllers/registration.controller.js:1088-1147

---

## 2. Data Model

### Project (table: `projects`)
Defined in `models/project.model.js:29-272`. Salient buyer-relevant fields:

| Field | Type | DB Column | Note |
|-------|------|-----------|------|
| `id` | BIGINT UNSIGNED PK | `id` | // Source: models/project.model.js:31-35 |
| `name` | STRING(100) NOT NULL | `name` | Project name displayed everywhere // Source: models/project.model.js:36-44 |
| `mahareraNumber` | STRING | `maharera_number` | Surfaced in cost-sheet as `mahaReraNumber` // Source: models/project.model.js:45-50 |
| `tickerClock` | INTEGER | `ticker_clock` | Drives EOI countdown via `getTickerClock` // Source: models/project.model.js:51-56 |
| `noOfUnits` | DECIMAL(15,2) | `no_of_units` | // Source: models/project.model.js:70-74 |
| `licenceNumber` | STRING(255) | `licence_number` | // Source: models/project.model.js:75-79 |
| `developerName` | STRING(255) | `developer_name` | // Source: models/project.model.js:80-84 |
| `footerText` | TEXT | `footer_text` | // Source: models/project.model.js:85-89 |
| `projectCode` | STRING(255) | `project_code` | // Source: models/project.model.js:95-99 |
| `projectDescription` | STRING(255) | `project_description` | // Source: models/project.model.js:100-104 |
| `launchStartDate` | DATE | `launch_start_date` | // Source: models/project.model.js:105-109 |
| `launchEndDate` | DATE | `launch_end_date` | // Source: models/project.model.js:110-114 |
| `constructionStatus` | STRING(255) | `construction_status` | // Source: models/project.model.js:124-128 |
| `projectAddress` | TEXT | `project_address` | // Source: models/project.model.js:134-138 |
| `projectAmenities` | TEXT | `project_amenities` | Free-text amenities list // Source: models/project.model.js:139-143 |
| `noOfTowers` | DECIMAL(15,2) | `no_of_towers` | // Source: models/project.model.js:173-177 |
| `projectLogoUrl` | STRING(255) | `project_logo_url` | // Source: models/project.model.js:178-182 |
| `projectImage` | STRING(255) | `project_image` | Single image URL — no gallery array in DB // Source: models/project.model.js:183-187 |
| `eoiTermsAndConditions` | STRING(255) | `eoi_terms_and_conditions` | // Source: models/project.model.js:188-192 |
| `termsAndConditions` | STRING(255) | `terms_and_conditions` | // Source: models/project.model.js:153-157 |
| `projectCategory` | TEXT | `project_category` | // Source: models/project.model.js:198-202 |
| `projectStatus` | STRING(255) | `project_status` | // Source: models/project.model.js:213-217 |
| `projectType` | STRING(255) | `project_type` | // Source: models/project.model.js:229-233 |
| `region` | STRING(255) | `region` | // Source: models/project.model.js:234-237 |
| `registrationNumberPrefix` | STRING(50) NOT NULL | `registration_number_prefix` | Used to build per-registration numbers // Source: models/project.model.js:243-247 |
| `registrationStartNumber` | BIGINT UNSIGNED NOT NULL | `registration_start_number` | Default `1000000001` // Source: models/project.model.js:248-253 |
| `isActive` | BOOLEAN | `is_active` | Default `true` // Source: models/project.model.js:263-267 |

- `paranoid: true`, `underscored: true`, soft-delete via `deleted_at`. // Source: models/project.model.js:273-280
- No Sequelize associations declared on Project (towers/units link via FK on the child side). // Source: models/project.model.js:17-19

### Tower (table: `towers`)
Defined in `models/tower.model.js:11-49` with associations: `Tower.belongsTo(Project)`, `Tower.hasMany(Unit)`, `Tower.hasMany(Floor)`, `Tower.hasMany(TowerUnitDetail)`. // Source: models/tower.model.js:17-41

Tower image/gallery, brochure, amenities — **no dedicated columns surfaced in `Project` or `Tower` models for image gallery, brochure URL, project specifications, or amenities array.** Strapi CMS appears to be the implied source of these but the only Strapi consumer in code uses it for apartment-config validation. // Source: NOT FOUND — verify manually

### Strapi CMS shape (observed access path)
The single call `getStrapiDetails` returns a payload navigated as:
- `data.attributes.steps_masters.data[0].attributes.projectForm[…].project_confs.data[…].attributes.projectNameConf` (apartment type)
- `data.attributes.steps_masters.data[0].attributes.projectForm[…].project_confs.data[…].attributes.carpetArea[0].value`
- `…carpetArea[0].registrationFees`
- `…carpetArea[0].discountRegistrationFees` // Source: controllers/registration.controller.js:1092-1102

No code reference to `amenities`, `gallery`, `specifications`, or `brochure` keys inside the Strapi payload. // Source: NOT FOUND — verify manually

---

## 3. State Machines

No project-level state machine exists. `Project.projectStatus` and `Project.isActive` are stored as free-string/boolean with no transition guards in code. // Source: models/project.model.js:213-217, 263-267

`Project.isActive=false` is not checked anywhere on the buyer registration path examined (registration lookup is by `projectId` only, with no `isActive` filter). // Source: controllers/registration.controller.js:1170-1183, 2337-2346

---

## 4. Business Rules

1. **Hard-coded project resolution.** Buyer endpoints derive `projectId` from `NODE_ENV`:
   `const projectId = app.production ? 1 : 2;` — i.e., Project ID `1` in production, Project ID `2` in non-production. There is no multi-project selection UI on the buyer side. // Source: controllers/registration.controller.js:1170, 2337
2. **Registration number generation.** Requires `project.registrationNumberPrefix` and `project.registrationStartNumber`; if either is missing, EOI submission returns HTTP 400 `Invalid project`. // Source: controllers/registration.controller.js:1213-1218
3. **Strapi apartment-config validation.** During `submitEoi`/preview pricing, if the buyer-submitted `apartmentType` is not present in the Strapi master list, `getStrapi` returns `success: false, status: 400, message: 'Invalid Apartment Type'`. // Source: controllers/registration.controller.js:1123-1137
4. **MahaRERA exposure.** `mahareraNumber` is included in the cost-sheet/dynamic template returned for a unit. // Source: controllers/allocation.controller.js:306, 502
5. **Strapi failures are soft.** On Strapi exception, `getStrapi` returns `INTERNAL_SERVER_ERROR (500)` and the calling EOI flow surfaces this to the caller. // Source: controllers/registration.controller.js:1140-1146
6. **Strapi token guard.** Server logs a warning at boot if `apiConfig.strapi.token` is unset; no hard failure. // Source: services/strapi.service.js:11-15

---

## 5. Notification Dispatch

No notifications (email/SMS/WhatsApp) are dispatched in either `strapi.service.js` or by any project-info read path. Communication service is not imported by `registration.controller.js` for the `getStrapi` or `getRegistration` paths examined. // Source: NOT FOUND — verify manually (no matches for `communicationService|sendEmail|sendSms|sendWhatsapp` in controllers/milestone-payment.controller.js; identical absence in the project-info read flows)

---

## 6. API Endpoints

### Buyer-accessible endpoints touching project data
All routes mounted under `/api/users` per `routes/user.routes.js`. Protected by `protect` + `restrictTo('user')` middleware. // Source: routes/user.routes.js:47-49

| Method | Path | Handler | Project data returned |
|--------|------|---------|----------------------|
| GET | `/api/users/registration` | `getRegistration` | Returns registration + units for buyer's hard-coded project. No raw project fields. // Source: routes/user.routes.js:53; controllers/registration.controller.js:2328-2446 |
| GET | `/api/users/registration-count` | `getTickerClock` | Reads `Project.tickerClock` (see Section 4 for project resolution rule). // Source: routes/user.routes.js:78 |
| GET | `/api/users/user-unit-details` | `getMilestoneUnitDetails` | Calls `getDynamicTemplateData` which fetches `Project { id, projectId, mahareraNumber }`. // Source: routes/user.routes.js:71; controllers/allocation.controller.js:306 |
| GET | `/api/users/allocation/unit-details` | `getDynamicTemplateData` | Returns `mahaReraNumber`, `tower`, `floor`, `unitNumber`, `typology`, `CarpetAreaSqFt`. // Source: routes/user/allocation.routes.js:45; controllers/allocation.controller.js:233-512 |

### Strapi outbound call (server-internal)
| Method | URL | Caller |
|--------|-----|--------|
| GET | `<STRAPI_BASE_URL>/api/projects/1?populate=deep` | `strapiService.getStrapiDetails` — invoked from `getStrapi` in `registration.controller.js:1090` // Source: services/strapi.service.js:117 |

Headers: `Authorization: Bearer <config.token>`, `x-api-version: 1.0`. // Source: services/strapi.service.js:22-25, 111-113

### Endpoints NOT found
- `GET /project`, `GET /project-info`, `GET /project-details`, `GET /amenities`, `GET /gallery`, `GET /specifications`, `GET /brochure`: **no such buyer routes** in the inspected route tree. // Source: NOT FOUND — verify manually (full grep of `routes/user.routes.js`, `routes/user/*.js` shows none)

---

## 7. Known Bugs / Gaps

1. **Single-project hard-coding.** `projectId = app.production ? 1 : 2` prevents the buyer portal from ever serving more than one project per environment. // Source: controllers/registration.controller.js:1170, 2337
2. **`Project.isActive` is ignored.** No buyer-facing endpoint filters by `isActive=true`; a soft-disabled project would still serve content. // Source: NOT FOUND — verify manually (no `isActive` filter found in user registration lookups)
3. **No buyer endpoint for amenities / gallery / brochure.** The DB schema has `projectAmenities` (TEXT), `projectImage` (single STRING), `projectLogoUrl` — but no API exposes these to the buyer client. Strapi consumer extracts only apartment config. // Source: controllers/registration.controller.js:1088-1147; routes/user.routes.js (no relevant route)
4. **Strapi path is fragile.** Deep-path access `data.attributes.steps_masters.data[0].attributes.projectForm.filter(... project_confs)[0].project_confs.data` will throw on any CMS schema drift; only `.filter(...)[0]` is guarded by truthy filter, not by length check. // Source: controllers/registration.controller.js:1092-1094
5. **`getStrapiDetails` ignores its `data` argument.** Function accepts `data` parameter, never uses it. // Source: services/strapi.service.js:115-132
6. **Outbound Strapi response log mis-tags non-LeadSquared responses with the same suppressed body branch** — both branches in the response interceptor are identical, dead-code guard around `/LeadManagement\.svc/Leads\.GetById/i`. // Source: services/strapi.service.js:68-83
7. **`Project.maxPreferencesPerUnit` default = 0**: silently disables preferences if not set per project. // Source: models/project.model.js:63-69

---

## 8. QA Risk Areas

1. **Strapi outage → EOI block.** Take Strapi down (or revoke its token); confirm `submitEoi` returns 500 with `internal server error` and that the buyer cannot proceed past apartment-type selection. // Source: controllers/registration.controller.js:1140-1146
2. **Apartment type drift.** Add an apartment type in admin/portal-DB that does not exist in Strapi CMS; submit EOI for it → expect HTTP 400 `Invalid Apartment Type`. // Source: controllers/registration.controller.js:1135-1137
3. **Environment-specific project ID.** Verify behavior on UAT (`projectId=2`) vs prod (`projectId=1`) — any test fixture seeding only project 1 will hide regressions on UAT. // Source: controllers/registration.controller.js:1170, 2337
4. **Missing project prefix.** Seed a Project row with `registrationNumberPrefix=NULL` → confirm `submitEoi` rejects with 400 `Invalid project`. // Source: controllers/registration.controller.js:1216-1218
5. **MahaRERA presence.** Cost-sheet rendering depends on `Project.mahareraNumber`; null value flows through unchecked to the dynamic template. // Source: controllers/allocation.controller.js:306, 502
6. **Soft-deleted project.** Since Project is paranoid, querying via `Project.findOne({ where: { id } })` excludes soft-deleted records — verify behavior if production project is accidentally soft-deleted. // Source: models/project.model.js:279
7. **Ticker clock.** `Project.tickerClock` INTEGER — boundary tests: null, 0, very large value. // Source: models/project.model.js:51-56
8. **Strapi `populate=deep` payload size.** Large CMS payloads can blow Axios timeout (`config.timeout`); add load/latency test. // Source: services/strapi.service.js:19-25, 117
9. **No gallery API → user manual mismatch.** If user-manual mentions amenities/gallery/brochure features, they likely live in Strapi but are **not** plumbed through the backend — UI may call Strapi directly. Verify with frontend team. // Source: NOT FOUND — verify manually
