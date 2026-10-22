# Public website customer-analytics verification

`node --test tests/site-analytics-consent.test.cjs` runs consent/no-tracking checks in CI with no network credentials.

For manual real-browser verification, use a local static server and the Playwright package already installed in an approved development workspace:

```sh
python3 -m http.server 49387 --bind 127.0.0.1
# in a second terminal (use your own local Playwright module path)
PLAYWRIGHT_MODULE=file:///absolute/path/to/playwright/index.mjs node tests/site-analytics-browser.mjs
```

The browser suite covers Chromium and mobile WebKit on the home page and a public invitation demo: opt-in, opt-out, reload, script loading, and Do Not Track. Third-party analytics traffic is deliberately blocked by the fixture. No production URLs or customer data are used. This is not a substitute for physical-device testing.


## Current strict-CSP integration

`node --test tests/site-analytics-consent.test.cjs tests/site-analytics-csp-integration.test.cjs` checks the consent runtime, protects private routes, and proves strict-CSP extracted scripts never load GA by default. All 39 `demo/*.html` public invitations now use `/assets/site-analytics.js` after consent rather than unconditional external scripts; protected order/admin/payment pages remain excluded.
