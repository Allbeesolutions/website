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

The GitHub `Allbeesolutions/website` main branch deploys to the AllBee Vercel project whose production URLs have the form `website-…-allbee.vercel.app`; the public domain is `www.allbeesolutions.com`. The checkout's existing `.vercel/project.json` points to `kuddosahib-8503s-projects/allbee-website`, a different project with no environment variables. Do not configure that local link and assume the public site changed. Confirm the team, project ID, production domain, and current deployment before changing settings.

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

1. Google Sheet → **Extensions → Apps Script** → paste the full contents of `docs/lead-apps-script.gs`.
2. **Project Settings → Script properties:**
   - `SHARED_SECRET` = (long random string; mirror into Vercel `LEAD_SHARED_SECRET`)
   - `NOTIFY_EMAIL` = the alert inbox
   - `REFERENCE_FOLDER_ID` = private Drive folder ID when enabling brief image uploads
3. **Deploy → New deployment → Web app** → Execute as **Me**, Who has access **Anyone**.
4. Copy the **/exec URL** → Vercel `LEAD_APPS_SCRIPT_URL`. Authorize when prompted.
5. The script auto-creates the `Leads`, `Orders`, and `Reviews` tabs on first use.

> ⚠️ Re-deploying creates a new version; if you keep the **same deployment** and click
> "Deploy → Manage deployments → edit → Version: New", the URL stays the same (no Vercel change needed).

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
