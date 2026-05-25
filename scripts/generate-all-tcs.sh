#!/usr/bin/env bash
# Generates TC skeletons for buyer / cp / sm portals.
# Each invocation reads a feature-spec doc and writes TC_<MODULE>.md under
# manual-qa-repository/01-test-cases/<portal>-portal/<module>/.

set -e

N="node scripts/generate-tc-skeleton.js"

# ── Buyer Portal (11 modules) ──────────────────────────────────────────────
$N --portal=buyer --module=registration-login        --prefix=REGLOGIN  --title="Registration & Login" \
   --url=https://uat.xrportal.in/                    --fs=.claude/docs/hoabl-knowledge-base/Buyer-Portal/FRD/BUYER-FS-Registration-and-Login.md
$N --portal=buyer --module=home-dashboard            --prefix=HOME      --title="Home Dashboard" \
   --url=https://uat.xrportal.in/home                --fs=.claude/docs/hoabl-knowledge-base/Buyer-Portal/FRD/BUYER-FS-Home-Dashboard.md
$N --portal=buyer --module=unit-details              --prefix=UNIT      --title="Unit Details" \
   --url=https://uat.xrportal.in/unit                --fs=.claude/docs/hoabl-knowledge-base/Buyer-Portal/FRD/BUYER-FS-Unit-Details.md
$N --portal=buyer --module=allocation-experience     --prefix=ALLOC     --title="Allocation Experience" \
   --url=https://uat.xrportal.in/allocation          --fs=.claude/docs/hoabl-knowledge-base/Buyer-Portal/FRD/BUYER-FS-Allocation-Experience.md
$N --portal=buyer --module=payment-schedule          --prefix=PAYSCH    --title="Payment Schedule" \
   --url=https://uat.xrportal.in/payment             --fs=.claude/docs/hoabl-knowledge-base/Buyer-Portal/FRD/BUYER-FS-Payment-Schedule.md
$N --portal=buyer --module=home-loan                 --prefix=LOAN      --title="Home Loan" \
   --url=https://uat.xrportal.in/home-loan           --fs=.claude/docs/hoabl-knowledge-base/Buyer-Portal/FRD/BUYER-FS-Home-Loan.md
$N --portal=buyer --module=kyc                       --prefix=KYC       --title="KYC" \
   --url=https://uat.xrportal.in/kyc                 --fs=.claude/docs/hoabl-knowledge-base/Buyer-Portal/FRD/BUYER-FS-KYC.md
$N --portal=buyer --module=support-tickets           --prefix=SUPPORT   --title="Support Tickets" \
   --url=https://uat.xrportal.in/support             --fs=.claude/docs/hoabl-knowledge-base/Buyer-Portal/FRD/BUYER-FS-Support-Tickets.md
$N --portal=buyer --module=callback-request          --prefix=CALLBACK  --title="Callback Request" \
   --url=https://uat.xrportal.in/callback            --fs=.claude/docs/hoabl-knowledge-base/Buyer-Portal/FRD/BUYER-FS-Callback-Request.md
$N --portal=buyer --module=project-information       --prefix=PROJINFO  --title="Project Information" \
   --url=https://uat.xrportal.in/project             --fs=.claude/docs/hoabl-knowledge-base/Buyer-Portal/FRD/BUYER-FS-Project-Information.md
$N --portal=buyer --module=work-progress             --prefix=WORKPROG  --title="Work Progress" \
   --url=https://uat.xrportal.in/work-progress       --fs=.claude/docs/hoabl-knowledge-base/Buyer-Portal/FRD/BUYER-FS-Work-Progress.md

# ── CP Portal (6 modules) ──────────────────────────────────────────────────
$N --portal=cp --module=login                        --prefix=CPLOGIN   --title="CP Login" \
   --url=https://uat-web.xrportal.in/                --fs=.claude/docs/hoabl-knowledge-base/CP-Portal/FRD/CP-FS-Login.md
$N --portal=cp --module=leads-management             --prefix=LEADS     --title="Leads Management" \
   --url=https://uat-web.xrportal.in/leads           --fs=.claude/docs/hoabl-knowledge-base/CP-Portal/FRD/CP-FS-Leads-Management.md
$N --portal=cp --module=customer-registration        --prefix=CPREG     --title="Customer Registration" \
   --url=https://uat-web.xrportal.in/registration    --fs=.claude/docs/hoabl-knowledge-base/CP-Portal/FRD/CP-FS-Customer-Registration.md
$N --portal=cp --module=kyc-assistance               --prefix=CPKYC     --title="KYC Assistance" \
   --url=https://uat-web.xrportal.in/kyc-assistance  --fs=.claude/docs/hoabl-knowledge-base/CP-Portal/FRD/CP-FS-KYC-Assistance.md
$N --portal=cp --module=jbp-submission               --prefix=JBP       --title="JBP Submission" \
   --url=https://uat-web.xrportal.in/jbp             --fs=.claude/docs/hoabl-knowledge-base/CP-Portal/FRD/CP-FS-JBP-Submission.md
$N --portal=cp --module=project-information          --prefix=CPPROJ    --title="Project Information" \
   --url=https://uat-web.xrportal.in/project         --fs=.claude/docs/hoabl-knowledge-base/CP-Portal/FRD/CP-FS-Project-Information.md

# ── SM Portal (4 modules) ──────────────────────────────────────────────────
$N --portal=sm --module=login                        --prefix=SMLOGIN   --title="SM Login" \
   --url=https://uat-web.xrportal.in/sales-manager   --fs=.claude/docs/hoabl-knowledge-base/SM-Portal/FRD/SM-FS-Login.md
$N --portal=sm --module=physical-allocation          --prefix=PHYSALLOC --title="Physical Allocation" \
   --url=https://uat-web.xrportal.in/sales-manager/physical-allocation --fs=.claude/docs/hoabl-knowledge-base/SM-Portal/FRD/SM-FS-Physical-Allocation.md
$N --portal=sm --module=tower-heatmap                --prefix=HEATMAP   --title="Tower Heatmap" \
   --url=https://uat-web.xrportal.in/sales-manager/tower-heatmap       --fs=.claude/docs/hoabl-knowledge-base/SM-Portal/FRD/SM-FS-Tower-Heatmap.md
$N --portal=sm --module=callback-requests            --prefix=SMCALLBK  --title="Callback Requests" \
   --url=https://uat-web.xrportal.in/sales-manager/callbacks           --fs=.claude/docs/hoabl-knowledge-base/SM-Portal/FRD/SM-FS-Callback-Requests.md

echo ""
echo "All TC skeletons generated."
