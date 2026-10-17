"use client";

import { FormEvent, useRef, useState } from "react";
import { getDonation, getTracking } from "@/lib/api/client";
import type { DonationDTO } from "@/lib/dto/donation.dto";
import type { TrackingDTO, TrackingStage, TrackingStageDTO } from "@/lib/dto/tracking.dto";
import type { DonationStatus } from "@/lib/models/donationStatus";
import { TrackingMap } from "@/components/maps/maps";
import { DeliveryImpactStats, DeliveryItemList } from "@/components/delivery/delivery";
import { StatusPill } from "@/components/donations/donations";
import { BUTTON_MOTION_CLASS } from "@/components/ui/buttonStyles";
import { DonateButton } from "@/components/ui/donate";
import { formatDate } from "@/lib/format";
import { regionName } from "@/lib/regionNames";
import BrowseOrders from "./browseOrders";

// API healthImpact.score is a quantity-weighted average of item scores.
// Item score = 5 − healthImpactTier, and tiers are 1 (highest) … 4 (lowest), so score is ~1–4.
function healthRating(donation: DonationDTO | null): { label: string; detail?: string } {
  if (!donation) return { label: "Not available" };
  if (donation.status !== "COMPLETED") return { label: "Pending", detail: "once delivered" };
  if (!donation.healthImpact) return { label: "Not recorded" };

  const score = donation.healthImpact.score;
  const detail = `${score.toLocaleString("en-AU", { maximumFractionDigits: 1 })} out of 4`;
  if (score >= 3) return { label: "High", detail };
  if (score >= 2) return { label: "Medium", detail };
  return { label: "Low", detail };
}

// the heading's verb follows the order's progress
const HEADING_VERBS: Record<DonationStatus, string> = {
  COMPLETED: "Delivered to",
  OPEN: "Being prepared for",
  UNKNOWN: "Sent to",
};

const STAGE_LABELS: Record<TrackingStage, string> = {
  CREATED: "Order placed",
  COMPLETED: "Delivered",
};

