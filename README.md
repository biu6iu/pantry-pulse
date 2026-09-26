# Pantry Pulse

Pantry Pulse is a project of Medical Pantry which visualises the donations made with the aims of making the impact visible.

## Prerequisites

- **Node.js 22** (the version CI runs on) and npm
- **PostgreSQL** database(s): one for the app and a separate one for tests. A hosted Postgres such as Supabase works; the app expects a pooled connection string plus a direct one (see [Environment variables](#environment-variables)).
- A [LocationIQ](https://locationiq.com/) API key, only needed for the [geocode script](#geocoding-users)

## Setup

```bash
npm install                # also runs `prisma generate` (postinstall)
cp .env.example .env       # then fill in the values below
npx prisma migrate dev     # apply migrations to your development database
```

`npm install` generates the Prisma client into `src/generated/prisma`, which is git-ignored. If you change `prisma/schema.prisma`, re-run `npx prisma generate`.

### Environment variables

| Variable | Used by | Description |
| --- | --- | --- |
| `DATABASE_URL` | app at runtime | Postgres connection via a pooler (transaction mode) |
| `DIRECT_URL` | Prisma CLI (`prisma7.config.ts`) | Direct, non-pooled Postgres connection used for migrations |
| `TEST_DATABASE_URL` | `tests/global-setup.ts` | Postgres connection used by the test suite |
| `LOCATION_IQ_KEY` | `scripts/geocode-users.ts` | LocationIQ API key for forward geocoding |

## Running the dev server

```bash
npm run dev
```

The app is served at <http://localhost:3000>.

## Running tests

```bash
npm test             # single run (vitest run)
```

## Scripts

Both scripts are run manually with `tsx` and connect to the database in `DATABASE_URL`.

### Importing data

```bash
npx tsx scripts/import-data.ts <path-to-csv>
```

Imports donations from a CSV export (recipients, items and entries).

### Geocoding users

```bash
npx tsx scripts/geocode-users.ts
```

Fills in `lat`/`lng` for every user that is missing coordinates, using their address (street, city, state, zip, country) and the LocationIQ search API. These coordinates drive the tracking map. Requires `LOCATION_IQ_KEY`. Requests are rate-limited (600 ms apart) and results are cached per normalised address, so users sharing an address cost a single request. Users with no address, or an address LocationIQ cannot resolve, are skipped.

Run it after importing data so that new recipients appear on the map.

## Architecture

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
| `models/` | Domain classes and types (`Donation`, `DonationEntry`, `DonatedItem`, `User`, `HealthImpact`, `EnvironmentalImpact`, `DonationStatus`). Plain objects with a little behaviour, e.g. `Donation.getTotalItems()`. They know nothing about Prisma or HTTP. |
| `dto/` | Data transfer objects: the exact JSON shapes the API returns and the frontend consumes (`DonationDTO`, `DonationSummaryDTO`, `ImpactReportDTO`, `TrackingDTO`). |
| `repositories/` | The only layer that talks to the database. `donation.repository.interface.ts` defines `IDonationRepository`; `donation.repository.ts` implements it with Prisma and maps rows into models. |
| `services/` | Business logic. Each service (`DonationService`, `ImpactService`, `TrackingService`) takes an `IDonationRepository` in its constructor, and maps models to DTOs. |
| `config/` | Shared configuration: `db.ts` creates the singleton `PrismaClient` (using the `DATABASE_URL` and the `pg` adapter), and `origin.ts` holds the fixed Medical Pantry origin used by the tracking map. |
| `api/` | HTTP plumbing. `responses.ts` has the `notFound`/`badRequest`/`serverError` helpers for route handlers. `http.ts` has `apiRequest` and `ApiError`. `client.ts` and `server.ts` are typed fetch wrappers for the frontend (browser and server components respectively). |

### Dependency injection

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
  const { id } = await context.params;
  const tracking = await trackingService.getTracking(id);
  return tracking ? Response.json(tracking) : notFound("Donation not found");
}
```

Because services depend on the `IDonationRepository` interface rather than the Prisma implementation, they can be constructed with a different repository (e.g. a stub) when unit testing.

### API routes

| Route | Service call |
| --- | --- |
| `GET /api/donations` | `donationService.listDonations(filters)` |
| `GET /api/donations/[id]` | `donationService.getDonationDetail(id)` |
| `GET /api/impact` | `impactService.getImpactReport()` |
| `GET /api/tracking/[id]` | `trackingService.getTracking(id)` |

### Adding a feature

1. Add or extend a model in `models/` and, if the schema changes, a Prisma migration (`npx prisma migrate dev`).
2. Add the query to `IDonationRepository` and implement it in `DonationRepository`.
3. Add a DTO in `dto/` and a service method that maps models to it.
4. Register any new service in `container.ts`.
5. Add a route handler under `src/app/api` and a typed wrapper in `api/client.ts` and `api/server.ts`.
6. Add tests in `tests/`.
