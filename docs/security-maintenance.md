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

## Post-deployment public smoke checks

Check public pages, security headers, `/api/health` (GET only), privileged APIs without credentials (must reject), and invalid methods. Never make brute-force attempts or send synthetic orders to live payment endpoints. For rollback, see `docs/rollback-procedures.md`.