/* the order's stages as dots on a line, filled in once each is complete */
function DeliveryTimeline({ timeline }: { timeline: TrackingStageDTO[] }) {
  return (
    <ol className="flex items-start">
      {timeline.map((stage, index) => {
        const next = timeline[index + 1];
        return (
          <li key={stage.stage} className="flex-1 last:flex-none">
            <div className="flex items-center" aria-hidden="true">
              <span
                className={`h-4 w-4 shrink-0 rounded-full ${
                  stage.complete ? "bg-brand-blue" : "border-2 border-slate-300 bg-white"
                }`}
              />
              {next ? (
                <span className={`mx-2 h-0.5 flex-1 ${next.complete ? "bg-brand-blue" : "bg-slate-300"}`} />
              ) : null}
            </div>
            <p className="mt-2 pr-4 font-semibold">{STAGE_LABELS[stage.stage] ?? stage.label}</p>
            <p className="text-sm text-slate-600">
              {stage.complete && stage.occurredAt ? formatDate(stage.occurredAt) : "Not yet"}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

/* one looked-up order, laid out like the featured delivery near the top of the page */
function TrackedOrder({
  donation,
  tracking,
}: {
  donation: DonationDTO | null;
  tracking: TrackingDTO | null;
}) {
  const id = tracking?.id ?? donation?.id;
  const status = tracking?.status ?? donation?.status ?? "UNKNOWN";
  const recipient = tracking?.receiver.organisation ?? donation?.receiver.organisation ?? "the recipient";
  const place = tracking
    ? [tracking.receiver.city, regionName(tracking.receiver.state)].filter(Boolean).join(", ")
    : "";
  const health = healthRating(donation);
  const impact = donation?.environmentalImpact;

  return (
    <div className="grid items-start gap-10 lg:grid-cols-2">
      <div>
        <p className="flex flex-wrap items-center gap-3 text-sm font-semibold uppercase tracking-wide text-brand-red">
          Order {id}
          <StatusPill status={status} />
        </p>
        <h3 className="mt-3 text-[clamp(1.6rem,2.6vw,2.4rem)] font-bold leading-[1.15] tracking-[-0.03em]">
          {HEADING_VERBS[status]} {recipient}
        </h3>
        {place ? <p className="mt-1 text-lg text-brand-blue/80">{place}</p> : null}

        {tracking ? (
          <div className="mt-6">
            <DeliveryTimeline timeline={tracking.timeline} />
          </div>
        ) : null}

        {donation && donation.items.length > 0 ? (
          <>
            <p className="mt-8 font-semibold">What was in it</p>
            <div className="mt-2">
              <DeliveryItemList items={donation.items} />
            </div>
          </>
        ) : null}

        <div className="mt-8">
          <DeliveryImpactStats
            health={health.label}
            healthDetail={health.detail}
            weightKg={impact?.weightDivertedKg ?? null}
            co2eKg={impact?.co2eAvoidedKg ?? null}
            emptyLabel={status === "COMPLETED" ? "Not recorded" : "Pending"}
          />
        </div>

        <a
          href="#how-we-measure"
          className="mt-4 inline-block text-sm font-semibold text-brand-red underline underline-offset-4 hover:no-underline"
        >
          How we calculate these figures
        </a>
      </div>

      <div className="min-w-0">
        <TrackingMap tracking={tracking} />
      </div>
    </div>
  );
}

// shown under a tracked order, while the visitor is looking at one delivery's difference
function DonateNudge() {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl bg-brand-blue p-6 text-white sm:flex-row sm:items-center sm:justify-between">
      <p className="text-lg font-semibold">
        This delivery was made possible by donors. Help fund the next one.
      </p>
      <DonateButton placement="tracker" className="shrink-0" />
    </div>
  );
}

export default function TrackYourImpact() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [donation, setDonation] = useState<DonationDTO | null>(null);
  const [tracking, setTracking] = useState<TrackingDTO | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = input.trim();

    if (!id) {
      setError("Enter an order number to search.");
      setDonation(null);
      setTracking(null);
      return;
    }

    void trackOrder(id);
  }

  // an order picked from the browse list is tracked the same way as one typed into the search box
  function onTrackFromList(id: string) {
    setInput(id);
    void trackOrder(id);
  }

  // Looks up an order and, once it is found, scrolls down to it. A miss leaves the page where it is,
  // so the error stays in view under the search box.
  async function trackOrder(id: string) {
    if (await fetchOrder(id)) {
      // wait a frame so the results have rendered before measuring where they are
      requestAnimationFrame(() => {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        resultsRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      });
    }
  }

  // true when the order was found
  async function fetchOrder(id: string): Promise<boolean> {
    setLoading(true);
    setError(null);
    setDonation(null);
    setTracking(null);

    try {
      const [donationResult, trackingResult] = await Promise.all([
        getDonation(id),
        getTracking(id),
      ]);

      if (!donationResult && !trackingResult) {
        setError(`No order found for “${id}”. Check the number and try again.`);
        return false;
      }

      setDonation(donationResult);
      setTracking(trackingResult);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed. Try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  const searched = donation !== null || tracking !== null;

  return (
    <section id="track" className="bg-surface-cream px-6 py-16 font-sans text-brand-blue">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-red">Already part of the network?</p>
          <h2 className="mt-2 text-[clamp(1.9rem,3.4vw,3.4rem)] font-bold leading-[1.1] tracking-[-0.04em]">
            Follow a delivery
          </h2>
          <p className="mt-4 text-[clamp(1rem,1.5vw,1.25rem)] text-brand-blue/85">
            Enter your order number, then see where it went and the difference it made.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-3xl">
          <form onSubmit={onSubmit} className="rounded-2xl bg-white p-4 shadow-sm md:p-5">
            <label htmlFor="order-number" className="mb-2 block text-sm font-medium text-slate-700">
              Order number
            </label>
            <div className="flex flex-col gap-3 rounded-full border border-brand-blue/15 bg-brand-blue/[0.06] p-2 pl-5 sm:flex-row sm:items-center">
              <input
                id="order-number"
                type="search"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="e.g. D000"
                autoComplete="off"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "order-search-error" : undefined}
                className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className={`rounded-full bg-brand-red px-8 py-2.5 text-sm font-semibold text-white hover:bg-[#A61C1F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-70 disabled:hover:bg-brand-red ${BUTTON_MOTION_CLASS}`}
              >
                {loading ? "Searching…" : "Track"}
              </button>
            </div>
            {error ? (
              <p id="order-search-error" role="alert" className="mt-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
          </form>

          <BrowseOrders onTrack={onTrackFromList} />
        </div>

        <div ref={resultsRef} className="scroll-mt-6">
          {searched ? (
            <div className="mt-14 space-y-8">
              <TrackedOrder donation={donation} tracking={tracking} />
              <DonateNudge />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
