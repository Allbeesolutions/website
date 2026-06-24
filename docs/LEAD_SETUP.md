# AllBee Invitations — Lead Capture Setup

The `/invitation` form posts to **`/api/invitation-enquiry`** (Vercel Serverless Function).
The function validates, blocks spam, captures Timestamp / IP / Source, then fans out to:

- **Google Sheet + email** — via a Google Apps Script web app you deploy.
- **WhatsApp** — via Meta WhatsApp Cloud API (or CallMeBot fallback).

Every integration is **optional and env-gated**. If an env var is missing, that channel is
skipped gracefully and the lead is logged to Vercel function logs (recoverable).

---

## 1. Google Sheet + email (≈5 min, in your Google account)

1. Create a Google Sheet, e.g. **"AllBee Invitations Leads"**.
2. **Extensions → Apps Script**, paste `docs/lead-apps-script.gs`, **Save**.
3. **Project Settings → Script properties**, add:
   - `SHARED_SECRET` = a long random string (match Vercel `LEAD_SHARED_SECRET`)
   - `NOTIFY_EMAIL` = `allbeesolutions@gmail.com`
4. **Deploy → New deployment → Web app** → *Execute as: Me*, *Who has access: Anyone* → **Deploy**.
5. Authorize (grants Sheets + Gmail-send). Copy the **Web app URL**.

The sheet auto-creates a **"Leads"** tab with columns:
`Timestamp · Name · Mobile · Email · Event Type · Event Date · Interested In · Notes · Source Page · Visitor IP`.

## 2. WhatsApp admin notification (choose one)

**Option A — Meta WhatsApp Cloud API (recommended, official):**
Create a Meta app + WhatsApp product, get a permanent token + phone-number ID, and create an
approved template named `lead_alert` (one body variable). Set the `WHATSAPP_*` env vars below.

**Option B — CallMeBot (zero setup, free, best-effort):**
From the admin phone, message the CallMeBot number to obtain an API key (see callmebot.com),
then set `CALLMEBOT_PHONE` + `CALLMEBOT_APIKEY`.

## 3. Vercel environment variables

Add in **Vercel → Project → Settings → Environment Variables** (Production), then redeploy:

| Variable | Required | Value |
|---|---|---|
| `LEAD_APPS_SCRIPT_URL` | yes | Apps Script web-app URL from step 1.4 |
| `LEAD_SHARED_SECRET` | yes | same random string as the script's `SHARED_SECRET` |
| `WHATSAPP_TOKEN` | option A | Meta Cloud API permanent token |
| `WHATSAPP_PHONE_ID` | option A | Cloud API phone-number ID |
| `WHATSAPP_ADMIN_TO` | option A | `918903607506` (E.164, no `+`) |
| `WHATSAPP_TEMPLATE` | option A | `lead_alert` (default if unset) |
| `CALLMEBOT_PHONE` | option B | `+918903607506` |
| `CALLMEBOT_APIKEY` | option B | from CallMeBot |

## 4. Spam protection (built in, no setup)

- **Honeypot** `_gotcha` field (bots fill it → silently dropped).
- **Time-trap**: submissions faster than 2s or older than 12h are dropped.
- **Strict validation** + length caps on every field.
- *(Optional upgrade: add Vercel KV / Upstash for per-IP rate limiting.)*

## 5. Test

Submit the form at `https://www.allbeesolutions.com/invitation` → expect the success toast,
a new row in the Sheet, an email to `NOTIFY_EMAIL`, and a WhatsApp to the admin number.

---

## 6. Lead CRM  (Phase 5)

The team CRM lives at **`/admin/invitation-leads`** (noindex, passcode-gated). It reads/writes the
same Google Sheet via `/api/invitation-leads`, which calls the Apps Script `list`/`update` actions.

**Redeploy the Apps Script** with the updated `docs/lead-apps-script.gs` (adds Lead ID, Status, Value,
CRM Notes, Updated columns + `list`/`update` actions), then add one env var:

| Variable | Required | Value |
|---|---|---|
| `ADMIN_PASSCODE` | yes | passcode the AllBee team enters to open the CRM |
| `LEAD_APPS_SCRIPT_URL` | yes | (already set in Phase 2) |
| `LEAD_SHARED_SECRET` | yes | (already set in Phase 2) |

Until `ADMIN_PASSCODE` + `LEAD_APPS_SCRIPT_URL` are set, the CRM page still works in **Demo mode**
(fictional sample leads) so the team can preview the UI. Lead stages: New Lead → Contacted →
Quotation Sent → Negotiation → Won / Lost. The architecture is future-ready: swap the Apps Script
calls in `api/invitation-leads.js` for Supabase later without touching the CRM page.
