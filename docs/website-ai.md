# Public website ALLBEE AI

The shared assets/allbee-assistant.js + CSS mount the humanised app mascot on 23 public root pages. Canonical artwork and rig come from allbeeapp/src/ui; no app files were edited.

The browser sends up to 12 conversation turns to /api/website-ai. Only public page extracts in api/_website-knowledge.json are supplied. Refresh this knowledge snapshot when public content changes. APN guidance is general; personal records stay in the authenticated app.

The Vercel server calls the dedicated Supabase website-ai function, authenticated with ALLBEE_WEBSITE_AI_TOKEN. The function stores only its SHA256 verifier and reads the existing server-only GROQ_API_KEY. No database, app session, user record or service role is read. Existing authenticated AI functions remain unchanged.

Models use the same app fallback order: GPT OSS 120B, GPT OSS 20B, Llama 3.1 8B Instant. Public provider requests have bounded messages, response tokens and timeouts. Per-IP rate limiting is per warm Vercel instance, not a distributed hard quota. AI output is rendered through text nodes and validated HTTP(S) links.

Conversation history stays in sessionStorage for this tab, capped at 12 turns; New chat clears it. The AI provider processes the conversation to generate a reply. Do not submit passwords, OTPs or payment credentials. Stop cancels the browser response; an upstream request already in progress may still finish.

Release targets allbee/website, not the secondary project linked in the repository's local .vercel directory. Deploy supabase/functions/website-ai/index.ts only to ogacjpwlbhmonycjevml with its custom token validation, then deploy the site. Rotate the token by updating both its hash verifier and Vercel production secret.

Checks: node scripts/verify-website-ai.cjs, node scripts/audit.mjs, node --check on edited JS. Live acceptance covers public routes, real website/APN/general replies, mascot rendering, pause/reduced-motion rules and unauthorised relay rejection.
