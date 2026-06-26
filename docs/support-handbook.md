# AllBee Invitations — Support Handbook

How the team handles real customer issues. Tone: warm, fast, premium. Primary channel:
**WhatsApp +91 89036 07506**. Every interaction → log a note on the order in
`/admin/invitation-orders` so the whole team has context.

---

## Golden rules
1. **Acknowledge within the hour** during operating hours.
2. **Look it up before replying** — find the order in `/admin/invitation-orders`
   (search by name/mobile/Order ID) so you speak from facts.
3. **Never share another customer's data.** Tracking requires Order ID + matching mobile.
4. **Money issues → verify in Razorpay**, not from memory.
5. **Refunds/transfers are a human action** — process them in the Razorpay dashboard; the
   site never moves money automatically.

---

## 1. Payment issues

**"I paid but got no confirmation."**
1. Razorpay → Transactions → search the mobile/amount.
   - **Captured:** reassure them; check the Orders sheet has the row (if not → `rollback-procedures.md` §B, re-deliver webhook). Send the Order ID + `/track-order` link.
   - **Failed/pending:** tell them no money was taken (or auto-reverses in 5–7 days); send a fresh Razorpay **payment link**.
2. **Double charge:** if two captures exist for one order → refund one in Razorpay (see §4).

**"The payment page didn't load / errored."**
- Likely gateway/keys (see rollback §C). Send a Razorpay **payment link** directly so they can pay now; capture the order in the sheet manually.

**"Is it safe to pay?"** — Yes; payments are processed by **Razorpay** (PCI-DSS). We never see card details.

## 2. Delivery issues

**"Where is my invitation?"**
1. Find the order → check **status** + **SLA** flag.
2. Tell them the stage in plain words and the expected next step; send the `/track-order` link.
3. If **overdue** (red SLA): apologise, give a concrete time, reassign/escalate to Haji.

**"The download link doesn't work."**
- Open the **Delivery** URL on the order yourself. Fix/re-upload the file, update the Delivery
  field, confirm it shows on `/track-order`, then resend via the **Delivered** WhatsApp template.

**"I need a change after delivery."** → treat as a revision (§3 of the ops flow): log the request
as a note, redesign, set status back to **Review**, send the **Review ready** template.

## 3. Customer complaints

1. **Listen + acknowledge** first; don't get defensive.
2. Log the complaint as a dated note on the order.
3. Resolve: redesign (status → Designing/Review), expedite, or escalate to Haji.
4. After resolving, send the **Follow-up** WhatsApp template and (if happy) the `/review` link.
5. Repeated/serious issues → flag in the daily review.

## 4. Refund requests

> Refunds are processed **manually in Razorpay** by an authorised owner. The platform records
> the outcome; it does not issue refunds itself.

1. Confirm eligibility against policy (see `/refund`): e.g. before design starts = full; after
   draft shared = partial; after delivery = case-by-case.
2. Owner: Razorpay → the payment → **Refund** (full/partial).
3. The `refund.created/processed` webhook auto-marks the order **Refunded** in the sheet. If the
   webhook is down, set the order status to **Refunded** manually and add a note with the refund ID.
4. Tell the customer the amount + that bank credit takes 5–7 working days.

---

## Canned WhatsApp openers (personalise the name)
- *Payment:* "Hi {name}, thanks for reaching out — let me check your order {id} right away."
- *Delivery:* "Hi {name}, your invitation {id} is at the **{stage}** stage. Here's live status: allbeesolutions.com/track-order"
- *Apology (overdue):* "Hi {name}, apologies for the wait on {id}. We're prioritising it now and you'll have it by {time}."
- *Refund:* "Hi {name}, I've processed your refund of ₹{amt} for {id}. It'll reflect in 5–7 working days."

## Escalation
| Issue | Owner |
|---|---|
| Design/revision | Alim → Haji |
| Payment / refund | Haji (Razorpay access) |
| Site/tech down | Haji → developer (rollback-procedures.md) |
