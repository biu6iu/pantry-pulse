# Frontend notes

The site is one page (`/`), rendered by `src/app/page.tsx` from the three section components in this folder. Run it with `npm run dev` and open <http://localhost:3000>.

For setup and how to run the app, see the [README](../../../README.md).

## Where things are

| Path | Responsibility |
| --- | --- |
| `src/app/layout.tsx` | Root layout: page title and description, favicon, the Poppins font and global styles. |
| `src/app/page.tsx` | The home page. Renders the three sections in order. |
| `src/app/(public)/` | The page sections: `header.tsx`, `impactContribution.tsx` (server components that fetch the impact report) and `trackImpact.tsx` (client component for the order search), plus `browseOrders.tsx`, the filterable order list inside the tracking section. |
| `src/components/ui/` | Shared presentational components (`StatsBanner`, `ImageBanner`, `CountUp`, `PercentBar`, `ImpactCategoryRow`, `ImpactContributionStatCard`). |
| `src/components/charts/` | `ImpactOverTimeChart`, the monthly bar chart. |
| `src/components/maps/` | `TrackingMap` and the Leaflet route map, which is loaded client-side only. |
| `src/components/filters/` | `DonationFilterBar` (the date, state and status controls) and `filterValues.ts`, which holds the form's values, its validation and the conversion to the API's `DonationFilters`. |
| `src/components/donations/` | `DonationResultsTable`, one page of orders with paging and a Track button per row. |
| `src/components/statsData.ts` | The static banner text and the image paths. |
| `src/lib/format.ts` | Number, date and label formatting (`formatWeight`, `formatDate`, `formatCategory`) with a fixed `en-AU` locale so server and browser output match. |
| `public/images/` | Static images. The favicon is served from `public/favicon/favicon.ico`. |

The frontend never touches the database directly. It calls the API routes through the typed wrappers in `src/lib/api` (`server.ts` from server components, `client.ts` from the browser). The routes themselves are documented in the [backend notes](../../lib/backend.md#api-routes).

## Sections

### Header (`header.tsx`)

Server component. Fetches the impact report and renders:

- the logo, site name and `DONATE` button (links to GiveNow)
- the red scrolling stats banner (`StatsBanner`)
- the hero image with the total CO₂e avoided over it (`ImageBanner`)

The banner text is a mix of live and fixed figures. Waste prevented and CO₂e avoided come from the impact report and are shown first; the rest is the hardcoded `STATS` list in `src/components/statsData.ts`. Edit that list to change the fixed text. If the report cannot be loaded, only the fixed text is shown and the hero has no overlay.

The banner scrolls using the `marquee-*` classes in `globals.css`. The text is rendered twice so the strip loops without a gap.

### Our impact (`impactContribution.tsx`)

Server component. Fetches the impact report and renders:

- the intro copy and hero image
- **Your contribution means**: four stat cards (recipient locations, items saved from landfill, donations made, donations made last month)
- **Where your donations make the most difference**: each item category's share of CO₂e avoided, largest first. Hidden if no category has any CO₂e avoided.
- **Impact over time**: `ImpactOverTimeChart` from `src/components/charts/charts.tsx`. Hidden if there is no monthly data.

The chart shows the 12 months up to the latest month with data, with empty months as zero. The buttons switch between CO₂e avoided, weight diverted and donations. Hovering or focusing a column shows its value just above the bar, and "View as table" gives the same numbers as a table.

### Track your impact (`trackImpact.tsx`)

Client component. The visitor enters an order number, and the donation and its tracking details are fetched together. The results are:

- **Health impact**: the order's score on a Low / Medium / High scale (below 2, 2 to under 3, 3 and above)
- **Environmental impact**: units delivered, weight diverted and CO₂e avoided
- **Recipient and destination**
- **Delivery status**: the created and completed stages with their dates
- **Map**: the route from Medical Pantry to the recipient (`TrackingMap` in `src/components/maps`)
- **Health impact calculation**: the explanation of the four tiers

A visitor without an order number can open **Browse orders** (`browseOrders.tsx`) under the search box. It lists orders ten at a time, newest first, through `listDonations` in `src/lib/api/client.ts`, and can be narrowed by creation date range, state and status. Choosing **Track** on a row loads that order exactly as if its number had been typed in. The filter form sends dates as full timestamps, so `toDonationFilters` moves the end date to the end of its day; otherwise orders created during that day would be left out.

Orders that are not completed show the health impact as pending. The map marks the recipient with a 1.1 km circle rather than an exact point, because the API rounds recipient coordinates. The Leaflet map is loaded in the browser only (`osmRouteMapLoader.tsx`), since Leaflet cannot render on the server.

## Styling

- Brand colours, the font and heading sizes are Tailwind theme tokens at the top of `src/app/globals.css` (`brand-red`, `brand-blue`, `surface-cream`), usable as classes such as `bg-brand-red`.
- The header and the tracking section are styled with Tailwind classes in the markup.
- The impact section and the chart use named classes (`impact-contribution__*`, `impact-breakdown__*`, `impact-over-time__*`) defined in `globals.css`.
- Images live in `public/images`; their paths are listed in `IMAGES` in `statsData.ts`.

## Things to know

- Format numbers with `formatWeight` and `formatCategory` from `src/lib/format.ts`, not `toLocaleString()` with the default locale. The server and the browser can format differently, which causes a hydration error.
- `header.tsx` and `impactContribution.tsx` each fetch the impact report, so the home page requests `/api/impact` twice per render.
- `redistribution.tsx` is an empty placeholder and `layout.tsx` in this folder is a pass-through; neither affects the page yet.
