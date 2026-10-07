# SauceDemo – SQA Assessment

Exploratory testing, defect report and Playwright E2E automation (JavaScript) for <https://www.saucedemo.com/>.
The full write-up (defects, AI usage log, strategy) is in [`SUBMISSION.md`](SUBMISSION.md).

## What is automated

All 18 test cases are automated as 29 tests (some cases test several variations), in three separate suites, so known bugs never turn the main run red:

| Suite | Command | Files | Test cases | Result today |
|---|---|---|---|---|
| **Core** (the assessment's E2E flow + negatives) | `npm test` | `tests/checkout.e2e.spec.js`, `tests/negative.spec.js` | TC-01, 11, 13–15 (5 tests) | ✅ 5 pass |
| **Regression** (site works correctly; catches future breakage) | `npm run test:regression` | `tests/regression/*.spec.js` | TC-02, 03, 04, 06, 07, 09, 12 (18 tests) | ✅ 18 pass |
| **Known defects** (asserts correct behaviour, so it fails while each bug exists) | `npm run test:defects` | `tests/defects/known-defects.spec.js` | TC-05, 08, 10, 16, 17, 18 (6 tests, one per defect case) | ❌ 6 fail, which is expected |

- The **core E2E test** logs in as `standard_user`, adds Backpack + Fleece Jacket, and verifies the badge and the cart (names, prices, quantity). It then checks out and verifies the overview items, item total = sum of prices, tax = 8 % and total = item total + tax. Finally it finishes the order and confirms the confirmation page and an empty cart.
- **Known-defect tests are red on purpose.** Each one turns green once the developer fixes the bug, and can then move into the regression suite. They run in their own process with their own report (`playwright-report-defects/`), so they never affect `npm test`.
- Runs on **Google Chrome** by default. Firefox is opt-in (`ALL_BROWSERS=1`).

Every test case is written in plain language, with preconditions, test data, steps to reproduce, and expected and actual
results, in [`docs/TEST_CASES.md`](docs/TEST_CASES.md). It is also available as `TEST_CASES.xlsx` and `TEST_CASES.pdf`.

## Prerequisites

- Node.js 18+ (tested with 22)
- Google Chrome (stable) installed, or let Playwright install it (below)
- Internet access to saucedemo.com

## Install

```bash
npm ci
npx playwright install chrome ffmpeg   # Chrome (skipped if already installed) + video recorder
npx playwright install firefox         # only needed for cross-browser runs
```

## Run

```bash
npm test                    # core suite (5 tests), headless, Google Chrome
npm run test:regression     # regression suite (18 tests)
npm run test:defects        # known-defect suite (6 tests, expected to FAIL until bugs are fixed)
npm run test:everything     # all three suites in one run (exits red because of the defect tests)
npm run test:smoke          # only the E2E purchase journey
npm run test:headed         # watch the core suite run in Chrome
npm run test:all-browsers   # core suite on Chrome + Firefox
npm run lint                # syntax-check every JS file
```

Optional env vars: `BASE_URL` (default `https://www.saucedemo.com`), `SAUCE_PASSWORD` (default `secret_sauce`),
`ALL_BROWSERS=1` (add Firefox), `SUITE=core|regression|defects|all` (what the npm scripts set for you).

## Reports

```bash
npm run report              # core suite      → playwright-report/
npm run report:regression   # regression      → playwright-report-regression/
npm run report:defects      # known defects   → playwright-report-defects/
```

Traces, screenshots and videos are kept only for failing tests (`test-results/`). Open a trace with
`npx playwright show-trace test-results/<test>/trace.zip`.

CI (`.github/workflows/playwright.yml`) installs Google Chrome and lints on every push and PR. It then runs the core and
regression suites, which **block** the build if they fail, and the known-defect suite, which is **informational** and never
fails the build. All three HTML reports are uploaded as artifacts. Firefox can be added from the *Run workflow* button.

## Structure

```
pages/                 Page Objects (one per screen + shared header with cart and menu actions)
tests/
  fixtures.js          Page-object fixtures + `loggedIn` fixture (UI login)
  data/testData.js     Users, products, customer, tax rate
  checkout.e2e.spec.js Core: happy-path purchase journey
  negative.spec.js     Core: locked-out login, checkout field validation
  regression/          Regression suite: login, session, catalogue, checkout totals
  defects/             Known-defect suite: one test per defect case (red until fixed)
utils/money.js         "$29.99" → 2999 cents (integer maths, no float drift)
explore/               Throw-away probes used during exploratory testing (not regression)
evidence/              Screenshots referenced in the defect report
docs/                  Test cases (MD / XLSX / PDF), project guide and submission (PDF / DOCX / HTML)
playwright.config.js   Suite selection (SUITE), browser projects (Chrome default), base URL, reporters, timeouts
```

For a detailed walkthrough of every folder, configuration option and command, see
[`docs/PROJECT_GUIDE.md`](docs/PROJECT_GUIDE.md) (also available as PDF and DOCX).

## Design choices

- **Language:** plain JavaScript (CommonJS). Every file starts with `// @ts-check` and uses JSDoc types, so editors such as VS Code and Cursor still give autocomplete and type warnings without a TypeScript build step.
- **Browser:** branded Google Chrome via `channel: 'chrome'`, not Playwright's bundled Chromium, so tests run on the browser real users have.
- **Selectors:** `data-test` attributes via `getByTestId` (configured `testIdAttribute: 'data-test'`) and `getByRole` for buttons; product cards are located by visible name, never by index.
- **Waiting:** only web-first assertions / auto-waiting; no `waitForTimeout`.
- **Isolation:** each test gets a fresh browser context (clean cookies + localStorage), so cart state never leaks between tests.
- **Prices:** read from the catalogue at runtime and compared downstream, so the test checks consistency rather than hard-coded prices.
- **Retries:** 0 locally, 1 on CI (a retry that passes is reported as *flaky*, not hidden).
