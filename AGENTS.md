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

<!-- HAJIHAZ_AUTONOMOUS_WORK_PROTOCOL_V1 -->
## HajiHaz Autonomous Work Protocol

This project follows the HajiHaz low-credit autonomous execution protocol.

### Core operating rule
Use high-capability models only for work that genuinely needs high-level reasoning: architecture, difficult debugging, security analysis, ambiguous decisions, planning, and final review. Use the lowest sufficient model/effort for everything else.

Maximize execution through HajiHaz Commander (HHC) and Remote Desktop Commander (RDC) for deterministic or repetitive work such as terminal commands, file edits, searches, builds, tests, Git operations, deployment inspection, browser verification, screenshots, and routine fixes.

### Required project state
Before substantial work, read:
1. `AGENTS.md`
2. `.ai/MASTER_PLAN.md`
3. `.ai/CURRENT_STATE.md`
4. `.ai/NEXT_ACTION.md`
5. `.ai/WORK_QUEUE.md`
6. `.ai/BLOCKERS.md`
7. `.ai/HANDOFF.md`
8. `.ai/state.json`

After every meaningful operation or verified task, update project state before continuing.

### Continuation loop
UNDERSTAND -> INSPECT -> EXECUTE THROUGH HHC/RDC -> READ OUTPUT -> VERIFY -> CHECKPOINT -> DECIDE NEXT ACTION -> REPEAT.

Do not stop merely because one task, build, commit, push, or deployment step completed. Continue while the next action is objectively determinable.

### Usage conservation
- Do not spend premium/high-reasoning model capacity on keyboard/terminal work.
- Batch mechanical work through HHC/RDC.
- Avoid re-analyzing completed work; rely on checkpoint files.
- Prefer concise tool outputs and targeted reads over broad repeated scans.
- Escalate to a stronger model only when the current step cannot be reliably resolved with lower-cost reasoning plus tools.

### Hard-limit continuity
If a Work model becomes unavailable, any available fallback model should resume from `.ai/*` state. If all Work models are unavailable, the local deterministic orchestrator may execute only preplanned, explicitly queued, non-destructive tasks. It must stop for genuine reasoning, credentials/permissions, destructive actions, security-sensitive ambiguity, or owner decisions.

### Stop conditions
Stop only when:
- the objective is completed and verified;
- a genuine owner decision is required;
- required credentials/permissions are unavailable;
- the next action is destructive/high-risk and needs explicit approval;
- high-level reasoning is required and no suitable model is available;
- there is no objectively executable next action.

<!-- /HAJIHAZ_AUTONOMOUS_WORK_PROTOCOL_V1 -->


<!-- HAJIHAZ_AUTONOMOUS_WORK_PROTOCOL_V2 -->
## HajiHaz Autonomy v2 Addendum

This project uses HHC-first, low-credit autonomous execution.

### Execution routing
- HHC is the primary executor for filesystem, terminal, Git, builds, tests, deployment checks, and deterministic browser/system work.
- RDC is fallback only when a GUI interaction is genuinely required or HHC cannot perform the operation.
- Use the lowest-sufficient model/effort. Escalate to high-capability reasoning only for architecture, ambiguous decisions, difficult debugging, security-sensitive analysis, or final review.

### Queue safety
`.ai/WORK_QUEUE.json` tasks may declare: `id`, `title`, `command`, `approved`, `priority`, `depends_on`, `class`, `verify_command`, `requires_model`, `requires_owner`, `timeout_seconds`.
Task classes: `safe_local`, `network`, `deploy`, `owner_required`, `high_reasoning`.
The local orchestrator executes only explicit approved deterministic commands. Destructive or ambiguous work must not be inferred.

### Reliability gates
- Per-project locking prevents simultaneous autonomous edits to one project.
- Running tasks use leases; expired leases are recovered after crashes/reboots.
- A Git rollback snapshot (HEAD/status/binary diff) is captured before execution.
- Failed tasks retry with backoff; after the failure threshold they become `needs_reasoning` rather than looping forever.
- Dependencies must be completed before dependent tasks start.
- Network/deploy tasks pause when offline.
- Verification is required when a task supplies `verify_command`; changing code alone is not completion.
- Never place secrets in queue commands, state files, logs, prompts, or commits.

### Control and continuity
The project registry is maintained by the HajiHaz orchestrator. `PAUSE_ALL` is the emergency stop. Compact `.ai/HANDOFF.md` summaries are rewritten after material task completion/failure so future models read compressed state instead of full historical logs.

