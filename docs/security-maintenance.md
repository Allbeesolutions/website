# AllBee website: application security maintenance

This repository is a static site and Vercel Node API with Razorpay and a separately deployed Google Apps Script/Sheets adapter. It uses no root npm dependency manifest. The Apps Script checked into `docs/lead-apps-script.gs` is a source artifact: pushing this repository DOES NOT deploy it into Google Apps Script.

## Repeatable verification (synthetic, no live payments)

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
```

CI executes these checks on pull requests and pushes. Secret detection is a heuristic that cannot prove the absence of leaks, and does not inspect Vercel settings, private Apps Script deployment versions, Google Drive sharing settings or CI artifacts.

## Trust boundaries and controls

- **Public website:** HTML/CSS/JS and read-only assets. Public users can submit leads, reviews, and payment intents through Vercel endpoints. Only published payment-gateway identifiers belong in client code.
- **Privileged HTTP APIs:** CRM leads, orders, and review moderation require the configured admin passcode in a request header. The header is checked server-side; client-visible admin pages are not themselves an authorization boundary. Session storage of a shared admin passcode is a residual risk pending an identity-provider migration.
- **Vercel functions:** Store gateway credentials, the Apps Script shared secret, the AI provider token, and webhook signing secret server-side. Enforce validation, request limits, authentication where required, and uniform no-store JSON replies.
- **Google Apps Script:** Validates a shared secret, handles sheet writes under a lock, and deduplicates captured payments. `docs/lead-apps-script.gs` is only a source copy; the running version must be separately compared and updated.
- **Private uploads:** Order-bound expiring HMAC tokens, byte/type limits, server-side folder storage. The actual Drive folder ACL must be verified by its owner. No public file links should be returned.
- **Payment:** Server-side price calculation and Razorpay webhook HMAC verification, order lookups for captured payments, and idempotency at the spreadsheet sink. Live refunds and provider redelivery require a planned sandbox or explicit owner-approved test.

## Unverified or owner-controlled controls

1. Migrate the shared passcode to per-person identities with administrator MFA, revocable sessions, least-privilege roles, and audit trails. Do not rotate or remove the current credential before the replacement is tested and the owner approves cutover.
2. Provision or enable distributed edge/API rate limits under the correct Vercel project/team. Current process-local limits are best-effort only; never claim they protect every serverless instance.
3. Inspect the *live* Apps Script web-app deployment/version and update the script separately; verify shared-secret access, payment idempotency and formula-safe writes using synthetic records.
4. Verify Google Drive folder ACLs, backup schedule, encrypted access/retention and an isolated restore of Sheets and private assets. Version history and recovery instructions are not proof of a successful restore.
5. Inspect the actual owner/team Vercel environment scopes, GitHub branch protection and Actions logs, and external-provider logs for any secret exposures. Rotate/revoke only through a dependency-reviewed owner-authorized plan.
6. Migrate inline HTML scripts/handlers before removing `unsafe-inline` from CSP; test animations, admin tools, Razorpay checkout, analytics and mobile views after policy changes.
7. Make a non-destructive production smoke check after deploying. Any real payment, refund, webhook redelivery, user-account test or production data manipulation needs owner approval.

## October 16 follow-up hardening

- Server-side request guards now enforce a configurable byte cap against declared sizes, raw bytes **and** parsed JSON objects. Their control flow returns an explicit blocked boolean and is not dependent on the response writer's return value. The reference-upload route uses the larger 2.3 MiB JSON cap but still validates its existing 1.5 MiB decoded-image maximum.
- Customer design briefs verify that the backend returned the requested order ID and a paid status. Once an order has progressed beyond `Details Submitted`, customers are directed to contact the team rather than overwriting operational notes or resetting the order status.
- Public order page query-prefills (including design name, event and package fields) are now HTML-encoded before interpolation; event/type selectors use exact dataset matching instead of interpolating query values into selectors.
- Synthetic tests execute the order-summary renderer with HTML attack strings and assert no executable markup is emitted. Additional tests cover malformed/missing size headers, parsed JSON payloads, and rejected design-brief submissions.
- Vercel production firewall rules cannot currently be verified or modified through the connected credentials for the production `allbee` team. Before any change, verify the real production project and existing firewall rules; prefer a conservative WAF rule that targets only high-abuse public API routes, with logging before enforcement, and avoid applying webhook throttling blindly. See [Vercel WAF rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting).

## 22 October — static-site script CSP migration

All 69 tracked static HTML pages, including demo routes, now use external JavaScript and no inline event handler attributes. The global `script-src` no longer includes `unsafe-inline`, and `script-src-attr 'none'` blocks script event attributes. The public CSS still requires `style-src 'unsafe-inline'` and is a separate future optimization. Preserve script load order, especially for footer, quote modal, catalogue animations, and invitation demos. Run `node scripts/public-csp-check.mjs` (69 pages and 262 local references) and `node scripts/public-csp-browser-check.mjs` (20 representative strict-CSP browser tests) with other security regressions after changes. The latter uses a local synthetic API server and does not contact production for customer data.

Vercel project access remains limited to the owner's personal `allbee-website` project, not the live `allbee/website` production project. Google Drive search did not expose the invitation Apps Script or restricted reference-image folder. These access dependencies remain genuine owner gates for distributed rate limiting, live Apps Script deployment, and isolated backup restoration.

## External stylesheet hardening (22 October)

Extracted all 111 checked-in inline `<style>` elements from 59 static pages, deduplicated repeated demo styles down to 63 static CSS files, and moved JavaScript-injected particle and catalogue CSS into same-origin files. The global and route-specific policies now enforce `style-src-elem 'self' https://fonts.googleapis.com` (no inline stylesheet elements) while temporarily allowing legacy style attributes with `style-src-attr 'unsafe-inline'`. Chrome local strict-CSP tests verify that linked stylesheet CSSOM rules exist and 20 representative navigation and form behaviors remain functional. The policy is not yet a full no-inline-style CSP; 457 static style attributes plus JS-generated inline CSS remain a separate compatibility migration.

