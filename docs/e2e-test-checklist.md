# AllBee Invitations — End-to-End Test Checklist

Run before launch and after any change to the data layer, payment flow, or APIs.
Tick every box. Anything that fails → `rollback-procedures.md`.

Legend: **[A]** = automated/console check · **[M]** = manual UI check · **[$]** = needs a real/live payment (owner only).

---

## 0. Readiness gate
- [ ] [M] `/admin/launch` shows **all 5 Ready** (Razorpay, Webhook, Apps Script, CRM, Tracking).
- [ ] [A] `GET /api/health` → `{"ready":true}`.

## 1. Lead capture
- [ ] [M] On `/invitation`, submit the enquiry form → success toast.
- [ ] [M] New row appears in the **Leads** sheet with name/mobile/event/source.
- [ ] [M] `NOTIFY_EMAIL` inbox got the "New lead" mail (or quota-skip is acceptable).
- [ ] [M] Open a demo → **Enquire First** → lands on `/invitation#enquiry`; submit →
      lead row shows `source = demo:<slug>` and the **Template ID/Name** columns filled.
- [ ] [A] Spam guard: submit with the hidden `_gotcha` filled (or <1.5s) → silently ignored, no row.

## 2. Order + attribution
- [ ] [M] Demo → **Order This Design** → `/order` opens with the **event auto-selected** and a
      "Design" line (template name + ID) on the summary step.
- [ ] [M] Complete steps → summary shows correct package + price.
- [ ] [A] The order link carries `template_id`, `template_name`, `demo`, `source=demo:<slug>`.
- [ ] [M] Catalog **Order Now** → `/order` carries `source=template:<id>`.

## 3. Payment
- [ ] [$] **₹299** (PDF · Basic): pay live → success screen with links to Design Brief + Track Order.
- [ ] [$] **₹999** (Website · Basic): pay live → success.
- [ ] [$] **₹4,999** (Both · Elite): pay live → success.
- [ ] [M] **No-Razorpay fallback** (if keys absent): order shows "Order received — payment link on WhatsApp" and a lead row is created with `ORDER REQUEST` notes.

## 4. Webhook
- [ ] [M] Razorpay → each test payment → webhook delivery = **200**.
- [ ] [M] **Idempotency:** re-send the same webhook → still **one** Orders row (dedup by `payment_id`).
- [ ] [M] **Failed:** trigger a failed payment → Orders row status **Payment Failed** with reason.
- [ ] [M] **Refund:** refund a captured test payment → row status **Refunded** with amount note.

## 5. CRM
- [ ] [M] `/admin/invitation-orders` (live) shows each test order: amount, **Template**, source, SLA.
- [ ] [M] Change status + add a note → persists after Refresh.
- [ ] [M] Set **Assignee** + **Delivery URL** → persists.
- [ ] [M] **Template Performance** report + exec KPI strip populate.
- [ ] [M] `/admin/invitation-leads` shows the leads with Template attribution.

## 6. Tracking
- [ ] [M] `/track-order` with a real Order ID + the **matching** mobile → status timeline + details.
- [ ] [M] **Wrong mobile** → "couldn't find an order" (privacy: never reveal another's order).
- [ ] [M] After admin sets status **Delivered** + Delivery URL → the download link appears on tracking.

## 7. Delivery + notifications
- [ ] [M] In the order drawer, each **WhatsApp** template (Received / Brief / Design / Review / Delivered / Follow-up) opens wa.me with the customer's number + correct message (incl. Order ID).
- [ ] [M] Delivered template links the customer to `/track-order`.

## 8. Reviews
- [ ] [M] `/review` → submit a rating + text → "will appear after approval".
- [ ] [M] Review appears in `/admin/reviews` **Pending**.
- [ ] [M] Approve it → moves to **Approved**.
- [ ] [M] Reload `/invitation-samples` → the approved review shows in the reviews strip.

## 9. Regression / integrity
- [ ] [A] `node scripts/screenshot-engine.mjs` (served) → 68/68, "img fields wired".
- [ ] [A] Catalog audit script → **0 issues**.
- [ ] [M] Spot-check 3 demos render (incl. one variant `?v=` and one animation-heavy: royal-scroll).