<!-- /HAJIHAZ_AUTONOMOUS_WORK_PROTOCOL_V2 -->


<!-- HAJIHAZ_AUTONOMOUS_WORK_PROTOCOL_V3 -->
## HajiHaz Autonomy v3 Status Indicator

When HAO (HajiHaz Autonomous Orchestrator) is active for the current project/session, every user-facing model reply related to project execution must end with a subtle standalone status footer:

`HAO • ACTIVE`

Rules:
- Place it at the very bottom of the response after the substantive answer.
- Keep it visually lightweight; do not make it a heading or large banner.
- Do not repeat or explain the footer unless the user asks.
- Show it only when HAO is actually active/applicable to the project or work session.
- If HAO is paused, blocked, unavailable, or intentionally not being used, do not falsely show ACTIVE; use the truthful state when useful, e.g. `HAO • PAUSED` or `HAO • BLOCKED`.
- This status rule applies across normal ChatGPT project chats, ChatGPT Work sessions, and other model/agent sessions that read this project's `AGENTS.md`.

<!-- /HAJIHAZ_AUTONOMOUS_WORK_PROTOCOL_V3 -->


<!-- HAJIHAZ_AUTONOMOUS_WORK_PROTOCOL_V4 -->
## HajiHaz Autonomy v4 Routing, Telemetry, and Handoff

### Model-use rule
Use the lowest sufficient reasoning tier. High-capability models are for genuine architecture, security-sensitive analysis, difficult debugging, ambiguity, or final review only. Mechanical execution stays with HHC, with RDC used only when GUI work is necessary.

### Usage ledger
When a model performs a material reasoning step in an HAO-managed project and HHC is available, record only a coarse local tier (`low`, `standard`, or `high`) in HAO's local usage ledger. This is a conservation heuristic, not an exact ChatGPT credit meter. Never claim exact remaining ChatGPT Work allowance from this ledger.

### Reasoning escalation
When deterministic execution reaches `needs_reasoning` or a genuine owner decision is required, prefer `.ai/MODEL_HANDOFF.md` as the compressed handoff. Resolve only the reasoning gap, then return deterministic execution to HHC/RDC rather than keeping the premium model active for routine commands.

### Notifications
HAO may issue local Mac notifications for major completion, repeated failure/escalation, or owner approval requirements. Do not notify for every routine task.

### Project metadata
HAO may auto-discover local project stack, test/build/lint/deploy commands, Git remote, deployment provider, and candidate deployment URLs. A candidate URL must not be presented as verified production unless verification has actually occurred.

<!-- /HAJIHAZ_AUTONOMOUS_WORK_PROTOCOL_V4 -->


<!-- HAJIHAZ_AUTONOMOUS_WORK_PROTOCOL_V5 -->
## HajiHaz Autonomy v5 Distributed Control and Analytics

### Adaptive routing
For each task, prefer deterministic HHC execution. Use RDC only when GUI interaction is genuinely required. Use a model only for a real reasoning gap, and use the lowest sufficient reasoning tier. When usage-conservation mode is elevated, avoid high reasoning unless security, architecture, cryptography, or similarly high-stakes analysis truly requires it.

### Project-specific policy
Read `.ai/HAO_POLICY.json` when present. It may override the global HAO defaults for executor preference, auto-deploy permission, parallelism, notification behavior, and model policy. Project-specific policy must never weaken destructive-action, secret, or owner-approval safety gates.

### Multi-machine continuity
HAO maintains a machine registry and heartbeat. Work may be delegated only to a machine explicitly registered as online and capable. A missing second machine is not an error; the primary Mac remains authoritative until another authorized HAO node is connected.

### Analytics
HAO records task outcomes, retries, reasoning escalations, and deterministic completions. Any model-savings metric is heuristic only and must not be presented as exact token or credit savings.

### Remote access
HAO remote/mobile control must use an authenticated transport. Never expose the local dashboard publicly without authentication. The OpenAI Secure MCP tunnel may be used for ChatGPT/HHC access; browser/mobile remote access requires an authenticated HTTP/VPN/tunnel transport.

### Notifications
Local macOS notifications are active. External notification providers may be enabled only through explicitly configured credentials/connectors; absence of credentials must be reported as inactive rather than simulated.

### Exact ChatGPT allowance
Exact ChatGPT Work/Astra/Luna remaining allowance must only be shown if OpenAI exposes a supported source. Otherwise HAO must explicitly report it as unavailable and use local conservation heuristics.

<!-- /HAJIHAZ_AUTONOMOUS_WORK_PROTOCOL_V5 -->
