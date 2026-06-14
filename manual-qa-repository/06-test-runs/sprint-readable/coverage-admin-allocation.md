# Coverage Report — Admin / Allocation - Master
Spec: tests/e2e/admin/allocation.spec.js

xlsx TCs: 112
Spec TC refs: 42
✓ Covered: 39
⚠ Orphan in spec (not in xlsx): 3
✗ Uncovered in xlsx (missing from spec): 73

Coverage: 34.8%

## ✓ Covered (39)
  - ADM_ALLOC_001
  - ADM_ALLOC_002
  - ADM_ALLOC_003
  - ADM_ALLOC_004
  - ADM_ALLOC_006
  - ADM_ALLOC_007
  - ADM_ALLOC_008
  - ADM_ALLOC_009
  - ADM_ALLOC_010
  - ADM_ALLOC_011
  - ADM_ALLOC_014
  - ADM_ALLOC_015
  - ADM_ALLOC_016
  - ADM_ALLOC_017
  - ADM_ALLOC_018
  - ADM_ALLOC_019
  - ADM_ALLOC_020
  - ADM_ALLOC_021
  - ADM_ALLOC_022
  - ADM_ALLOC_023
  - ADM_ALLOC_024
  - ADM_ALLOC_026
  - ADM_ALLOC_027
  - ADM_ALLOC_028
  - ADM_ALLOC_029
  - ADM_ALLOC_030
  - ADM_ALLOC_031
  - ADM_ALLOC_032
  - ADM_ALLOC_033
  - ADM_ALLOC_034
  - ADM_ALLOC_035
  - ADM_ALLOC_039
  - ADM_ALLOC_040
  - ADM_ALLOC_041
  - ADM_ALLOC_042
  - ADM_ALLOC_043
  - ADM_ALLOC_049
  - ADM_ALLOC_052
  - ADM_ALLOC_053

## ⚠ Orphan in Spec — not in xlsx (3)
  - ADM_ALLOC_005
  - ADM_ALLOC_050
  - ADM_ALLOC_051

