# AllBee Invitations — Rollback & Failure Procedures

**Core principle:** a customer who has paid must never be lost. Every failure mode below
either degrades gracefully in code, or has a manual catch so the order is recoverable.

Detect first with **`/admin/launch`** (which integration is red) and Vercel → **Logs**
(filter by `/api/...`). Then apply the matching section.

---

## A. Apps Script fails (sheet writes/reads erroring, 500s, quota)

**Symptoms:** `/admin/launch` Apps Script ❌; orders/leads not appearing in sheets; `/track-order` errors.

**Customer impact is contained because:**
- Paid orders are still captured by Razorpay (money is safe) and the webhook **retries**.
- The order webhook is **idempotent** (dedup by `payment_id`) — safe to replay later.
- Enquiry/brief failures are logged server-side (Vercel logs) as recoverable.

**Recovery:**
1. Open Apps Script → **Executions** → read the error.
   - *Lock timeout / "busy":* transient burst — it self-clears; no action.
   - *Email quota:* expected past 100/day on Gmail — `safeEmail_` already skips; move `NOTIFY_EMAIL` to Workspace.
   - *Authorization revoked:* re-authorize the deployment.
   - *Edited but not deployed:* **Deploy → Manage deployments → New version**.
2. **Backfill missed paid orders:** Razorpay → Transactions → for each captured payment with
   no Orders row, in Razorpay re-send the `payment.captured` webhook (idempotent), **or**
   add the row manually in the sheet (ID `ORD-xxxx`, status New, fill payment_id).
3. If Apps Script is down for hours: switch to **manual mode** — work orders straight from
   Razorpay's payment list + WhatsApp; reconcile into the sheet when it's back.

**Last resort (data layer dead):** execute the prepared **Supabase migration**
(`supabase-migration.md`) — repoint the API functions; front-end unchanged.

---

## B. Webhook fails (orders paid but not recorded)

**Symptoms:** Razorpay shows captured payments; Orders sheet missing rows; webhook deliveries non-200.

**Recovery:**
1. Razorpay → Webhooks → check delivery logs + the failing response.
   - **401 bad_signature:** `RAZORPAY_WEBHOOK_SECRET` (Vercel) ≠ webhook secret (Razorpay). Fix + redeploy.
   - **5xx:** Apps Script issue → section A.
2. **Re-deliver** each failed event from the Razorpay webhook log (idempotent — no duplicates).
3. Interim: the customer already saw the success screen; fulfil from Razorpay's payment list
   while the webhook is fixed. Reconcile later (see `support-handbook.md` → reconciliation).

---

## C. Razorpay fails (gateway down, keys invalid, checkout won't load)

**Symptoms:** `/order` payment step errors; `order-create` returns `gateway_error`; checkout blank.

**Built-in graceful path:** if keys are **absent**, `order-create` returns `configured:false` and
the wizard switches to **capture mode** — it records the order as a lead and tells the customer
"we'll send a secure payment link on WhatsApp." No customer is lost.

**Recovery:**
1. Invalid/expired keys → regenerate live keys → Vercel → redeploy.
2. Gateway outage → temporarily **unset** `RAZORPAY_KEY_ID/SECRET` (or use capture mode) so every
   order is captured as a lead; send Razorpay **payment links** manually from the dashboard.
3. Restore keys when the gateway is healthy; re-run a ₹1 test (checklist §3–4).

---

## D. Tracking fails (`/track-order` errors or wrong results)

**Symptoms:** customers report tracking errors.

**Recovery:**
1. `/api/track-order` depends only on Apps Script `order_track` → if Apps Script is down, section A.
2. If `configured:false`, the page shows a **demo preview** (clearly labelled) — not a hard error;
   tell customers status by WhatsApp until the data layer is restored.
3. Verify mobile-matching: tracking requires Order ID **+** the mobile on the order (privacy).
   If a customer used a different number, look them up in the CRM and confirm manually.

---

## E. Site/deploy regression (a release broke something)

**Symptom:** a page/flow worked yesterday, broken after a deploy.

**Recovery (fastest, zero data risk):**
1. Vercel → **Deployments** → find the last-good deployment → **⋯ → Promote to Production**
   (instant rollback; static + serverless revert together).
2. Or `git revert <bad-commit> && git push` → auto-redeploys.
3. Re-run the relevant checklist section.

---

## Rollback decision table
| Failure | First check | Fast fix | Data risk |
|---|---|---|---|
| Apps Script | Apps Script → Executions | Re-deploy / re-authorize | None (webhook retries) |
| Webhook | Razorpay webhook log | Fix secret, re-deliver | None (idempotent) |
| Razorpay | `/order` + Vercel logs | Capture mode + manual links | None (captured as lead) |
| Tracking | `/api/health` | Restore Apps Script | None (read-only) |
| Bad release | Vercel Deployments | Promote last-good | None |
