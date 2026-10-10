"use client";

import { FormEvent, useRef, useState } from "react";
import { getDonation, getTracking } from "@/lib/api/client";
import type { DonationDTO } from "@/lib/dto/donation.dto";
import type { TrackingDTO } from "@/lib/dto/tracking.dto";
import { TrackingMap } from "@/components/maps/maps";
import BrowseOrders from "./browseOrders";

// API healthImpact.score is a quantity-weighted average of item scores.
// Item score = 5 − healthImpactTier, and tiers are 1 (highest) … 4 (lowest), so score is ~1–4.
function healthTier(donation: DonationDTO): string {
  if (donation.status !== "COMPLETED") {
    return "Pending (order not completed)";
  }
  if (!donation.healthImpact) {
    return "Not recorded";
  }
  const score = donation.healthImpact.score;
  if (score >= 3) return "High";
  if (score >= 2) return "Medium";
  return "Low";
}

function healthPinPercent(donation: DonationDTO): number | null {
  if (donation.status !== "COMPLETED" || !donation.healthImpact) return null;
  return Math.min(96, Math.max(4, (donation.healthImpact.score / 4) * 100));
}

function HealthImpactScale({ donation }: { donation: DonationDTO | null }) {
  const label = donation ? healthTier(donation) : "Not available";
  const pinPercent = donation ? healthPinPercent(donation) : null;

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-md">
      <div className="bg-[#D02327] px-4 py-3 text-white">
        <h4 className="text-sm font-semibold uppercase tracking-wide">Health impact</h4>
      </div>
      <div className="p-5">
      <div className="relative mt-2 mb-2 h-10">
        {pinPercent != null ? (
          <div
            className="absolute -top-1 z-10"
            aria-hidden="true"
          >
            <div
              className="h-0 w-0 border-x-8 border-t-[12px] border-x-transparent border-t-[#141a43]"
            />
          </div>
        ) : null}
        <div
          className="absolute bottom-0 h-5 w-full rounded-md"
          style={{
            background:
              "linear-gradient(to right, #141A43, #2e3565, #535a87, #7e84aa, #a8acca)",
          }}
        />
      </div>
      <p className="mt-2 text-lg font-bold">
        {label}
        {donation?.healthImpact ? ` (${donation.healthImpact.score} out of a score of 4)` : ""}
      </p>
      <a
        href="#health-impact-calculation"
        className="mt-1 inline-block text-sm italic text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-[#D02327]"
      >
        See how we calculate health impact*
      </a>
      </div>
    </article>
  );
}

function placeLabel(city: string | null, state: string | null, country: string | null) {
  return [city, state, country].filter(Boolean).join(", ");
}

function formatWhen(iso: string | null): string {
  if (!iso) return "Not yet";
  return new Date(iso).toLocaleDateString();
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true">
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l.93-2.3c.9.08 1.81.12 2.73.12 7 0 11.63-4.18 11.63-9.64 0-2.18-.96-3.98-2.5-5.18C17.9 8.2 17.46 8.08 17 8zm-3.5 6.5c-1.93 0-3.5-1.12-3.5-2.5s1.57-2.5 3.5-2.5 3.5 1.12 3.5 2.5-1.57 2.5-3.5 2.5z" />
    </svg>
  );
}

function PinGlyph() {
  return (
    <span
      className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded-full border-2 border-white bg-[#D02327] shadow"
      aria-hidden="true"
    />
  );
}

function EnvironmentalCard({ donation }: { donation: DonationDTO | null }) {
  const kg = donation?.environmentalImpact?.co2eAvoidedKg;

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-md">
      <div className="flex items-center gap-3 bg-[#1b7a4e] px-4 py-3 text-white">
        <LeafIcon />
        <h4 className="text-sm font-semibold uppercase tracking-wide">Environmental impact</h4>
      </div>
      <div className="p-5">
        {kg != null ? (
          <>
            <p className="text-4xl font-extrabold leading-none text-[#1b7a4e] md:text-5xl">
              {kg}
              <span className="ml-2 text-lg font-semibold">kg</span>
            </p>
            <p className="mt-2 text-sm text-slate-600">CO₂ emissions kept out of the atmosphere</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-emerald-100" aria-hidden="true">
              <div className="h-full w-4/5 rounded-full bg-[#1b7a4e]" />
            </div>
          </>
        ) : (
          <p className="text-lg font-bold">Not recorded</p>
        )}
      </div>
    </article>
  );
}

