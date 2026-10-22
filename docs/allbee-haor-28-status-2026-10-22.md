# AllBee Website — HAOR 28-work-area execution record

**Audit period:** 22 October 2026. **Repository:** `Allbeesolutions/website`. **Execution branch:** `haor/allbee-28-20261022` based on production `main` revision `27e71f6`. This is a progress/evidence log, **not a 100% completion or production-security certification**. No real payments, customer records, account credentials, storage permissions, firewall policy or production database state were modified by this batch.

## Evidence-backed reconciliation of all 28 approved areas

| # | Task | Status / evidence | Next gate |
|---|---|---|---|
| 1 | Owner MFA | **Prepared earlier:** TOTP, hashed identities, signed cookies, session revocation, synthetic regression tests. | Owner authenticator enrollment and tested deployment cutover; live auth still `legacy`. |
| 2 | Staff roles | **Prepared earlier:** least-privilege scopes, enable/disable and account-version revocation. | Create authorized staff accounts and verify with owner, not in a public chat. |
| 3 | Live Apps Script | **Checked-in script reviewed/tested synthetically.** | Exact invitation Apps Script project, deployment access, backup and controlled activation. |
| 4 | Razorpay credentials | **Not configured according to the live `/api/health` readiness check.** Checkout source supports nonpayment enquiry fallback. | Authorized merchant environment configuration; no live secrets read or generated. |
| 5 | Payment, refund and webhook verification | **Existing synthetic webhook/payment tests retained and extended with authoritative order integrity tests.** | Razorpay sandbox credentials and authorized controlled payment/refund E2E. |
| 6 | Distributed WAF | **Per-instance limiter and security tests present; production WAF not verified.** | Correct `allbee` Vercel team connection; personal connected team is different. |
| 7 | Private Drive access | **Private upload tests/source reviewed, not independently ACL audited.** | Actual customer-reference folder and Drive permissions. |
| 8 | Encrypted real backup / restore | **AES-256-GCM synthetic recovery and tamper tests available.** | Invitation Sheet/Apps Script credentials, isolated restore destination and backup-key custody. |
| 9 | Checkout CSP exception | **Narrow documented exception remains on `/order` and `/order.html`.** | Real Razorpay sandbox modal acceptance before prohibiting vendor inline styles. |
| 10 | Real invitation E2E | **Order payload and eligibility regression expanded; original full E2E checklist remains unexecuted against real records.** | Authorized test records and account access, especially payment/CRM/notifications. |
| 11 | Homepage overflow | **Fixed locally.** Global `html` clip prevents horizontal document scrolling while nested photo gallery retains swipe. Verified at Chrome min-width 500px and tablet 820px. | Live deployment/browser recheck. |
| 12 | Real iOS and Android | **Not certified.** Chromium desktop emulation is not equivalent to device Safari/Chrome/GPU/touch. | Representative device/browser sessions. |
| 13 | Responsive layouts | **Representative suites pass** for 25 desktop pages and nine critical routes each at narrow and tablet sizes. | Full visual/device signoff across 69 pages. |
| 14 | Privacy/analytics | **Improved locally.** 25 demo scripts no longer create GA queues without consent. Runtime VM regression validates sanitized CTA events; consent/withdrawal tests retained. | Verify GA4 receiving only opted-in permitted public-site events and admin metric interpretation. |
| 15 | Service packages and quotes | **Already substantially present** as public package deliverables, prices and honest quote qualifiers; service CTA corrected to say “Get a Project Quote”. | Commercial scope/turnaround support approval where needed; never invent guarantees. |
| 16 | Contextual forms and package eligibility | **Improved locally.** Business service preselection, counseling `course` saved to CRM interest, server canonical template ID/name/event/demo and package validation, browser selection coherence. Synthetic gateway captures correct amount. | Production release validation and controlled end-to-end order. |
| 17 | Courses details | **Partially present:** public catalogue fees/durations, completion statement and mode/batch/trainer disclaimers. | Actual batch dates, trainer qualifications, certificate policy and independently verified learner outcomes. |
| 18 | Loading and assets | **Improved locally.** Five high-resolution classroom JPEGs converted to WebP (8.7–16.2% smaller each, same dimensions). Shared extracted CSS/JS already deployed. | Broader measured real-browser LCP/INP/CLS and prioritization of other media; don't damage portrait quality. |
| 19 | Customer reviews | **Safe presentation:** removed unused seeded testimonials from catalogue JS; only moderated API reviews may render. | Authentic attributed customer review evidence/consent. |
| 20 | Logos and case studies | **Components already present; auto-hide when data absent.** | Actual client authorization, screenshot/artifact and verified result proof. |
| 21 | Google Business Profile | **No fabricated rating or review counts.** | Verified owner-controlled profile and review source. |
| 22 | Registrations and credentials | **No invented GST/Udyam/partner credentials.** | Real registration/certification details and permission to publish. |
| 23 | Refund terms | **Existing policy pages preserved, no silent business-policy changes.** | Owner-approved refund terms matching payment-provider and actual fulfillment rules. |
| 24 | WhatsApp delivery workflows | **Source and existing checklist available; customer-specific messages not sent.** | Authorized test records for six WhatsApp templates, delivery notifications and support review. |
| 25 | GitHub/third-party deployment controls | **Static CI/audit retained, scoped isolated worktree used.** GitHub branch-protection REST returns 403 for connected GitHub integration. | Admin permission review and required review/check policy. |
| 26 | Production monitoring/backup alerts | **Read-only smoke suite and basic API logs present; no true scheduled backup or WAF alert configured.** | Verified production team/Drive access and owner custody plan. |
| 27 | Final security review | **OWASP/ASVS thematic mapping already in `docs/security-acceptance-2026-10-22.md`, updated by new synthetic tests.** | Independent live verification for payment, MFA, storage, WAF, incidents before security certification. |
| 28 | Performance, SEO, accessibility and cross-browser | **Improved locally.** 13-route SEO/PWA/main landmarks/94 image-alt quality suite, accessible tracking/review status, mobile gallery keyboard access. | Real-device WebKit/Android and full visual audits; broader load-speed measurement. |

## Safety and acceptance gates

1. Never enable/replace live admin authentication without an enrolled owner, backup recovery route, and Preview success.
2. Never treat a configured Apps Script or shared secret as proof of the *live* deployed script version, correct folder permissions or successful customer-data restore.
3. Never perform live payment, refund, delivery notification or active brute-force/WAF enforcement without a controlled permitted test plan.
4. The broad invitation catalogue contains package eligibility by design; the new server handler uses authoritative records and rejects mismatched event/package combinations and untrusted design labels before contacting Razorpay.
5. Production deployment on GitHub/Vercel must be separately verified for each pushed SHA. Passing local tests is not production completion.
6. Do not present synthetic user counts, payment profits, ratings, client logos, credentials, or testimonials as real business data.

## Evidence commands

`node scripts/invitation-order-integrity-check.mjs`; `node scripts/contextual-enquiry-check.mjs`; `node scripts/site-quality-check.mjs`; `node --test tests/site-analytics-consent.test.cjs tests/site-analytics-csp-integration.test.cjs`; `node scripts/public-csp-browser-check.mjs`; `CSP_BROWSER_QUICK=1 CSP_BROWSER_VIEWPORT=mobile node scripts/public-csp-browser-check.mjs`; `CSP_BROWSER_QUICK=1 CSP_BROWSER_VIEWPORT=tablet node scripts/public-csp-browser-check.mjs` plus the pre-existing security, pricing, upload, backup and CSP regressions.
