# Pantry Pulse

Pantry Pulse is a project of Medical Pantry which visualises the donations made with the aims of making the impact visible.

## What the app does

The site is a single public page (`/`) made of three sections:

- **Header**: the Medical Pantry logo, a `DONATE` button linking to [GiveNow](https://www.givenow.com.au/medicalpantry), a scrolling stats banner and a hero image. The waste prevented and CO₂e avoided figures in the banner and hero are live totals from the impact report.
- **Our impact**: headline counts (recipient locations, items saved from landfill, donations made, donations made last month), a breakdown of CO₂e avoided by item category, and an "Impact over time" bar chart of the last 12 months. The chart can switch between CO₂e avoided, weight diverted and number of donations, and the same numbers are available as a table.
- **Track your impact**: search by order number to see that order's health impact score, environmental impact, recipient and destination, delivery status, and a map of the route from Medical Pantry to the recipient. An explanation of how the health impact score is calculated sits below the results.

### Tech stack

- [Next.js 16](https://nextjs.org/) (App Router) with React 19 and TypeScript
- Tailwind CSS 4, plus hand-written classes in `src/app/globals.css`
- PostgreSQL through [Prisma 7](https://www.prisma.io/) and the `pg` driver adapter
- [Leaflet](https://leafletjs.com/) / react-leaflet with OpenStreetMap tiles for the tracking map
- [Vitest](https://vitest.dev/) for tests

## Prerequisites

- **Node.js 22** (the version CI runs on) and npm
- **PostgreSQL** database(s): one for the app and a separate one for tests. A hosted Postgres such as Supabase works; the app expects a pooled connection string plus a direct one (see [Environment variables](#environment-variables)).
- A [LocationIQ](https://locationiq.com/) API key, only needed for the [geocode script](#scripts)

## Setup

```bash
npm install                # also runs `prisma generate` (postinstall)
cp .env.example .env       # then fill in the values below
npm run db:migrate         # apply migrations to your development database
```

`npm install` generates the Prisma client into `src/generated/prisma`, which is git-ignored. If you change `prisma/schema.prisma`, re-run `npx prisma generate`.

To change the schema, edit `prisma/schema.prisma` and create a migration with `npx prisma migrate dev`.

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

Other commands:

```bash
npm run build        # production build
npm run start        # serve the production build
npm run lint         # eslint
```

## Running tests

```bash
npm test             # single run (vitest run)
npm run test:watch   # re-run on change
```

The suite applies migrations to `TEST_DATABASE_URL` and deletes every row after each test, so it must point at a separate test database, never at real data.

### Continuous integration

`.github/workflows/verify.yml` runs on every pull request to `main` and every push to `main`. Against a throwaway Postgres 16 service it runs `npx next typegen`, `npx tsc --noEmit`, `npm run lint`, `npm run test` and `npm run build`. Run the same commands locally before opening a pull request.

## Scripts

Both scripts connect to the database in `DATABASE_URL`.

```bash
npm run db:import                  # import items, orders and order lines from the CSVs in ./data
npm run db:import -- <folder>      # or from a folder of your choice
npx tsx scripts/geocode-users.ts   # fill in recipient coordinates for the tracking map (needs LOCATION_IQ_KEY)
```

Run the geocode script after an import so that new recipients appear on the map. What each script expects and how it behaves is described in the [backend notes](src/lib/backend.md#scripts).

## Architecture

```
src/app/page.tsx, src/app/(public), src/components    frontend: the page and its sections
        │  typed fetch wrappers (src/lib/api)
        ▼
src/app/api                                            HTTP route handlers
        │
        ▼
src/lib                                                services, repositories, models (Prisma + Postgres)
```

The frontend never touches the database directly; it only calls the API routes.

- **Frontend**: the page sections, components and styling are documented in [`src/app/(public)/frontend.md`](<src/app/(public)/frontend.md>).
- **Backend**: the layers, API routes, data model, impact calculation, tests and scripts are documented in [`src/lib/backend.md`](src/lib/backend.md).
