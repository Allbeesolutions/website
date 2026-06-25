# AllBee Invitations — Supabase Migration Guide

> **Status: preparation only.** Nothing is migrated yet. This doc + `supabase-schema.sql`
> + `supabase-import.mjs` are everything needed to cut over when volume justifies it
> (rule of thumb: past ~50 orders/day, or a few thousand total rows, Google Sheets reads
> get slow and the Gmail email quota bites — see the stress-test report).

## Why migrate
Today the data layer is Google Sheets via an Apps Script web app. It's free and fine for
low volume, but at scale it has three hard limits:
1. **MailApp email quota** — 100/day on consumer Gmail (1500 on Workspace).
2. **Whole-sheet scans** — every `order_list` / `order_track` reads the entire sheet.
3. **No real indexes / concurrency control** — mitigated today with LockService + caching,
   but Postgres solves it properly.

The architecture was built so the swap touches **only the API functions** — the front-end,
order wizard, tracking page and dashboards are unchanged.

## The single integration point
These serverless functions are the only things that talk to the data layer:
`api/invitation-enquiry.js`, `api/order-create.js`, `api/order-webhook.js`,
`api/track-order.js`, `api/invitation-leads.js`, `api/invitation-orders.js`.
Each currently POSTs to `LEAD_APPS_SCRIPT_URL`. Migration = repoint these to Supabase.

## Steps

### 1. Create the database
- New Supabase project → **SQL Editor** → paste & run [`supabase-schema.sql`](./supabase-schema.sql).
- This creates `leads`, `orders`, `reviews`, the `kpi_today` view, indexes and RLS.

### 2. Add env vars (Vercel)
| Var | Value |
|---|---|
| `SUPABASE_URL` | `https://<project>.supabase.co` |
| `SUPABASE_SERVICE_KEY` | service-role key (server-side only — never ship to client) |

Keep the existing `LEAD_APPS_SCRIPT_URL` until cutover is verified, so you can fall back.

### 3. Export current data
In the Google Sheet: **File → Download → CSV** for the `Leads` and `Orders` tabs.
Save as `leads.csv` and `orders.csv`.

### 4. Import
```bash
SUPABASE_URL=... SUPABASE_SERVICE_KEY=... \
  node docs/supabase-import.mjs ./leads.csv leads
SUPABASE_URL=... SUPABASE_SERVICE_KEY=... \
  node docs/supabase-import.mjs ./orders.csv orders
```
The script upserts on primary key (`id`), so it's safe to re-run.

### 5. Swap the API functions
For each function, replace the `fetch(LEAD_APPS_SCRIPT_URL, …)` call with a Supabase
REST call. Example — `order_track` (`api/track-order.js`):
```js
const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/orders` +
  `?id=eq.${encodeURIComponent(order_id)}&select=id,order_date,name,event_type,invitation_type,package,status,template_name,updated_at,delivery`,
  { headers: { apikey: process.env.SUPABASE_SERVICE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}` } });
const rows = await r.json();
const o = rows[0];
if (!o || normalizeMobile(o.mobile) !== normalizeMobile(mobile)) return notFound();
```
- **Insert order** (`order-create` / webhook): `POST /rest/v1/orders` with header
  `Prefer: resolution=merge-duplicates` → upsert on the unique `payment_id` index gives
  you idempotency for free (no app-side dedup needed).
- **List** (`invitation-orders`): `GET /rest/v1/orders?order=created_at.desc&limit=…&offset=…`.
- **KPIs**: `GET /rest/v1/kpi_today`.
- **Reviews**: public read is already allowed by RLS (`moderated=true`).

### 6. Cutover checklist
- [ ] Schema run, env vars set, data imported (row counts match the sheets).
- [ ] Repoint one function (start with read-only `track-order`) → verify.
- [ ] Repoint `order-create` + webhook → place a ₹1 test order → confirm a single row
      (retry the webhook → still one row, thanks to the unique `payment_id` index).
- [ ] Repoint dashboards → confirm KPIs/Template Performance match.
- [ ] Leave the Apps Script deployed for ~1 week as a fallback, then retire.

## Rollback
Because the front-end never changed, rollback = repoint the functions back to
`LEAD_APPS_SCRIPT_URL`. Keep both env vars set during the transition.
