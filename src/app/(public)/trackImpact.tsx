"use client";

import { FormEvent, useState } from "react";
import { getDonation, getTracking } from "@/lib/api/client";
import type { DonationDTO } from "@/lib/dto/donation.dto";
import type { TrackingDTO } from "@/lib/dto/tracking.dto";
import { TrackingMap } from "@/components/maps/maps";

function healthTier(donation: DonationDTO): string {
  if (donation.status !== "COMPLETED") {
    return "Pending (order not completed)";
  }
  if (!donation.healthImpact) {
    return "Not recorded";
  }
  const score = donation.healthImpact.score;
  if (score >= 15) return `High (score ${score})`;
  if (score >= 5) return `Medium (score ${score})`;
  return `Low (score ${score})`;
}

function destinationText(tracking: TrackingDTO): string {
  const receiver = tracking.receiver;
  const place = [receiver.city, receiver.state, receiver.country]
    .filter(Boolean)
    .join(", ");
  return place ? `${receiver.organisation} — ${place}` : receiver.organisation;
}

function formatWhen(iso: string | null): string {
  if (!iso) return "Not yet";
  return new Date(iso).toLocaleDateString();
}

export default function TrackYourImpact() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [donation, setDonation] = useState<DonationDTO | null>(null);
  const [tracking, setTracking] = useState<TrackingDTO | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = input.trim();

    if (!id) {
      setError("Enter an order number to search.");
      setDonation(null);
      setTracking(null);
      return;
    }

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
                placeholder="e.g. #TEST-A1"
                autoComplete="off"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "order-search-error" : undefined}
                className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#2a7d9d]"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-[#c4453a] px-8 py-2.5 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-70"
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
        </div>
      </div>

      {searched ? (
        <div className="bg-[#d7e3ec] px-6 py-10">
          <div className="mx-auto max-w-4xl space-y-6 text-[#141a43]">
            <h3 className="text-2xl font-bold">Order {tracking?.id ?? donation?.id}</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-xl bg-white p-4">
                <h4 className="text-sm font-semibold uppercase">Health impact</h4>
                <p className="mt-2 text-lg font-bold">
                  {donation ? healthTier(donation) : "Not available"}
                </p>
              </article>

              <article className="rounded-xl bg-white p-4">
                <h4 className="text-sm font-semibold uppercase">Environmental impact</h4>
                <p className="mt-2 text-lg font-bold">
                  {donation?.environmentalImpact
                    ? `${donation.environmentalImpact.estimatedCO2Saved} kg CO₂ emissions reduced`
                    : "Not recorded"}
                </p>
              </article>

              <article className="rounded-xl bg-white p-4 sm:col-span-2">
                <h4 className="text-sm font-semibold uppercase">Recipient and destination</h4>
                <p className="mt-2">
                  {tracking ? destinationText(tracking) : donation?.receiver.organisation ?? "Not available"}
                </p>
              </article>
            </div>

            {tracking ? (
              <article className="rounded-xl bg-white p-4">
                <h4 className="text-sm font-semibold uppercase">Delivery status</h4>
                <p className="mt-2 font-bold">{tracking.status}</p>
                <ol className="mt-3 list-decimal space-y-1 pl-5">
                  {tracking.timeline.map((stage) => (
                    <li key={stage.stage}>
                      {stage.label}
                      {stage.complete ? " — complete" : " — not complete"} ({formatWhen(stage.occurredAt)})
                    </li>
                  ))}
                </ol>
              </article>
            ) : null}

            {tracking ? <TrackingMap tracking={tracking} /> : null}
          </div>
        </div>
      ) : null}

      <div className="h-10 bg-[#2a7d9d]" />
    </section>
  );
}