## 22 October — inline attribute hardening and ongoing verification

Source-level HTML presentation moved 457 `style` attributes to 204 CSS selectors in `assets/csp-inline-attrs.css`, and JavaScript HTML-template/CSS-text styles moved to fixed classes, static stage-color selectors, and bounded width selectors. The CSP strictly disallows style attributes everywhere except `/order` and `/order.html`, preserving third-party payment modal compatibility until a sandbox test. The checkout-owned HTML no longer emits style attributes. CI enforces `scripts/inline-style-csp-check.mjs` and exercises CSP interactions in desktop, narrow/mobile proxy and tablet viewports; it does not certify real Safari/iOS touch support. An encrypted backup synthetic recovery test includes wrong keys, corrupted data, missing schema and truncation. The OWASP risk register and owner gates live in `docs/security-acceptance-2026-10-22.md`.

## Post-merge analytics-consent and upload boundary regressions (22 October)

The parallel consent/CSP integration now has a real local Chrome strict-CSP assertion for stylesheet loading, banner visibility and opt-out persistence on the homepage. It also checks that Google Analytics is not injected before consent or after selecting **No thanks**; repeat these tests at desktop, narrow Chrome and tablet widths. The reference-image upload regression exercises a valid 1.5 MiB base64 PNG, an image exceeding that limit by one byte, and an oversized declared JSON request. These tests use synthetic images, local browser state and stubbed storage; they do not authorize a payment, access customer data or prove a real-world network rate-limit threshold.

## Post-deployment public smoke checks

Check public pages, security headers, `/api/health` (GET only), privileged APIs without credentials (must reject), and invalid methods. Never make brute-force attempts or send synthetic orders to live payment endpoints. For rollback, see `docs/rollback-procedures.md`.
