# Admin MFA migration: owner cutover runbook

**Status: implementation and synthetic tests complete; production enablement NOT performed.** Until the production owner provides an MFA roster, the legacy passcode remains in use. Never turn on MFA without a tested owner authenticator and a rollback path.

## What is implemented

- `ADMIN_AUTH_MODE=totp` activates a server-side-only roster (`ADMIN_USERS_JSON`) of separately named accounts with SHA-256 PBKDF2 password hashes (310,000 iterations and random salts), TOTP authenticator secrets, per-section scopes and disable/version fields.
- Signed 4-hour HttpOnly, Secure, SameSite=Strict cookies, generated and verified with `ADMIN_SESSION_SECRET`. No TOTP material or password hash is sent to the browser.
- Scopes: `leads`, `orders`, `reviews`, `overview`. Owner must have all four scopes; additional staff can be granted only the sections needed. Credential verification, origin checks, tamper rejection, expiry, logout, account disable and version bump are regression-tested.
- Existing production behavior uses **legacy** mode until an operator explicitly sets the environment. When `totp` is enabled, the shared passcode is **not** accepted by privileged APIs. Unknown mode fails closed.
- TOTP uses ordinary authenticator apps; account creation is local/operator driven rather than public registration. Sign-in/out events are logged server-side without exposing passwords or TOTP codes.

## Owner actions to activate safely

1. In a trusted local Mac Terminal, run `node scripts/admin-identity-setup.mjs`. This *interactive* wizard refuses to run without a terminal or if a previous private file exists. Choose a unique owner password. It creates a `.admin-mfa.private.json` file with `0600` filesystem permissions that Git ignores. **Never upload this file to GitHub or share it in chat.**
2. Privately enrol the generated `authenticatorEnrollmentURI` in your authenticator app and verify the current time on your phone. Keep an offline, secure recovery copy of the enrolment secret and an alternative authorized way to access Vercel.
3. In the **correct production team's** Vercel project, create sensitive Preview-only variables `ADMIN_USERS_JSON`, `ADMIN_SESSION_SECRET`, and `ADMIN_AUTH_MODE=totp`. The roster and signing secret values are in the wizard's `deployment` object. **Do not enable this on production yet.**
4. Redeploy a Preview URL and test the owner login across Overview, Leads, Orders and Reviews; verify sign-out, wrong OTP, restricted staff access and mobile browser behavior. Run `node scripts/admin-mfa-check.mjs` again. Do not use real payment or customer data in synthetic tests.
5. After acceptance, set all three environment variables for Production and redeploy. Confirm owner access before disabling the existing `ADMIN_PASSCODE`. Do not confuse the Vercel personal `allbee-website` project with the actual domain-owning project.
6. For staff identities, generate a unique salt/hash/TOTP secret for each account using an offline trusted procedure (never reuse a password or authenticator seed), add to the roster, and explicitly assign least-privilege scopes. **Increasing `version`** for one user revokes existing cookies for that user after redeploy; set `active:false` to deactivate. Rotating the session signing secret revokes all sessions.

### Emergency rollback

If MFA rollout causes lockout, the authorized deployment owner may restore the previous working Vercel deployment, or temporarily restore the prior known-good auth configuration and redeploy. Document the incident before re-enabling MFA. No app-internal recovery bypass is implemented. Cookies expire after 4 hours; signing-key rotation immediately invalidates all existing sessions. The underlying static admin HTML is not a security boundary—API authorization remains server-side.

### Known limitations

The in-process throttling is not distributed. Brute-force resistance needs a verified production WAF policy before large-scale rollout. Server-side sessions are stateless and only revocable via account version/disable or signing-key rotation. An authenticator reset requires the authorized owner to update the roster and redeploy. No production account or credential was created by the automated regression tests.
