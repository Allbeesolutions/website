# AllBee website — security hardening evidence and remaining acceptance gates

**Review date:** 22 October 2026
**Scope:** GitHub `Allbeesolutions/website` — static AllBee website, admin previews, Vercel API handlers, checked-in Apps Script source, payment integrations.
**Framework references:** [OWASP Top 10:2025](https://top10.owasp.org/2025/) and [OWASP ASVS 5.0.0](https://asvs.owasp.org/). These are mapping references, not a claim of formal ASVS certification.
**Methodology:** source audit, static/CSP checks, synthetic API/auth/payment tests, local browser exercises and read-only live smoke checks. No penetration testing of real customer accounts, live payment flows, private Drive, or WAF.

## Autonomous work #1–#10

| # | Owner-approved task | Evidence / status |
| --- | --- | --- |
| 1 | Migrate remaining 457 static HTML style attributes | **Implemented.** 457 source attributes on 62 HTML pages mapped to 204 shared CSS rules in `/assets/csp-inline-attrs.css`; no static HTML `style=` attribute remains. |
| 2 | Refactor JavaScript-generated inline style HTML and CSS-text mutation | **Implemented.** Admin report bars use bounded, stylesheet-defined integer widths; stage badges use static selectors; checkout/tracking/portfolio/catalogue use classes; trust images use `<img>` instead of CSS `url()` from input; particle effects use classes and bounded CSSOM property changes. `scripts/inline-style-csp-check.mjs` audits all checked-in JS assets. |
| 3 | Enforce strict `style-src-attr` CSP | **Enforced on all routes except two checkout URL variants:** `/order` and `/order.html` retain an explicit, narrowly scoped `style-src-attr 'unsafe-inline'` exception until Razorpay sandbox UI integration is tested. Global style-src and all other route-specific CSPs reject inline styles. Checkout *site-owned* static/runtime HTML is migrated even though its third-party exception remains. |
| 4 | Mobile, tablet and desktop regression | **Automated representative coverage.** 9 interactive routes exercised at 1440px desktop, 820px tablet and Chrome's narrow-window minimum of 500px. This is **not** real iOS/Android device certification or 390px device emulation. A homepage parallax/carousel image contributes horizontal scroll overflow on narrow widths; requires separate design regression review. |
| 5 | Verify interactions | **Representative tests pass:** homepage modal, team hover, admin leads/orders/executive demo dashboards, report charts, checkout summary, invitation catalogue, RSVP and other demos. Full 69-page visual signoff and real-money checkout not performed. |
| 6 | Strengthen API abuse/authorization tests | **Regression coverage retained:** synthetic admin auth invalid and cross-scope access, TOTP/revocation, unauthorized CRM/orders, input/size limits, upload safeguards, request rate limits, signed/duplicated webhooks and order data filtering. Per-instance in-memory throttling is not a distributed WAF. |
| 7 | Strengthen CI | **Implemented.** Static `inline-style-csp-check.mjs`, all prior suites, strict-CSP browser checks across three viewport windows, and production smoke checks documented. CI browser test avoids reliance on third-party network and WebGL. |
| 8 | Infrastructure/supply-chain audit | **Reviewed, not certified:** GitHub Actions checkout pinned by commit SHA, third-party Three.js uses SRI, site has no root npm dependency manifest, and the Vercel Hobby deploy remains at 12 standalone API functions. External vendor scripts and analytics domain allowances still need periodic integrity and data-flow review. The live production `allbee` Vercel team is not accessible through the currently connected personal account. |
| 9 | Backup recovery tests/docs | **Synthetic only.** AES-256-GCM encrypted snapshot round-trip, modified authentication tag, wrong key, invalid schema and truncated ciphertext all tested. Real backup, private Drive ACL audit, restore to isolated destination, and Apps Script version migration remain owner/access gated. |
| 10 | OWASP/ASVS-based report | **This evidence and risk register delivered.** Findings are based on verified tests with explicit acceptance limitations. Do not treat as a penetration-test certification. |

## OWASP Top 10:2025 risk register

| Category | Evidence of work | Residual risk / required next step |
| --- | --- | --- |
| **A01 Broken Access Control** | Server-side admin authorization, field allowlists, scope-aware opt-in MFA, synthetic cross-scope tests | Shared admin passcode remains active; turn on individual MFA after owner enrollment and recovery acceptance; verify private Drive folder ACLs and tenant separation |
| **A02 Security Misconfiguration** | Global CSP with script restrictions, external CSS, stricter style attributes, no-store privileged responses, GitHub security CI | Narrow checkout CSS exception; verify Vercel production firewall and owner/team permissions; real browser network/extension behavior |
| **A03 Software Supply Chain Failures** | Pinned GitHub Action, SRI on Three.js CDN, dependency-free source, checks in CI | Periodically inventory third-party injected tags/analytics and external SDKs; monitor integrity/versions and GitHub branch protection settings |
| **A04 Cryptographic Failures** | AES-256-GCM backup code and tamper tests, signed checkout webhooks and signed admin cookies | No proof live backup key custody/rotation, storage ACLs, real restore or credential rotation plan are effective |
| **A05 Injection** | HTML escaping in admin/checkout/tracking, spreadsheet-formula protection in source, removal of inline HTML styles and JS, CSP | Actual Google Apps Script deployment version is unverified; dynamic input/output sinks require future security reviews |
| **A06 Insecure Design** | Order-confirmation checks, server-side pricing, safe request limits, idempotent webhook source/test examples | Abuse cases across real services and recoverability of customer workflows not end-to-end verified |
| **A07 Authentication Failures** | Password-hash, TOTP, signed cookie, revocation and CSRF tests for prepared MFA mode | Production remains `legacy` shared-passcode; WAF distributed sign-in protection not configured/verified |
| **A08 Software or Data Integrity Failures** | Signed webhook regression, Vercel and GitHub CI verification, encrypted backup integrity tests | Live Apps Script not deployed from checked-in source; payment/refund redelivery not verified with a sandbox provider |
| **A09 Security Logging and Alerting Failures** | Basic denial/login/server error logs, CI failure visibility | Operational alerting, edge-rate-limit events, centralized retention and incident drill not verified |
| **A10 Mishandling of Exceptional Conditions** | Tests for invalid/oversized bodies, bad IDs, origin denied, invalid webhook signatures and failed storage writes | Runtime outage and chaos/failover scenarios not tested against production infrastructure |

### Applicable ASVS 5.0.0 control areas

Security input/output encoding and injection prevention, secure authentication and session management, authorization/least privilege, cryptographic protection, validation of server-side business logic, safe API handling, secure configuration, logging, and verifiable backup/restoration. This is a **thematic mapping** only; no fabricated requirement IDs or ASVS level assignment. Completing a formal ASVS assessment requires enumerating its requirements and providing independent pass/fail evidence for each.

### Parallel analytics-consent integration reconciliation

During this change, AllBee's opt-in public analytics fix landed separately on `main`. The security patch was replayed onto that newer commit in an isolated worktree, preserving analytics-loader tags in invitation demos and analytics regression tests. `assets/site-analytics.js` no longer sets `style.cssText` (incompatible with strict CSP): the consent dialog and privacy-settings button use `assets/site-analytics.css`, loaded from the same origin. Synthetic consent tests verify no third-party GA script/event is emitted before opt-in, privacy/Do-Not-Track choices, withdrawal and demo route normalization. **This does not authorize additional data collection.**

## Owner-controlled security blockers (not performed)

1. **MFA activation** — run private local enrolment wizard, create owner authenticator recovery process, test Preview, then enable production identity mode and revoke legacy passcodes.
2. **Apps Script** — identify the exact live invitation project and its deployment version, back it up, deploy reviewed changes, and perform read-only/isolated verification.
3. **Vercel WAF** — authorize the *actual* `allbee` team to configure and inspect distributed rate limits; test observe-only thresholds before enforcement.
4. **Private Drive and recovery** — inspect reference-folder ACLs, obtain real encrypted backup with restricted account, test isolated recovery (no production overwrite).
5. **Razorpay and checkout styling** — validate correct scoped credentials and signed webhooks using authorized sandbox/test payments; confirm the Razorpay modal still works with `style-src-attr 'none'` before removing the two-route exception. Health readiness previously showed missing Razorpay settings.
6. **Responsive UX** — review horizontal overflow in the homepage parallax/carousel at Chrome 500px and 820px, plus true mobile Safari/Chrome touch and GPU-backed animations; fix only with verified visual reference.
7. **Monitoring and release policy** — owner review of GitHub branch protections, production analytics/consent, response/error rate baselines and incident alerts.

## Regression and release commands

```sh
node scripts/audit.mjs
node scripts/pricing-check.mjs
node scripts/api-regression.mjs
node scripts/reference-upload-check.mjs
node scripts/reference-sink-check.mjs
node scripts/legacy-leads-migration-check.mjs
node scripts/verify-website-ai.cjs
node scripts/security-regression.mjs
node scripts/webhook-security-check.mjs
node scripts/security-scan.mjs --history
node scripts/admin-mfa-check.mjs
node scripts/admin-csp-check.mjs
node scripts/flow-csp-check.mjs
node scripts/public-csp-check.mjs
node scripts/inline-style-csp-check.mjs
node scripts/invitations-restore-check.mjs
node scripts/public-csp-browser-check.mjs
CSP_BROWSER_QUICK=1 CSP_BROWSER_VIEWPORT=mobile node scripts/public-csp-browser-check.mjs
CSP_BROWSER_QUICK=1 CSP_BROWSER_VIEWPORT=tablet node scripts/public-csp-browser-check.mjs
node scripts/security-production-smoke.mjs --live
```

## Acceptance rule

A source change is accepted only after repeatable tests and a successful deployed commit verify the same functionality in production. **A green CI run, successful production smoke or completed static CSP migration does not mean the platform is 100% secure.** Never report real backup restoration, WAF enforcement, Apps Script rollout, paid checkout, or owner MFA activation without access, executed tests, and evidence.
