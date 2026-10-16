# Frontend notes

The site is one page (`/`), rendered by `src/app/page.tsx` from the section components in this folder. The page is ordered as a story that ends in a donation: the problem and the ask (header), how Medical Pantry works, one real delivery told as a story, the proof (our impact), the ask again (donate), then the order tracker for partners. Run it with `npm run dev` and open <http://localhost:3000>.

For setup and how to run the app, see the [README](../../../README.md).

## Where things are

| Path | Responsibility |
| --- | --- |
| `src/app/layout.tsx` | Root layout: page title and description, favicon, the Poppins font and global styles. |
| `src/app/page.tsx` | The home page. Renders the sections in order, plus the floating donate button. |
| `src/app/(public)/` | The page sections: `header.tsx`, `impactContribution.tsx` (a server component that fetches the impact report), `howItWorks.tsx` (the three steps), `featuredDelivery.tsx` (one recent order as a story), `donateCta.tsx` (the closing donate section), `trackImpact.tsx` (client component for the order search), plus `browseOrders.tsx`, the filterable order list inside the tracking section. |
| `src/components/ui/` | Shared presentational components (`ImageBanner`, `CountUp`, `PercentBar`, `ImpactCategoryRow`, `ImpactContributionStatCard`), plus `donate.tsx` (`DonateButton` and `donateHref`) and `stickyDonate.tsx` (`StickyDonate`). |
| `src/components/charts/` | `ImpactOverTimeChart`, the monthly bar chart. |
| `src/components/maps/` | `TrackingMap` and the Leaflet route map, and `reachMap.tsx`, the map of every place supplies have reached. Both Leaflet maps are loaded client-side only, through their `*Loader.tsx`. Neither zooms with the scroll wheel until it is clicked (`ClickToScrollZoom`), so scrolling down the page never gets caught on a map. |
| `src/components/filters/` | `DonationFilterBar` (the date, state and status controls) and `filterValues.ts`, which holds the form's values, its validation and the conversion to the API's `DonationFilters`. |
| `src/components/donations/` | `DonationResultsTable`, one page of orders with paging and a Track button per row. |
| `src/components/impact/` | `ImpactSummary`, the row of totals for a set of orders. |
| `src/components/statsData.ts` | The image paths and `SUPPLIES_PER_DOLLAR` (the $1 → $350 figure). |
| `src/lib/featuredDelivery.ts` | `pickFeaturedDelivery`, which chooses the order for the featured delivery section, and `RECIPIENT_PHRASES`, how each recipient type is described in it. |
| `src/lib/format.ts` | Number, date and label formatting (`formatWeight`, `formatDate`, `formatCategory`) with a fixed `en-AU` locale so server and browser output match. |
| `public/images/` | Static images. The favicon is served from `public/favicon/favicon.ico`. |

