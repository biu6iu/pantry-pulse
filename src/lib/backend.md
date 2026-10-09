# Backend notes

The backend is the code in this folder (`src/lib`) plus the route handlers in `src/app/api`. For setup, environment variables and how to run the app and tests, see the [README](../../README.md).

## Layers

Backend code lives in `src/lib` and is split into layers. Each layer only depends on the ones below it, and the API routes in `src/app/api` are thin wrappers over the services.

```
src/app/api/*/route.ts     HTTP route handlers (Next.js)
        │
        ▼
src/lib/container.ts       wires repositories into services
        │
        ▼
src/lib/services           business logic; returns DTOs
        │
        ▼
src/lib/repositories       data access (Prisma); returns models
        │
        ▼
src/lib/models             domain objects
```

| Directory | Responsibility |
| --- | --- |
| `models/` | Domain classes and types (`Donation`, `DonationEntry`, `DonatedItem`, `User`, `DonationStatus`). Plain objects with a little behaviour, e.g. `Donation.getTotalItems()`. Impact figures are calculated here from the item factors (see `impact.ts`), not stored. They know nothing about Prisma or HTTP. |
| `dto/` | Data transfer objects: the exact JSON shapes the API returns and the frontend consumes (`DonationDTO`, `DonationSummaryDTO`, `DonationListDTO`, `ImpactReportDTO`, `TrackingDTO`), plus `DonationFilters`, the one definition of the list filters shared by the frontend wrappers, the route parser and the repository. |
| `repositories/` | The only layer that talks to the database. `donation.repository.interface.ts` defines `IDonationRepository`; `donation.repository.ts` implements it with Prisma and maps rows into models. The impact report totals (overall, by category, by recipient, by month) are aggregated in SQL here. |
| `services/` | Business logic. Each service (`DonationService`, `ImpactService`, `TrackingService`) takes an `IDonationRepository` in its constructor, and maps models to DTOs. |
| `config/` | Shared configuration: `db.ts` creates the singleton `PrismaClient` (using the `DATABASE_URL` and the `pg` adapter), and `origin.ts` holds the fixed Medical Pantry origin used by the tracking map. |
| `api/` | HTTP plumbing. `responses.ts` has the `notFound`/`badRequest`/`serverError` helpers for route handlers. `http.ts` has `apiRequest` and `ApiError`. `query.ts` turns a `DonationFilters` object into a query string. `client.ts` and `server.ts` are typed fetch wrappers for the frontend (browser and server components respectively). |

## Dependency injection

`src/lib/container.ts` is the composition root. It creates a single `DonationRepository` and injects it into each service:

```ts
const donationRepository = new DonationRepository();

export const donationService = new DonationService(donationRepository);
export const impactService = new ImpactService(donationRepository);
export const trackingService = new TrackingService(donationRepository);
```

Route handlers import the ready-made service instances from the container rather than constructing anything themselves:

```ts
import { trackingService } from "@/lib/container";

export async function GET(request: NextRequest, context: RouteContext<"/api/tracking/[id]">) {
  try {
    const { id } = await context.params;
    const tracking = await trackingService.getTracking(id);
    return tracking ? Response.json(tracking) : notFound("Donation not found");
  } catch (error) {
    return serverError(error);
  }
}
```

Because services depend on the `IDonationRepository` interface rather than the Prisma implementation, they can be constructed with a different repository (e.g. a stub) when unit testing.

## API routes

| Route | Service call | Returns |
| --- | --- | --- |
| `GET /api/donations` | `donationService.listDonations(filters)` | `{ items, total }`: a page of donation summaries and the total matching the filters |
| `GET /api/donations/[id]` | `donationService.getDonationDetail(id)` | One donation with its line items and impact, or 404 |
| `GET /api/impact` | `impactService.getImpactReport()` | Impact totals overall, by category, by recipient and by month |
| `GET /api/tracking/[id]` | `trackingService.getTracking(id)` | Origin, recipient location and timeline for one donation, or 404 |

`GET /api/donations` accepts these optional query parameters, and responds with 400 if one is invalid:

