# P1–P2 security gates: evidence and remaining dependencies

## 1. Individual admin identities and MFA — implementation complete, activation gated

Code: `lib/admin-identity.js`, `lib/admin-session.js` (routed through `/api/health?admin_session=1` to keep the Hobby function count at 12), the authenticated admin APIs, `assets/admin-auth.js`, `scripts/admin-mfa-check.mjs` and `docs/admin-mfa-rollout.md`. Tested with synthetic accounts. **Production is intentionally still in legacy passcode mode.** Completing this gate needs the real owner's unique password and OTP enrolment, correctly scoped sensitive env variables, preview login acceptance and an owner-approved cutover.

## 2. Live Apps Script deployment — source/test ready, deployment gated

The reviewed source is `docs/lead-apps-script.gs`. Existing synthetic migration, upload, webhook and security checks exercise the checked-in version only. The Google account connected here does **not** expose the invitation Leads/Orders/Reviews Apps Script project, project script ID, or deploy authorization. Google Apps Script and its deployment version are distinct from GitHub/Vercel: pushing source files never updates the live Apps Script. Do not deploy to an unknown script or modify a different AllBee spreadsheet. Required owner handoff: the actual script project and editor/deployer authorization; compare live and checked-in source, take a private backup, deploy a new version, verify the exact version via controlled tests, and retain rollback to the previous version.

## 3. Distributed rate limiting — infrastructure gate

The locally connected Vercel project `kuddosahib-8503s-projects/allbee-website` is **not** the project that owns `allbeesolutions.com` or `www.allbeesolutions.com`. The available connector cannot authorize Vercel Firewall reads/writes on the live `allbee` team. Applying WAF rules to the personal project would not protect production. Owner must connect/grant the exact production project. On that project, inspect existing rules; add log/observe-only thresholds for public review submission, enquiry, order tracking, design brief, and admin sign-in, then test normal access and escalate narrowly to block/challenge. Do **not** indiscriminately throttle payment webhooks, retries, or admin workflows. Confirm rule activity in the production team's logs. The current Node Map limiter is best effort per function instance, not distributed.

## 4. CSP — completed JavaScript migration for the checked-in static site; live re-verification required

As of 22 October 2026, inline executable scripts and HTML event-handler attributes were removed across **all 69 HTML pages** in the current repository, including the 15 outstanding public pages, 39 invitation demos, the earlier protected checkout flows and 5 admin pages. The migration moved **78** newly discovered executable script blocks to self-hosted assets and replaced **64** inline event handlers with explicit, CSP-safe event listeners. Font-stylesheet loading no longer depends on an inline `onload` handler. The shared `vercel.json` script policy now omits `unsafe-inline` and includes `script-src-attr 'none'`, while existing route-specific strong policies are retained.

Validation: `node scripts/public-csp-check.mjs` validates all 69 files and 262 local JS references; `node scripts/public-csp-browser-check.mjs` passed on 20 representative pages with enforced CSP, including homepage modal open/close, team-member hover and two demo RSVP interactions. Synthetic security regression, API and checkout test suites must continue to pass. A headless WebGL-unavailable error is treated as a test-environment limitation (the page's 3D animation should be tested on actual GPU-backed browsers).

**Residual CSP weakness:** Inline CSS is still allowed by `style-src 'unsafe-inline'`; a future stylesheet and `style`-attribute migration is needed before eliminating all inline styles. Third-party script hosts must be reviewed periodically. Production verification of the latest CSP deployment and compatibility remains required.

## 5. Private storage and backup restore — tooling tested, live restore gated

`lib/private-backup.js`, `scripts/invitations-backup.mjs`, `scripts/invitations-restore-check.mjs` provide read-only export from the invitation Apps Script and AES-256-GCM encrypted private snapshots, with offline decrypt/schema/tamper verification. Files are ignored by Git and protected with restrictive local file permissions. Synthetic restore and tamper tests passed. **No actual customer data was copied or restored.** The connected Drive account does not expose the specific invitation spreadsheet or restricted reference-image folder; an unrelated AllBee operational spreadsheet was deliberately not treated as an invitation backup.

To verify live protection, obtain the **exact** folder ID and Sheet, check that Google Drive grants only intended staff access (no `anyone` or unwanted domain/group access), independently verify a link using an authorized account and unauthenticated browser, create a backup using the owner-provided secrets locally, and test a non-destructive isolated restore. Never post backup keys, file IDs or customer data in chat.

### Local recovery procedure

On the owner's own trusted Mac, set `LEAD_APPS_SCRIPT_URL`, `LEAD_SHARED_SECRET`, and a random 64-character hexadecimal `BACKUP_ENCRYPTION_KEY` securely in the current terminal environment (not a shell history command with literal secrets). Run `node scripts/invitations-backup.mjs`. It makes only read requests and writes `.private-backups/*.enc.json` with `0600` permissions. Verify using `node scripts/invitations-restore-check.mjs .private-backups/<exact-filename>.enc.json`. This only decrypts and validates locally; it **never** replaces live Sheets. For live disaster recovery, an owner must select an isolated destination and approve individual restore operations.

## Release and stop conditions

Do not set the entire audit to 100% merely because code tests pass. No password, TOTP enrollment, real payment, live WAF, production data or Google Drive permission may be guessed. Verify the live deployed browser, CSP headers and unauthorized API rejection after each release; keep an immediately usable previous Vercel deployment for rollback. The owner-controlled steps above must remain open until independently verified.
