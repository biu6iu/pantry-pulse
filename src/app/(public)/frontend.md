# Frontend notes

The site is one page (`/`), rendered by `src/app/page.tsx` from the section components in this folder. The page is ordered as a story that ends in a donation: the problem and the ask (header), the proof (our impact), the ask again (donate), then the order tracker for partners. Run it with `npm run dev` and open <http://localhost:3000>.

For setup and how to run the app, see the [README](../../../README.md).

## Where things are

| Path | Responsibility |
| --- | --- |
| `src/app/layout.tsx` | Root layout: page title and description, favicon, the Poppins font and global styles. |
| `src/app/page.tsx` | The home page. Renders the sections in order, plus the floating donate button. |
| `src/app/(public)/` | The page sections: `header.tsx`, `impactContribution.tsx` (server components that fetch the impact report) and `donateCta.tsx` (the closing donate section), `trackImpact.tsx` (client component for the order search), plus `browseOrders.tsx`, the filterable order list inside the tracking section. |
| `src/components/ui/` | Shared presentational components (`StatsBanner`, `ImageBanner`, `CountUp`, `PercentBar`, `ImpactCategoryRow`, `ImpactContributionStatCard`), plus `donate.tsx` (`DonateButton` and `donateHref`) and `stickyDonate.tsx` (`StickyDonate`). |
| `src/components/charts/` | `ImpactOverTimeChart`, the monthly bar chart. |
| `src/components/maps/` | `TrackingMap` and the Leaflet route map, which is loaded client-side only. |
| `src/components/filters/` | `DonationFilterBar` (the date, state and status controls) and `filterValues.ts`, which holds the form's values, its validation and the conversion to the API's `DonationFilters`. |
| `src/components/donations/` | `DonationResultsTable`, one page of orders with paging and a Track button per row. |
| `src/components/impact/` | `ImpactSummary`, the row of totals for a set of orders. |
| `src/components/statsData.ts` | The static banner text, the image paths and `SUPPLIES_PER_DOLLAR` (the $1 → $350 figure). |
| `src/lib/format.ts` | Number, date and label formatting (`formatWeight`, `formatDate`, `formatCategory`) with a fixed `en-AU` locale so server and browser output match. |
| `public/images/` | Static images. The favicon is served from `public/favicon/favicon.ico`. |

The frontend never touches the database directly. It calls the API routes through the typed wrappers in `src/lib/api` (`server.ts` from server components, `client.ts` from the browser). The routes themselves are documented in the [backend notes](../../lib/backend.md#api-routes).

## Sections

### Header (`header.tsx`)

Server component. Fetches the impact report and renders:

- the logo, site name, a `Main Site` text link (to medicalpantry.org) and the `Donate` button (links to GiveNow)
- the red scrolling stats banner (`StatsBanner`)
- the hero: a headline stating the problem, a line on what Medical Pantry does, the live waste and CO₂e totals as support, a `Donate now` button and a "See where it goes" link down to the impact section (`#impact`)

The banner text is a mix of live and fixed figures. Waste prevented and CO₂e avoided come from the impact report and are shown first; the rest is the hardcoded `STATS` list in `src/components/statsData.ts`. Edit that list to change the fixed text. If the report cannot be loaded, only the fixed text is shown and the hero leaves out the totals line.

The banner scrolls using the `marquee-*` classes in `globals.css`. The text is rendered twice so the strip loops without a gap.

### Our impact (`impactContribution.tsx`)

Server component. Fetches the impact report and renders:

- the intro copy and hero image
- **What it has added up to so far**: stat cards (organisations supplied, items saved from landfill, deliveries made, deliveries made last month). The last-month card is left out when it is zero.
- **How much these deliveries matter to care**: orders at each health impact score. Hidden if no order is scored.
- **Which supplies save the most emissions**: each item category's share of CO₂e avoided, largest first. Hidden if no category has any CO₂e avoided.
- **Impact over time**: `ImpactOverTimeChart` from `src/components/charts/charts.tsx`. Hidden if there is no monthly data.

The chart shows the 12 months up to the latest month with data, with empty months as zero. The buttons switch between CO₂e avoided, weight diverted and donations. Hovering or focusing a column shows its value just above the bar, and "View as table" gives the same numbers as a table.

### Donate (`donateCta.tsx`)

Server component, after the impact section. A short case for giving (volunteer-run, $1 → $350+ of supplies), three example amounts with the value of supplies each puts back into use (from `SUPPLIES_PER_DOLLAR`), and a `Donate now` button. The amounts are illustrative only; they do not preselect anything on GiveNow.

### Donate links

Every donate link goes through `DonateButton` / `donateHref` in `src/components/ui/donate.tsx`, which adds `utm_source=pantrypulse`, `utm_medium=website` and `utm_content=<placement>` (`header`, `hero`, `closing`, `sticky` or `tracker`) so GiveNow's referral data shows which button was clicked. Add a new placement to `DonatePlacement` rather than linking to GiveNow directly.

`StickyDonate` is a floating button in the bottom-right corner. It shows once the visitor has scrolled past the header and hides while any element marked `data-hide-sticky-donate` (the header, the hero and the donate section) is on screen.

### Follow a delivery (`trackImpact.tsx`)

Client component. The visitor enters an order number, and the donation and its tracking details are fetched together. The results are:

- **Health impact**: the order's score on a Low / Medium / High scale (below 2, 2 to under 3, 3 and above)
- **Environmental impact**: CO₂e avoided, in kg
- **Recipient and destination**
- **Delivery status**: the created and completed stages with their dates
- **Map**: the route from Medical Pantry to the recipient (`TrackingMap` in `src/components/maps`)
- a short donate prompt under the results
- **Health and environmental impact calculation**: two collapsible panels, side by side, explaining the four health tiers and the environmental formulas. They start collapsed; the "See how we calculate" links in the cards open them.

A visitor without an order number can open **Browse orders** (`browseOrders.tsx`) under the search box. It lists orders five at a time, newest first, through `listDonations` in `src/lib/api/client.ts`, and can be narrowed by creation date range, state and status. Filters apply as soon as they change; there is no apply button. Above the list, a row of figures totals the selection (orders, deliveries, items, CO₂e avoided and locations reached) from `getImpactReport` with the same filters. Those impact figures only count completed orders to external recipients, so "delivered" can be lower than the number of orders, and they are left out when the status filter is Open. Each row shows the order's destination (suburb and state) and the kind of recipient, not the organisation's name, because publishing a browsable list of recipient names has not been agreed with the client. Choosing **Track** on a row loads that order exactly as if its number had been typed in. The filter form sends dates as full timestamps, so `toDonationFilters` moves the end date to the end of its day; otherwise orders created during that day would be left out.

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