| Parameter | Meaning |
| --- | --- |
| `status` | `OPEN` or `COMPLETED` (case-insensitive) |
| `recipientId` | Only donations to this recipient |
| `from`, `to` | Date range on the donation's creation date (any format `new Date()` parses) |
| `limit`, `offset` | Paging: `limit` is a positive integer, `offset` a non-negative integer |

## Data model

The schema is `prisma/schema.prisma`. The Prisma client is generated into `src/generated/prisma` (git-ignored) by `npm install`.

| Table | Model class | Notes |
| --- | --- | --- |
| `Donation` | `Donation` | One order. `id` is the order id from the source data. `status` is stored as free text. |
| `User` | `User` | A recipient organisation. `name` in the database is `organisation` on the model. `type` marks internal recipients. `lat`/`lng` are filled in by the geocode script. |
| `DonatedItem` | `DonatedItem` | A catalogue item with the factors impact is calculated from: `unitsPerPack`, `unitWeightKg`, `co2eKgPerUnit`, `healthImpactTier`. All are optional. |
| `DonationEntry` | `DonationEntry` | One line of an order: an item and a quantity. |

Things that differ between the database and the models:

- **Status** is normalised when a row is read. `completed` and `open` in any casing become `COMPLETED` and `OPEN`; anything else becomes `UNKNOWN`.
- **Dates** are `Date` in the database and ISO strings on the models and DTOs.
- **Category** can be null in the database. It is reported as `Uncategorised` (`UNCATEGORISED` in `models/donatedItem.ts`).
- Some columns (`shopifyOrderId`, `deliveryMethod`, `weightSource`, `co2eSource`, `lineNo`, `variant`) are imported and stored but are not on the models or returned by the API.

Schema changes need a migration: edit `prisma/schema.prisma` and run `npx prisma migrate dev`. The Prisma CLI connects with `DIRECT_URL` (`prisma7.config.ts`); the app connects with `DATABASE_URL` (`config/db.ts`).

## Impact calculation

Nothing is stored; every figure is derived from the item factors.

A donation counts towards impact only if it is `COMPLETED` and its recipient's `type` is not `internal`. Otherwise its impact fields are `null`.

| Figure | Formula |
| --- | --- |
| Units delivered | quantity × `unitsPerPack` |
| Weight diverted (kg) | units delivered × `unitWeightKg` |
| CO₂e avoided (kg) | units delivered × `co2eKgPerUnit` |
| Health impact score | average of (5 − `healthImpactTier`) across entries, weighted by quantity |

Entries whose item is missing a factor are left out of that figure. Results are rounded to two decimal places with `roundImpact`.

**These rules are written twice and must be kept in step:**

- per donation, in the models (`Donation.countsTowardImpact`, `getHealthImpactScore`, `getEnvironmentalImpact`, and the `DonationEntry` helpers). Used by the donation list and detail routes.
- in aggregate, as SQL in `repositories/donation.repository.ts` (`impactSource` and `IMPACT_TOTALS`). Used by the impact report.

Shared constants (`HEALTH_IMPACT_TIER_COUNT`, `INTERNAL_RECIPIENT_TYPE`) live in `models/impact.ts`. If you change a rule, change both places and the tests for both.

## Repository

`DonationRepository` is the only code that queries the database.

- `getAll`, `count` and `getById` use the Prisma query API and map rows to models with `toDonation`. `getAll` orders by creation date, newest first.
- `getAll` and `count` build their `where` from the same function (`toDonationWhere`), so the total always matches the list. `limit` and `offset` only apply to `getAll`.
- The four impact queries use raw SQL (`prisma.$queryRaw`). They ignore `status`, `limit` and `offset`: only completed donations count, and aggregates are not paged.
- Raw queries return `bigint` and numeric strings. Convert them with `toNum` before returning.

## Filters

`DonationFilters` (`dto/donationFilters.dto.ts`) is the single definition of the list filters. It is used by the frontend wrappers (`api/client.ts`, `api/server.ts`, via `api/query.ts`), the route parser and the repository.

Not every filter is reachable over HTTP yet:

| Filter | Repository | `GET /api/donations` | `GET /api/impact` |
| --- | --- | --- | --- |
| `status`, `recipientId` | yes | yes | no |
| `from`, `to` | yes | yes | no |
| `limit`, `offset` | list only | yes | no |
| `country`, `state` | yes | no | no |

`GET /api/impact` takes no parameters: `ImpactService.getImpactReport()` calls the repository without filters, so filters passed to the `getImpactReport` wrappers are sent but ignored.

## Route handlers and errors

Route handlers stay thin: parse and validate the request, call one service method, return JSON.

- Wrap the body in `try`/`catch` and return `serverError(error)` from the catch. It logs the error and returns a generic 500, so internal details are never sent to the client.
- Use `badRequest(message)` for invalid input and `notFound(message)` for a missing record.
- Every error response has the shape `{ "error": "message" }`.

On the calling side, `apiRequest` (`api/http.ts`) returns `null` for a 404 and throws `ApiError` (with the status and the `error` message) for any other failure. Callers should handle both.

`api/server.ts` is for server components only. It builds an absolute URL from the incoming request's `host` header, because server-side `fetch` cannot use a relative path.

## Privacy

The tracking route returns the recipient's organisation, city, state, country and coordinates. Coordinates are rounded to two decimal places (about 1.1 km) in `TrackingService`, so a street address cannot be worked out from an order number. Street, postcode, contact name, email and phone are never included in any DTO. Keep it that way when adding fields.

## Tests

Tests are in `tests/` and run with `npm test`.

- They run against a real Postgres database, `TEST_DATABASE_URL`. `tests/global-setup.ts` points `DATABASE_URL` at it and applies migrations before the suite.
- `tests/fixtures/donation.ts` seeds a small known dataset (`seedFixtures`) before each test and deletes every row afterwards (`clearFixtures`). Never point `TEST_DATABASE_URL` at real data.
- Test files run one at a time (`fileParallelism: false`) because they share the database.
- Route tests import the `GET` handler and call it with a `NextRequest`; no server is started.
- Service tests use the real repository. `server-error.route.test.ts` shows how to mock a repository method to test the failure path.

If you add an item, recipient or donation to the fixtures, expected totals in several test files will change.

## Scripts

Both live in `scripts/` and write to the database in `DATABASE_URL`.

### Importing data

```bash
npm run db:import              # reads ./data
npm run db:import -- <folder>  # or a folder of your choice
```

The folder must contain `items.csv`, `orders.csv` and `order_items.csv`. Items, orders and line items are upserted using the ids from the CSVs, so re-running the import is safe. Rows that can't be imported are skipped and listed as warnings at the end.

The whole import runs in a single transaction: if anything fails, no changes are saved.

Other import behaviour worth knowing:

- The transaction has a 10 minute timeout, since hundreds of upserts over the network take far longer than Prisma's 5 second default.
- Recipients are matched by organisation name. An order with no organisation is attached to an "Unknown organisation" recipient for its type and location.
- Orders with no valid `created_at` are skipped, as are order lines that refer to an unknown order or item.
- Status is stored in lower case; it is normalised on read (see [Data model](#data-model)).

### Geocoding users

```bash
npx tsx scripts/geocode-users.ts
```

Fills in `lat`/`lng` for every user that is missing coordinates, using their address (street, city, state, zip, country) and the LocationIQ search API. These coordinates drive the tracking map. Requires `LOCATION_IQ_KEY`. Requests are spaced about 1.1 s apart (LocationIQ's free tier allows 60 per minute) and retried after a minute if rate-limited. Results are cached per normalised address, so users sharing an address cost a single request. Users with no address, or an address LocationIQ cannot resolve, are skipped.

Run it after importing data so that new recipients appear on the map.

## Adding a feature

1. Add or extend a model in `models/` and, if the schema changes, a Prisma migration (`npx prisma migrate dev`).
2. Add the query to `IDonationRepository` and implement it in `DonationRepository`.
3. Add a DTO in `dto/` and a service method that maps models to it.
4. Register any new service in `container.ts`.
5. Add a route handler under `src/app/api` and a typed wrapper in `api/client.ts` and `api/server.ts`.
6. Add tests in `tests/`.