The frontend never touches the database directly. It calls the API routes through the typed wrappers in `src/lib/api` (`server.ts` from server components, `client.ts` from the browser). The routes themselves are documented in the [backend notes](../../lib/backend.md#api-routes).

## Sections

### Header (`header.tsx`)

Static; it fetches nothing. Renders:

- the top bar: the logo with "Pantry Pulse by Medical Pantry", links to the sections below (`#how-it-works`, `#impact`, `#track`; shown on large screens only), a `Main site` link to medicalpantry.org (hidden on phones) and the `Donate` button
- the hero: a headline stating the problem, a line on what Medical Pantry does, a `Donate now` button and a "See where it goes" link down to the impact section

The page scrolls smoothly to a section when one of these links is followed, unless the visitor has asked for reduced motion.

### How it works (`howItWorks.tsx`)

Static. Three numbered steps: surplus is saved, volunteers sort and pack, delivered where it is needed. Edit `STEPS` to change the wording.

### One recent delivery (`featuredDelivery.tsx`)

Server component. Fetches the 30 newest completed orders and features one, chosen by `pickFeaturedDelivery` in `src/lib/featuredDelivery.ts`: the most recently completed order with a high health impact score (3 or more), a known suburb and a recipient type listed in `RECIPIENT_PHRASES`. It then fetches that order's items and tracking and shows the date, the kind of recipient and place, the items, its health and environmental impact, and the route map, ending with a link down to the donate section. The section is left out if no order qualifies or a fetch fails.

The recipient's name is never shown. The story says "a wildlife rescue in East Lismore, NSW", and the map is given a copy of the tracking with the organisation replaced by the same phrase, so the pin's popup does not name them either. To allow a new recipient type to be featured, add a phrase for it to `RECIPIENT_PHRASES`.

### Our impact (`impactContribution.tsx`)

Server component. Fetches the impact report and renders:

- the intro copy and hero image
- **What it has added up to so far**: stat cards (organisations supplied, items saved from landfill, deliveries made, deliveries made last month). The last-month card is left out when it is zero.
- **Everywhere supplies have reached**: a sentence counting the places in Australia and overseas, and a map with a dot for each place in `byLocation`, sized by the number of items it received, plus a dot for Medical Pantry. A dot's popup gives the place, deliveries and items, never the recipient's name. A place counts as Australian when its state is an Australian state code, since `byLocation` has no country. Hidden if no place has coordinates.
- **How much these deliveries matter to care**: orders at each health impact score. Hidden if no order is scored.
- **See the full numbers**: a closed-by-default toggle holding the detail for visitors who want it:
  - **Which supplies save the most emissions**: each item category's share of CO₂e avoided, largest first. Hidden if no category has any CO₂e avoided.
  - **Month by month**: `ImpactOverTimeChart` from `src/components/charts/charts.tsx`. Hidden if there is no monthly data.

The chart shows the 12 months up to the latest month with data, with empty months as zero. The buttons switch between CO₂e avoided, weight diverted and donations. Hovering or focusing a column shows its value just above the bar, and "View as table" gives the same numbers as a table.

### Donate (`donateCta.tsx`)

Server component, after the impact section. A short case for giving (volunteer-run, $1 → $350+ of supplies), three example amounts with the value of supplies each puts back into use (from `SUPPLIES_PER_DOLLAR`), and a `Donate now` button. The amounts are illustrative only; they do not preselect anything on GiveNow.

### Donate links

Every donate link goes through `DonateButton` / `donateHref` in `src/components/ui/donate.tsx`, which adds `utm_source=pantrypulse`, `utm_medium=website` and `utm_content=<placement>` (`header`, `hero`, `closing`, `sticky` or `tracker`) so GiveNow's referral data shows which button was clicked. Add a new placement to `DonatePlacement` rather than linking to GiveNow directly.

`StickyDonate` is a floating button in the bottom-right corner. It shows once the visitor has scrolled past the header and hides while any element marked `data-hide-sticky-donate` (the header, the hero and the donate section) is on screen.

### Follow a delivery (`trackImpact.tsx`)

Client component. The visitor enters an order number, and the donation and its tracking details are fetched together. The result is laid out like the featured delivery, using the same pieces from `src/components/delivery/delivery.tsx` (`DeliveryItemList` and `DeliveryImpactStats`):

- the order number and its status, and a heading naming the recipient ("Delivered to …", or "Being prepared for …" while the order is open) with its suburb and region
- **Timeline**: the order placed and delivered stages as dots on a line, with their dates
- **What was in it**: the items, largest quantity first
- **Impact cards**: the health rating on a Low / Medium / High scale (below 2, 2 to under 3, 3 and above) with the score out of 4, the weight kept out of landfill and the CO₂e avoided. Before an order is completed these show as pending.
- **Map**: the route from Medical Pantry to the recipient (`TrackingMap` in `src/components/maps`)
- a short donate prompt under the results

Below the results, **How we calculate impact** is a closed toggle holding two cards: the four health tiers with their scores, and the three environmental formulas. The "How we calculate these figures" link under a tracked order opens it and scrolls to it.

A visitor without an order number can open the **Don't have an order number?** panel (`browseOrders.tsx`) under the search box. It lists orders five at a time, newest first, through `listDonations` in `src/lib/api/client.ts`, and can be narrowed by creation date range, state and status. Filters apply as soon as they change; there is no apply button. Above the list, a row of figures totals the selection (orders, deliveries, items, CO₂e avoided and locations reached) from `getImpactReport` with the same filters. Those impact figures only count completed orders to external recipients, so "delivered" can be lower than the number of orders, and they are left out when the status filter is Open. Each row shows the order's destination (suburb and state) and the kind of recipient, not the organisation's name, because publishing a browsable list of recipient names has not been agreed with the client. Choosing **Track** on a row loads that order exactly as if its number had been typed in. The filter form sends dates as full timestamps, so `toDonationFilters` moves the end date to the end of its day; otherwise orders created during that day would be left out.

The map marks the recipient with a 1.1 km circle rather than an exact point, because the API rounds recipient coordinates. The Leaflet map is loaded in the browser only (`osmRouteMapLoader.tsx`), since Leaflet cannot render on the server.

## Styling

- Brand colours, the font and heading sizes are Tailwind theme tokens at the top of `src/app/globals.css` (`brand-red`, `brand-blue`, `surface-cream`), usable as classes such as `bg-brand-red`.
- The header and the tracking section are styled with Tailwind classes in the markup.
- The impact section and the chart use named classes (`impact-contribution__*`, `impact-breakdown__*`, `impact-over-time__*`) defined in `globals.css`.
- Images live in `public/images`; their paths are listed in `IMAGES` in `statsData.ts`.

## Things to know

- Format numbers with `formatWeight` and `formatCategory` from `src/lib/format.ts`, not `toLocaleString()` with the default locale. The server and the browser can format differently, which causes a hydration error.
- `redistribution.tsx` is an empty placeholder and `layout.tsx` in this folder is a pass-through; neither affects the page yet.