function DestinationCard({
  tracking,
  fallbackOrg,
}: {
  tracking: TrackingDTO | null;
  fallbackOrg?: string;
}) {
  const origin = tracking?.origin;
  const receiver = tracking?.receiver;
  const originPlace = origin ? placeLabel(origin.city, origin.state, origin.country) : "";
  const destPlace = receiver ? placeLabel(receiver.city, receiver.state, receiver.country) : "";

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-md sm:col-span-2">
      <div className="bg-[#2a7d9d] px-4 py-3 text-white">
        <h4 className="text-sm font-semibold uppercase tracking-wide">Recipient and destination</h4>
      </div>
      <div className="grid gap-0 sm:grid-cols-[1fr_auto_1fr]">
        <div className="flex gap-3 p-5">
          <PinGlyph />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#2a7d9d]">From</p>
            <p className="text-lg font-bold">{origin?.organisation ?? "Medical Pantry"}</p>
            {originPlace ? <p className="text-sm text-slate-600">{originPlace}</p> : null}
          </div>
        </div>
        <div className="hidden items-center px-2 text-2xl text-[#D02327] sm:flex" aria-hidden="true">
          →
        </div>
        <div className="flex gap-3 border-t border-slate-100 p-5 sm:border-t-0">
          <PinGlyph />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#D02327]">To</p>
            <p className="text-lg font-bold">
              {receiver?.organisation ?? fallbackOrg ?? "Not available"}
            </p>
            {destPlace ? <p className="text-sm text-slate-600">{destPlace}</p> : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function DeliveryStatusCard({ tracking }: { tracking: TrackingDTO }) {
  const allComplete =
    tracking.status === "COMPLETED" || tracking.timeline.every((stage) => stage.complete);
  const completedCount = tracking.timeline.filter((stage) => stage.complete).length;
  const fillPercent = allComplete
    ? 100
    : tracking.timeline.length <= 1
      ? 0
      : Math.max(0, ((completedCount - 1) / (tracking.timeline.length - 1)) * 100);

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-md">
      <div className="flex items-center justify-between bg-[#141a43] px-4 py-3 text-white">
        <h4 className="text-sm font-semibold uppercase tracking-wide">Delivery status</h4>
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">{tracking.status}</span>
      </div>
      <div className="relative p-5">
        <div className="pointer-events-none absolute top-9 right-10 left-10 hidden h-1 sm:block" aria-hidden="true">
          <div className="h-full rounded-full bg-slate-200" />
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[#1b7a4e]"
            style={{ width: `${fillPercent}%` }}
          />
        </div>
        <div
          className="pointer-events-none absolute top-9 bottom-9 left-9 w-1 rounded-full bg-slate-200 sm:hidden"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-9 left-9 w-1 rounded-full bg-[#1b7a4e] sm:hidden"
          style={{ height: `${fillPercent}%` }}
          aria-hidden="true"
        />
        <ol className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
          {tracking.timeline.map((stage, index) => (
            <li key={stage.stage} className="flex flex-1 items-start gap-3 sm:flex-col sm:items-center sm:text-center">
              <span
                className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  stage.complete ? "bg-[#1b7a4e] text-white" : "bg-slate-300 text-slate-600"
                }`}
              >
                {stage.complete ? "✓" : index + 1}
              </span>
              <div>
                <p className="font-bold">{stage.label}</p>
                <p className="text-sm text-slate-600">
                  {stage.complete ? "Complete" : "Not complete"} · {formatWhen(stage.occurredAt)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </article>
  );
}

function HealthImpactMethodology() {
  return (
    <section
      id="health-impact-calculation"
      aria-labelledby="health-impact-calculation-heading"
      className="overflow-hidden rounded-2xl bg-white p-4 shadow-md"
    >
      <div className="-mx-4 -mt-4 mb-6 bg-[#D02327] px-4 py-3">
        <h3
          id="health-impact-calculation-heading"
          className="text-sm font-semibold uppercase tracking-wide text-white"
        >
          *Health Impact Calculation
        </h3>
      </div>
      <p className="mt-4 text-lg font-semibold leading-relaxed text-[#141a43]">
        Calculated by averaging individual health impact scores based on tiered categories.
      </p>
      <div className="mt-8 space-y-7 text-[#141a43]">
        <div>
          <h4 className="text-lg font-bold text-[#2a7d9d]">
            Tier 1: Critical and high impact (immediate life saving and intervention)
          </h4>
          <p className="mt-1 pl-4 text-lg font-semibold">• Health impact score of 4</p>
        </div>
        <div>
          <h4 className="text-lg font-bold text-[#2a7d9d]">
            Tier 2: High to moderate impact (diagnostics and disease monitoring)
          </h4>
          <p className="mt-1 pl-4 text-lg font-semibold">• Health impact score of 3</p>
        </div>
        <div>
          <h4 className="text-lg font-bold text-[#2a7d9d]">
            Tier 3: Moderate impact (infection control and delivery systems)
          </h4>
          <p className="mt-1 pl-4 text-lg font-semibold">• Health impact score of 2</p>
        </div>
        <div>
          <h4 className="text-lg font-bold text-[#2a7d9d]">
            Tier 4: Low-risk, high utility impact (mobility, wound care, and rehabilitation)
          </h4>
          <p className="mt-1 pl-4 text-lg font-semibold">• Health impact score of 1</p>
        </div>
      </div>
      <p className="mt-8 text-lg font-bold leading-relaxed text-[#141a43]">
        The higher the health impact score (out of 4), the higher the health impact.
      </p>
    </section>
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
  async function onTrackFromList(id: string) {
    setInput(id);
    await trackOrder(id);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultsRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  async function trackOrder(id: string) {
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
        return;
      }

      setDonation(donationResult);
      setTracking(trackingResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const searched = donation !== null || tracking !== null;

  return (
    <section>
      <div className="bg-[#2a7d9d] px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-3xl font-extrabold uppercase tracking-wide text-white">
            Track Your Impact
          </h2>

          <form onSubmit={onSubmit} className="rounded-2xl bg-white p-4 md:p-5">
            <label htmlFor="order-number" className="mb-2 block text-sm font-medium text-slate-700">
              Order number
            </label>
            <div className="flex flex-col gap-3 rounded-full bg-[#e8eaee] p-2 pl-5 sm:flex-row sm:items-center">
              <input
                id="order-number"
                type="search"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="e.g. A123"
                autoComplete="off"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "order-search-error" : undefined}
                className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#2a7d9d]"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-[#D02327] px-8 py-2.5 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-70"
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

          <BrowseOrders onTrack={(id) => void onTrackFromList(id)} />
        </div>
      </div>

      <div ref={resultsRef} className="bg-[#d7e3ec] px-6 py-10">
        <div className="mx-auto max-w-4xl space-y-6 text-[#141a43]">
          <TrackingMap tracking={tracking} />

          {searched ? (
            <>
              <h3 className="text-2xl font-bold">Order {tracking?.id ?? donation?.id}</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <HealthImpactScale donation={donation} />
                <EnvironmentalCard donation={donation} />
                <DestinationCard
                  tracking={tracking}
                  fallbackOrg={donation?.receiver.organisation}
                />
              </div>

              {tracking ? (
                <>
                  <DeliveryStatusCard tracking={tracking} />
                  <HealthImpactMethodology />
                </>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      <div className="h-10 bg-[#2a7d9d]" />
    </section>
  );
}