## ✗ Uncovered TCs from xlsx — needs spec implementation (73)
  - TC_ALLOC_UI_001: Verify that both the page title 'Allocation' and the form section title 'New Allocation Campaign' ar
  - TC_ALLOC_UI_004: Verify that, after a project is picked, the campaign table renders all six header cells (no missing 
  - TC_ALLOC_UI_002: Verify that the Status filter, Type filter, and Refresh button are disabled until a project is selec
  - TC_ALLOC_UI_003: Verify that the campaign list shows a pagination footer with the total count and page size when popu
  - TC_ALLOC_FUNC_001: Verify that the Project filter dropdown opens and lists at least one selectable project.
  - TC_ALLOC_FUNC_002: Verify that after a project is picked the Status filter enables and lists all campaign lifecycle sta
  - TC_ALLOC_FUNC_003: Verify that after a project is picked the Type filter enables and lists the three campaign types.
  - TC_ALLOC_FUNC_004: Verify that searching a non-matching campaign name shows the 'No campaigns found' empty state.
  - TC_ALLOC_FUNC_005: Verify that clearing the search field via the x icon restores the full campaign list.
  - TC_ALLOC_FUNC_006: Verify that the create form Project dropdown opens and lists selectable projects.
  - TC_ALLOC_FUNC_007: Verify that the Campaign Name text field accepts typed input.
  - TC_ALLOC_FUNC_008: Verify that selecting Static in the Allocation Type dropdown sets the field to Static (UI only, no s
  - TC_ALLOC_FUNC_009: Verify that the optional Description/Notes textarea accepts text and shows a character counter.
  - TC_ALLOC_FUNC_010: Verify that the Start Time (IST) picker opens a calendar and accepts a future date/time.
  - TC_ALLOC_FUNC_011: Verify that the End Time (IST) picker is disabled until a Start Time is selected (chronology guard).
  - TC_ALLOC_FUNC_012: Verify that the Reset button clears the Campaign Name (and other entered values) on the create form.
  - ADM_ALLOC_012: Verify that a Dynamic-type campaign can be created (round-based) with status Upcoming.
  - ADM_ALLOC_013: Verify that a Physical Event campaign can be created and supports offline unit assignment.
  - TC_ALLOC_VAL_001: Verify that clicking Save Campaign with every field blank shows the four inline required-field error
  - TC_ALLOC_VAL_002: Verify the boundary of the 3-minute lead-time rule at exactly 3 minutes and just over.
  - TC_ALLOC_VAL_005: Verify that a campaign name already used for the same project is rejected (submit-time uniqueness).
  - TC_ALLOC_VAL_006: Verify the Description/Notes field enforces (or counts toward) the 255-character limit shown by the 
  - TC_ALLOC_FUNC_017: Verify that clicking 'View' on a campaign row navigates to /admin/allocation/campaigns/<id>.
  - TC_ALLOC_FUNC_013: Verify that a Static campaign detail page shows the Static heading, 3 KPI cards, and a Campaign Acti
  - TC_ALLOC_FUNC_014: Verify that a Physical Event campaign detail page shows the Physical heading and 6 KPI cards.
  - TC_ALLOC_FUNC_015: Verify that a Dynamic campaign detail page renders the 'Round-Wise Data' section (Dynamic-only).
  - TC_ALLOC_FUNC_016: Verify that the 'Back to Allocation Overview' button returns from a detail page to the campaign list
  - TC_ALLOC_DC_003: Verify the context-sensitive detail page: Static=3 KPIs/no Notify/no Rounds; Physical=6 KPIs+Notify+
  - TC_ALLOC_UI_005: Verify that the Stop modal's dismiss button reads 'Close' (not 'Cancel') and the confirm reads 'Yes,
  - TC_ALLOC_NEG_003: Verify that closing the Stop modal performs no server action and dispatches no notification.
  - TC_ALLOC_FUNC_019: Verify that confirming Stop does not flip the status synchronously (async Python callback).
  - TC_ALLOC_NEG_004: Verify that stopping a campaign dispatches no SMS/WhatsApp/email to buyers (silent by design).
  - TC_ALLOC_INT_002: Verify that after a campaign Stops, unpaid registrations revert to Waitlisted and paid ones stay Con
  - TC_ALLOC_NEG_005: Verify that closing the Cancel modal performs no server action.
  - TC_ALLOC_NEG_006: Verify that cancelling an Upcoming campaign dispatches no buyer notification.
  - TC_ALLOC_DC_001: Verify the context-sensitive Actions cell: Active=View+Stop; Upcoming=View+Cancel; Completed/Stopped
  - ADM_ALLOC_S_001: Verify that clicking Notify Registrants on a Physical Event campaign detail opens the confirmation m
  - TC_ALLOC_FUNC_018: Verify that the Notify Registrants button appears on Physical Event campaign details (and is absent 
  - TC_ALLOC_DC_004: Verify the routing negative: a Static campaign detail does NOT expose Notify Registrants.
  - TC_ALLOC_NEG_008: Verify that dismissing the Notify modal via Cancel sends no SMS/WhatsApp and generates no QR codes.
  - ADM_ALLOC_FSD_037: Verify that the Notify QR/SMS/WhatsApp dispatch is scoped to PHYSICAL_EVENT campaigns only.
  - TC_ALLOC_FUNC_020: Verify that the 'Download Bookings' button is present on campaign detail pages (all types) and trigg
  - TC_ALLOC_FUNC_021: Verify that 'Download Pending' appears only on Physical Event details (not on Static).
  - TC_ALLOC_DC_005: Verify the context-sensitive download set: Static=Download Bookings only; Physical Event=Bookings + 
  - TC_ALLOC_NEG_007: Verify the documented backend gap that a campaign cannot leave a visible Failed row.
  - ADM_ALLOC_025: Verify behaviour when a campaign runs with no Active tower configured (Config prerequisite).
  - TC_ALLOC_NEG_002: Verify that creating a campaign and its auto-activation dispatch no buyer notification (silent by de
  - ADM_ALLOC_FSD_036: Verify the FSD-corrected rule that an active campaign blocks cancel/swap/assign/refund/parking from 
  - ADM_ALLOC_044: Verify that the Cancel Unit action in Customers is blocked while a campaign is active.
  - ADM_ALLOC_045: Verify that Unit Swap in Customers is blocked while a campaign is active.
  - ADM_ALLOC_046: Verify that Update Parking in Customers is blocked while a campaign is active.
  - ADM_ALLOC_047: Verify that single refund (Cancel Registration) in Customers is blocked while a campaign is active.
  - ADM_ALLOC_048: Verify that bulk-cancel via Config Section 5 is blocked while a campaign is active.
  - TC_ALLOC_INT_001: Verify that the detail-page KPI cards reflect the campaign's uploaded and booked counts (integration
  - TC_ALLOC_INT_005: Verify that the Allocation page sidebar exposes navigation to the other admin modules.
  - TC_ALLOC_API_001: Verify that omitting projectId on campaign create silently defaults to the env project (1 prod / 2 U
  - TC_ALLOC_API_002: Verify that Dynamic create accepts allotmentExcel and enforces the 20-registration-per-unit hard cap
  - TC_ALLOC_API_003: Verify that a Physical Event create without commonPoolExcel is rejected with HTTP 400.
  - TC_ALLOC_API_004: Verify that a failed campaign-create Excel validation returns HTTP 400 with an XLSX binary attachmen
  - TC_ALLOC_API_005: Verify that the rounds endpoint returns a paginated rounds list for a Dynamic campaign.
  - TC_ALLOC_API_006: Verify that the campaign Status filter has no 'Approved' option and clarify that 'Approved' is a buy
  - TC_ALLOC_API_007: Verify the documented behaviour that creating a new campaign forces past-window non-terminal campaig
  - TC_ALLOC_API_008: Verify that Stop and Cancel route through a single updateAllocationCampaign PUT with an 'action' fie
  - TC_ALLOC_API_009: Verify that the notify endpoint triggers Kaleyra notifications to Physical Event registrants.
  - TC_ALLOC_API_010: Verify that the allotments export endpoint streams all campaign allotments as Excel.
  - TC_ALLOC_API_011: Verify that the cron allocation-operations endpoint processes auto-transitions Upcoming->Active->Com
  - TC_ALLOC_API_012: Verify that within 2 minutes before a scheduled campaign start, Customers mutations are blocked even
  - TC_ALLOC_API_013: Document the broken ownership check on cancelUserAllocation; this case is informational and must not
  - TC_ALLOC_SEC_001: Verify that hitting /admin/allocation with no active session redirects to the login page.
  - TC_ALLOC_SEC_002: Verify that an Allocation API call with an invalid or expired bearer token is rejected.
  - ADM_ALLOC_FSD_038: Verify that the Sales Manager Admin role cannot access the admin allocation endpoints (admin-only).
  - TC_ALLOC_NEG_001: Verify that before a project is selected the campaign list shows the guidance empty state.
  - TC_ALLOC_NEG_009: Verify how the campaign list behaves on a server 500 or network failure.
