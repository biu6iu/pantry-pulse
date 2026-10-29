# Testing

Pantry Pulse is tested with [Vitest](https://vitest.dev/) and [Playwright](https://playwright.dev/). There are 172 tests in total: 164 Vitest tests across 13 files in `tests/`, and 8 Playwright end-to-end tests across 2 files in `tests/e2e/` (each run on desktop and mobile, so a run reports 16). Both run on every pull request through CI.

## Running the tests

```bash
npm test             # single run (vitest run)
npm run test:watch   # re-run on change
npm run test:e2e     # end-to-end tests in a browser
```

The tests need `TEST_DATABASE_URL` in `.env` to point at a **separate** Postgres database. The suite deletes every row after each test, so never point it at real data.

## How the suite works

- **Real database.** Tests run against a real Postgres database, so the actual Prisma queries and aggregations are checked. `tests/global-setup.ts` points `DATABASE_URL` and `DIRECT_URL` at `TEST_DATABASE_URL` and runs `prisma migrate deploy` before the suite starts.
- **Known fixtures.** `tests/fixtures/donation.ts` seeds a small, known dataset (`seedFixtures`) before each test and deletes every row afterwards (`clearFixtures`), so each test starts from the same state. Impact figures are calculated from the item factors in the fixtures, so the expected totals can be worked out by hand.
- **One file at a time.** The test files share one database, so they run one after another (`fileParallelism: false` in `vitest.config.ts`).
- **No server needed.** Route tests import a route's `GET` handler and call it directly with a `NextRequest`.
- **Failure paths via mocks.** Where a failure can't be produced with real data, a repository method is mocked to throw (see `server-error.route.test.ts`).

If you add an item, recipient or donation to the fixtures, the expected totals in several test files will change.

## What is covered

The tests follow the backend layers: routes → services → repositories, plus the frontend helpers that build and validate filters.

| File | Layer | Tests | What it checks |
| --- | --- | --- | --- |
| `donations.route.test.ts` | Route | 30 | `GET /api/donations` and `/api/donations/[id]`: filters by status, recipient, date, country and state, paging, totals, 400 on each invalid filter, 404 on unknown ids, percent-encoded ids |
| `impact.route.test.ts` | Route | 5 | `GET /api/impact`: overall and monthly totals, region and date filters, 400 on invalid filters |
| `tracking.route.test.ts` | Route | 4 | `GET /api/tracking/[id]`: status timeline, route endpoints, missing coordinates, 404 |
| `server-error.route.test.ts` | Route | 4 | Every route returns a 500 and logs the error when the repository fails |
| `donation.service.test.ts` | Service | 6 | Donation summaries and details, impact per entry, fallbacks for uncategorised items |
| `impact.service.test.ts` | Service | 7 | The impact report: totals, breakdowns by month, recipient, item, location and category |
| `tracking.service.test.ts` | Service | 5 | Delivery stages for open and completed orders, completion dates, coordinates |
| `donation.repository.test.ts` | Repository | 51 | Every query and aggregation, plus filters by status, recipient, date range and region; checks that filtered breakdowns add up to the filtered totals |
| `filters.test.ts` | API helper | 22 | `parseDonationFilters`: date handling, state code validation (Australian codes only when the country is Australia), from-after-to rejection, each invalid parameter rejected |
| `api.client.test.ts` | Frontend | 8 | Query string building and the typed fetch wrappers |
| `filterValues.test.ts` | Frontend | 16 | Filter form values, validation, region and country options; checks that the query strings it produces are accepted by the API parser |
| `featuredDelivery.test.ts` | Frontend | 3 | Picking the "One recent delivery" order |
| `regionNames.test.ts` | Frontend | 3 | Turning region codes into display names |

## End-to-end tests

The Playwright tests in `tests/e2e/` load the real site in a browser and use it the way a visitor would. Install the browser once with `npx playwright install chromium`, then run `npm run test:e2e`.

- **Same database and fixtures.** `tests/e2e/global-setup.ts` migrates `TEST_DATABASE_URL` and seeds it once with `tests/fixtures/donation.ts`; `tests/e2e/global-teardown.ts` empties it afterwards. Because the two suites share the database, don't run `npm test` and `npm run test:e2e` at the same time.
- **A real build.** `playwright.config.ts` builds the app and starts it on port 3100 with `DATABASE_URL` pointed at the test database. In CI it reuses the build from the step before.
- **Desktop and mobile.** Each test runs in desktop Chrome and on a Pixel 7-sized screen, with reduced motion turned on so the count-up figures settle straight away.

| File | Tests | What it checks |
| --- | --- | --- |
| `impact.spec.ts` | 3 | The impact section's totals, the health and environmental breakdowns, and the "How we measure this" link with its CO₂e source |
| `tracking.spec.ts` | 5 | Tracking a delivered and an open order by number, the error for an unknown or empty number, and browsing orders by status then tracking one |

When a test fails, `npx playwright show-report` opens the report with screenshots and traces; in CI it is uploaded as the `playwright-report` artifact.

## Continuous integration

`.github/workflows/verify.yml` runs on every pull request to `main` and every push to `main`. It starts a throwaway Postgres 16 service container and points `DATABASE_URL`, `DIRECT_URL` and `TEST_DATABASE_URL` at it, then runs:

```bash
npm ci
npx next typegen
npx tsc --noEmit
npm run lint
npm run test
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

Run the same commands locally before opening a pull request.

## Writing a new test

1. Put it in `tests/` with a `.test.ts` name; Vitest finds it automatically. End-to-end tests go in `tests/e2e/` with a `.spec.ts` name.
2. Use the fixture data that's already seeded rather than creating rows in the test, so expected totals stay predictable.
3. For a route, import its handler from `src/app/api/.../route.ts` and call it with a `NextRequest`.
4. For a failure path, mock the repository method with `vi.spyOn` and restore it afterwards, as in `server-error.route.test.ts`.
