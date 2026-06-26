# AllBee Invitations — Business Continuity Plan

How AllBee keeps serving customers under load and through failures, at two scales:
**50 orders/day** and **100 orders/day**. Pairs with `rollback-procedures.md` (technical) and
`support-handbook.md` (customer).

---

## Capacity model

A single order touches ~6–10 backend calls (create + webhook + a few tracking checks) and
~15–25 min of human work (assign → brief → design → review → deliver). Leads add more reads.

| Scale | Backend load | Human load (design+ops) | Stack verdict |
|---|---|---|---|
| **50/day** | ~1–1.5k Apps Script calls/day — comfortable | ~12–20 hrs/day of work → **2–3 people** | ✅ Current free stack OK after the email fix |
| **100/day** | ~2–4k calls/day; sheet scans slow as rows grow | ~25–40 hrs/day → **4–6 people** | ⚠️ Do the 3 fixes below + plan Supabase |

---

## Bottlenecks & mitigations

### Human bottlenecks (the real constraint)
| Bottleneck | At 50/day | At 100/day | Mitigation |
|---|---|---|---|
| **Design throughput** | 1–2 designers stretched | needs 3–4 designers | Templatised production; reuse the 25 design languages; Elite/custom only get bespoke time. |
| **WhatsApp replies** | manageable | a dedicated support person | The 6 one-tap WhatsApp templates + `/track-order` deflect "where is it?" load. |
| **Detail collection** | brief form helps | essential | Push **every** order to `/design-brief` immediately (auto-linked on the success screen). |
| **Review/QA** | owner reviews | split review from design | Use the **Assignee** + **task** fields; SLA flags surface stalls. |
| **Overdue tracking** | eyeball it | must be systematic | Morning `/admin/ceo` "Overdue" KPI + per-row SLA badge (New>1d, Designing>3d, Review>2d). |

**Owner-absence cover:** document Razorpay + Apps Script + Vercel access with a second trusted
person (refunds and re-deploys must not block on one person).

### Technical bottlenecks
| Bottleneck | Trigger | Mitigation (status) |
|---|---|---|
| **Gmail email cap (100/day)** | ~50+ orders+leads/day | `safeEmail_` already prevents crashes; **move `NOTIFY_EMAIL` to Workspace (1,500/day)** — do before sustained 50/day. |
| **Sheet scans grow** | a few thousand rows | LockService + 12s cache + pagination already in place; **archive completed orders** monthly; **migrate to Supabase** (prepped) past ~3–5k rows. |
| **ID race on bursts** | simultaneous orders | **Fixed** — LockService serialises writes + payment_id dedup. |
| **Admin loads all rows** | thousands of orders | Server-side pagination is supported (`limit`/`offset`); wire the admin UI to it, or rely on Supabase. |
| **Apps Script daily quotas** | very high volume | UrlFetch 20k/day is ample at 100/day; Supabase removes the ceiling entirely. |

---

## Pre-scale checklist (do before pushing past 50/day)
- [ ] `NOTIFY_EMAIL` on Google Workspace.
- [ ] Second person has Razorpay + Apps Script + Vercel access.
- [ ] Monthly **archive** routine for `Completed` orders (copy to an archive tab, clear from live).
- [ ] Decide the Supabase cutover trigger (e.g. 3,000 total order rows) — guide ready.

---

## Recovery procedures (continuity scenarios)

1. **Surge (orders spike beyond capacity):**
   - Tech holds (stateless + cached). Human side: pause paid ads / new promotion, set expectations
     ("delivery 3–4 days in peak season"), pull in extra design help, prioritise by **event date**
     (sort/triage in CRM), Elite first.
2. **Data layer outage (Apps Script down):**
   - Switch to **manual mode**: fulfil from Razorpay's payment list + WhatsApp; reconcile into the
     sheet when restored. Money is safe (Razorpay) and the webhook is idempotent. (rollback §A)
3. **Payment outage (Razorpay down):**
   - **Capture mode** (unset keys) → orders become leads; send manual payment links. (rollback §C)
4. **Key person unavailable:**
   - Refunds wait for the Razorpay-authorised owner; everything else (design, delivery, support)
     continues from the CRM by any team member.
5. **Bad deploy:**
   - Promote last-good deployment in Vercel (instant). (rollback §E)

## Backup & data safety
- **Google Sheets:** native version history; additionally export `Leads`/`Orders`/`Reviews` to CSV
  **weekly** (also serves as the Supabase import source).
- **Razorpay:** is the source of truth for money — reconcile the sheet against it monthly.
- **Code:** GitHub is the source of truth; Vercel deploys are immutable + revertible.

## On-call summary
| Symptom | Doc | First action |
|---|---|---|
| Numbers look wrong / overdue piling up | this doc | triage CRM by event date, add design help |
| Something technical is red | `rollback-procedures.md` | `/admin/launch` → identify → fix/redeploy |
| A customer is upset | `support-handbook.md` | look up order → acknowledge → resolve/escalate |
| Launching / re-deploying | `launch-runbook.md` | follow top-to-bottom |
| Verifying after a change | `e2e-test-checklist.md` | run the relevant section |
