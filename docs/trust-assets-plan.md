# AllBee — Trust Assets: Audit + Implementation Plan

Goal: increase trust, credibility and conversion. **No redesign.** A shared, data-driven
component system is now wired across the site; every block **auto-hides while empty**, so
nothing fake ships. This doc is the audit, the per-page map, and the populate guide.

---

## 1. Audit — what exists vs what's missing (per page)

| Page | Testimonials | Client logos | Case studies | Pricing | Authority (GST/reg/partners) | Real photos | Rating badge |
|---|---|---|---|---|---|---|---|
| index | self-authored | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |
| about | self-authored | ❌ | ❌ | n/a | ❌ | ✅ | ❌ |
| services | self-authored | ❌ | ❌ | partial | ❌ | thin | ❌ |
| courses | self-authored | ❌ | n/a | ✅ | course certs only | ✅ | ❌ |
| webdevelopment | ✅ | ❌ | partial | ✅ | ❌ | ✅ | ❌ |
| digitalmarketing | self-authored | ❌ | ❌ | ✅ | ❌ | thin | ❌ |
| contact | — | ❌ | — | n/a | ❌ | thin | ❌ |
| invitation suite | **real (moderated)** | ❌ | demos act as portfolio | ✅ | ❌ | ✅ | ❌ |

**Universal gaps:** client logos, case studies/portfolio, a Google/third-party **rating badge**,
and visible **authority signals** (registration/GST/Udyam, partner badges, "projects delivered").
**Biggest credibility risk (from the audit):** testimonials read as self-authored — replace with
attributed, sourced ones (the invitations review system already captures real, moderated reviews).

---

## 2. What was wired (this sprint)

A shared component library — **`assets/trust.css` + `assets/trust.js`** — included on
index, about, services, webdevelopment, digitalmarketing, contact. Each mount:
`<section class="tz tz-section" data-trust="TYPE" data-trust-title="…"></section>`.

| Component (`data-trust`) | Renders | State now |
|---|---|---|
| `badges` | Factual trust row (✓ On-time delivery · WhatsApp support · Secure & mobile-first · Based in Nagore) | **Visible** (factual, safe) |
| `authority` | Stat tiles (Businesses, Students, Projects, Years, GST, Udyam) | **Visible** for the numbers already true; GST/Udyam/Years/Projects appear once filled |
| `logos` | "Trusted by" client-logo strip | Hidden until `clients[]` filled |
| `rating` | ★ score/5 from N reviews (Google etc.) | Hidden until `rating` set |
| `cases` | Recent-work cards (client · result · image) | Hidden until `caseStudies[]` filled |
| `reviews` | Approved customer reviews (live from `/api/reviews`) | Shows automatically once reviews are approved in `/admin/reviews` |

Page mounts: **index** logos·rating·cases·reviews·badges · **about** authority·rating·badges ·
**services/webdevelopment** rating·cases·badges · **digitalmarketing/contact** rating·badges.

---

## 3. How to populate (single place: top of `assets/trust.js`)

```js
window.AllBeeTrust = {
  rating: { score: 4.9, count: 120, source: 'Google', url: 'https://g.page/your-profile' },
  clients: [ { name:'Acme Traders', logo:'/assets/clients/acme.png' }, … ],
  caseStudies: [ { title:'Online store', client:'X Traders', result:'+38% enquiries',
                   img:'/assets/cases/x.jpg', url:'/case-studies/x' }, … ],
  authority: { students:'500+', businesses:'50+', projects:'120+', years:'2+',
               gst:'33XXXXXXXXXXXZ5', udyam:'UDYAM-TN-XX-0000000' },
  badges: ['On-time delivery','WhatsApp support','Secure & mobile-first','Based in Nagore, Tamil Nadu'],
};
```
- **Logos:** drop files in `/assets/clients/` (monochrome PNG/SVG, ~120×42), list them. Use only clients who consent.
- **Case studies:** put images in `/assets/cases/`; one real outcome each. (Optional: build `/case-studies/*` pages later.)
- **Rating:** create/claim a **Google Business Profile**, then paste score/count/url. The badge links out for verification.
- **Authority:** fill GST/Udyam once registered → instant B2B credibility.
- **Reviews:** already automated — collect at `/review`, approve at `/admin/reviews`, they appear via `/api/reviews`.

No code changes needed to populate — just edit the config (and add image files).

---

## 4. Remaining trust work NOT auto-fixable (needs your assets/decisions)

| Item | Priority | Why it matters | Effort |
|---|---|---|---|
| Replace self-authored testimonials with attributed (name+photo+company / Google link) | **P0** | #1 credibility risk per audit | low (collect) |
| Real client logos (3–8) | **P0** | instant legitimacy | low |
| 2–3 case studies with measurable results | **P0** | proof of capability for ₹50k buyers | medium |
| Google Business Profile + reviews → fill `rating` | **P0** | third-party proof | low |
| GST/Udyam registration → fill `authority` | **P1** | corporate trust | external |
| Service pricing/packages on services + digitalmarketing | **P1** | reduces enquiry friction | medium |
| Partner/certification badges (Meta/Google/AWS) if held | **P2** | authority | low |
| Team credentials (bios, LinkedIn) on About | **P2** | founder/team trust | low |

---

## 5. Expected impact

- **Now (shipped):** consistent factual trust-badge row site-wide + authority numbers on About → modest immediate lift, zero fake content.
- **After P0 populate (logos + real reviews + rating + 2 case studies):** the biggest credibility jump — moves the site from "capable but unproven" to "trusted", directly lifting ₹50k-tier conversion. Per the website audit this is the single highest-ROI lever (Trust 4.5 → ~8).
