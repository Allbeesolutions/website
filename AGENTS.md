# AGENTS.md

AllBee Solutions website (www.allbeesolutions.com) — **static HTML + Vercel serverless + Google Sheets data layer**. There is **no build step, package.json, npm, tests, or linter**. Don't invent build commands; don't add dependencies to `api/*.js`.

## Serving & verifying

- Local: `python3 -m http.server 8788` (works for pages; API functions need Vercel or `vercel dev`).
- Syntax-check an API function: `node --check api/<file>.js`. Always run this after editing any `api/*.js`.
- No test suite exists; `docs/e2e-test-checklist.md` is the manual QA runbook.

## Routing & headers

- `vercel.json` `rewrites` maps every pretty URL (`/services` → `/services.html`). **Every new `.html` page must be added there** — past commits include P0 bugs from missing rewrites (e.g. `/portfolio`, `/webpricing`).
- The site-wide CSP in `vercel.json` whitelists external script/style/font hosts (cdnjs, Google Fonts/GTM, Facebook, Clarity, Razorpay, wa.me). Adding a new third-party script host requires a CSP edit or it will be blocked.
- `<script>` tags are inline (`'unsafe-inline'`); all 300 KB+ page markup/CSS/JS is hand-written inline per page. Only a few pages share `/assets/trust.css`, `/assets/trust.js`, `/assets/software-solutions.js`.

## Data layer (the critical constraint)

- All data (leads, orders, reviews, tracking) flows through **one** Google Apps Script web app → Google Sheets, called by the API functions in `api/`. Docs: `docs/launch-runbook.md`, `docs/LEAD_SETUP.md`.
- Env vars (Vercel dashboard): `LEAD_APPS_SCRIPT_URL`, `LEAD_SHARED_SECRET`, `ADMIN_PASSCODE`, `RAZORPAY_KEY_ID/SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `NOTIFY_EMAIL`, optional `WHATSAPP_*` / `CALLMEBOT_*`. After changing any env var the deployment must be **redeployed** to take effect.
- Editing `docs/lead-apps-script.gs` in the repo does **nothing** until manually pasted into Google Apps Script (Extensions → Apps Script) and redeployed there. Repo changes to that file are not live.
- `docs/supabase-migration.md` is the planned future swap; only `api/*.js` functions touch the data layer so the front-end never changes.

## API conventions (`api/*.js`)

- CommonJS `module.exports = (req,res) => …`, **zero npm dependencies** (global `fetch`), `req.body` already JSON-parsed by Vercel (each file guards string bodies anyway).
- Convention: missing config ⇒ respond `{ok:true, configured:false,…}` so front-ends fall back to demo mode instead of erroring.
- Every API function takes the same shape, so mirror it when adding a new one.

## Front-end ↔ API coupling (change both or break the site)

- `PRICING` in `api/order-create.js` is the authoritative price and **must mirror** the wizard display in `order.html`.
- The `EVENT_TYPES` list is duplicated across `api/order-create.js`, `api/invitation-enquiry.js`, and the order/invitation pages — keep in sync.
- Forms post to `/api/invitation-enquiry` with `_gotcha` (honeypot) and `render_ts` (time-trap) fields; spam is silently dropped with a fake success.

## Admin pages (`admin/*.html`)

- Passcode-gated: send `x-admin-pass` header, server compares against `ADMIN_PASSCODE`; passcode cached in `sessionStorage['crm_pass']`. Pages show a "Demo mode" fallback when env vars are unset.

## Invitation catalog

- `invitation-samples.html` holds the catalog as a **single-line `const TEMPLATES=[…]` JSON blob** — do not reformat to multi-line; `scripts/screenshot-engine.mjs` regex-edits it.
- Template entries carry `demo` (→ `demo/<slug>.html`), `variant` (demo pages render skins via `?v=<variant>` query string), and `img` (`/demo-shots/*.jpg`).
- Regenerate screenshots: serve repo with `python3 -m http.server 8788`, then `BASE_URL=http://localhost:8788 node scripts/screenshot-engine.mjs` (requires Chrome + macOS `sips`; variant skins don't load from `file://`, hence the server).

## Ops docs that matter

- `docs/launch-runbook.md` — env vars, Apps Script deploy steps, Razorpay webhook setup, daily rhythm.
- `docs/rollback-procedures.md`, `docs/business-continuity-plan.md`, `docs/support-handbook.md` — operational fallback.
