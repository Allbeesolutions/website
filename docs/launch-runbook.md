# AllBee Invitations — Launch Runbook

The single source of truth for taking the platform live. Work top to bottom.
Stop at any step that fails and consult `rollback-procedures.md`.

---

## 0. System map (what talks to what)

```
Customer
  └─ /invitation, /invitation-samples, /demo/*, category pages   (static, Vercel CDN)
       └─ "Order This Design" → /order ──POST──▶ /api/order-create ──▶ Razorpay
                                                        │
                              Razorpay payment.captured ▼
                                                /api/order-webhook ──▶ Apps Script ──▶ Google Sheet (Orders)
       └─ enquiry / design brief / review ──▶ /api/invitation-enquiry|reviews ──▶ Apps Script ──▶ Sheets
  └─ /track-order ──POST──▶ /api/track-order ──▶ Apps Script (order_track)

Team
  └─ /admin/launch   readiness  | /admin/ceo  KPIs
  └─ /admin/invitation-orders   order ops (status, assignee, delivery, SLA, WhatsApp)
  └─ /admin/invitation-leads    lead CRM
  └─ /admin/reviews   moderation
```

The **only** stateful dependency is the Google Apps Script web app → Google Sheets.
Everything else is stateless (CDN + serverless), so it can't "go down" with data loss.

---

## Production project identity

The GitHub `Allbeesolutions/website` main branch deploys to **`allbee/website`** (project ID `prj_zeYZ88T1S5vChWN9jril2ujJuypv`), whose production URLs have the form `website-…-allbee.vercel.app`; the public domain is `www.allbeesolutions.com`. The checkout's existing `.vercel/project.json` points to `kuddosahib-8503s-projects/allbee-website`, a different project. Always use the `allbee` scope and `website` project for environment changes, then inspect the deployment alias before declaring the public site updated.

The public `/api/health` endpoint reports whether environment variables exist; it does not prove the Apps Script responses, Razorpay capture, webhook delivery or admin writes work. Run the integration checks below before calling the site ready.

## 1. Environment variables (Vercel → Project → Settings → Environment Variables)

| Variable | Required for | Notes |
|---|---|---|
| `RAZORPAY_KEY_ID` | online payments | **live** key |
| `RAZORPAY_KEY_SECRET` | online payments | **live** secret |
| `RAZORPAY_WEBHOOK_SECRET` | recording paid orders | must match the secret set in the Razorpay webhook |
| `LEAD_APPS_SCRIPT_URL` | all data (leads/orders/tracking/reviews) | the deployed Apps Script web-app URL |
| `LEAD_SHARED_SECRET` | data auth | must match `SHARED_SECRET` in Apps Script Script Properties |
| `ADMIN_PASSCODE` | admin dashboards | the team passcode |
| `NOTIFY_EMAIL` | email alerts | put on **Google Workspace** before volume (Gmail = 100/day) |
| `REFERENCE_UPLOAD_ENABLED` | optional paid-brief image upload | set to `true` only after the private Drive folder and new Apps Script version are ready; see `reference-upload-setup.md` |

After changing any var: **Redeploy** (Vercel → Deployments → Redeploy) so functions pick it up.

---

## 2. Deploy the Apps Script (do this after ANY edit to `docs/lead-apps-script.gs`)

1. Open the existing **AllBee Invitations Leads** Sheet → **Extensions → Apps Script**. The original web app was lead-only with a ten-column `Leads` tab. Before updating an older installation, retain its deployment URL and a source backup; the current script copies that tab to `Leads backup 2026-09-26` and migrates existing rows to the eighteen-column schema under a lock. Verify the copied tab and lead IDs before deleting any backup. Paste the full contents of `docs/lead-apps-script.gs` and save.
2. **Project Settings → Script properties:**
   - `SHARED_SECRET` = (long random string; mirror into Vercel `LEAD_SHARED_SECRET`)
   - `NOTIFY_EMAIL` = the alert inbox
   - `REFERENCE_FOLDER_ID` = private Drive folder ID when enabling brief image uploads
3. For the existing web app, use **Deploy → Manage deployments → Edit → Version: New version → Deploy**. This preserves its `/exec` URL, so Vercel `LEAD_APPS_SCRIPT_URL` stays unchanged. Authorize any new scopes when prompted.
4. Run `migrateLegacyLeads` once from the editor if the `Leads` tab still has the old header; the deployed script also migrates automatically on the first lead read/write. Verify the `Leads` and backup tabs. The script creates `Orders` and `Reviews` tabs on first use.
5. Verify public reviews and an authenticated CRM read without publishing lead details. Keep the `SHARED_SECRET` script property synchronized with the sensitive Vercel `LEAD_SHARED_SECRET` for Production and Preview.

The production `ADMIN_PASSCODE` and Apps Script shared secret generated during the September 26 setup are stored in the owner's macOS Keychain as **AllBee website admin passcode** and **AllBee Apps Script shared secret**. Never copy them into the repository or a handoff file. The Apps Script `NOTIFY_EMAIL` property is the actual notification destination; mirror it in the Vercel variable used by `/api/health`.

---

## 3. Razorpay setup

1. Razorpay Dashboard → **Settings → API Keys** → generate **live** keys → into Vercel.
2. **Settings → Webhooks → Add** → URL `https://www.allbeesolutions.com/api/order-webhook`,
   secret = `RAZORPAY_WEBHOOK_SECRET`. Subscribe to:
   - `payment.captured`  ✅ (records the order)
   - `payment.failed`    ✅ (marks Payment Failed)
   - `refund.created`, `refund.processed` ✅ (marks Refunded)

---

## 4. Pre-flight check

1. Open **`/admin/launch`** → all five must be **Ready**:
   Razorpay · Webhook · Apps Script · CRM · Tracking.
2. Open **`/admin/ceo`** with the passcode → loads live (not demo).
3. Run the full **`e2e-test-checklist.md`** (3 price points + failure paths).

---

## 5. Go-live

- Announce on WhatsApp / social. Pin the catalog link `https://www.allbeesolutions.com/invitation-samples`.
- Keep `/admin/launch` and `/admin/ceo` open on day one.
- Watch the first 5 real orders end-to-end (order → webhook 200 → CRM row → tracking).

## 6. Daily operating rhythm (per `business-continuity-plan.md`)

- **Morning:** `/admin/ceo` (revenue, overdue), `/admin/invitation-orders` (new orders → assign).
- **Each order:** Order received WA → Brief request WA → design → Review ready WA → set Delivery + status Delivered → Delivered WA.
- **Evening:** clear `/admin/reviews` pending queue; check overdue (SLA) flags.

## Key URLs
| Purpose | URL |
|---|---|
| Readiness | `/admin/launch` |
| Executive KPIs | `/admin/ceo` |
| Orders ops | `/admin/invitation-orders` |
| Leads CRM | `/admin/invitation-leads` |
| Reviews moderation | `/admin/reviews` |
| Customer tracking | `/track-order` |
| Health JSON | `/api/health` |
| Support WhatsApp | wa.me/918903607506 |
