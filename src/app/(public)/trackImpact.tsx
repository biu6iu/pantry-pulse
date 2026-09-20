"use client";

import { FormEvent, useState } from "react";
import { TrackingMap } from "@/components/maps/maps";

export default function TrackYourImpact() {
  const [input, setInput] = useState("");
  const [donationId, setDonationId] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = input.trim();
    if (!id) return;
    setDonationId(id);
  }

  return (
    <section>
      <div className="bg-[#2a7d9d] px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-3xl font-extrabold uppercase tracking-wide text-white">
            Track Your Impact
          </h2>

          <form onSubmit={onSubmit} className="rounded-2xl bg-white p-4 md:p-5">
            <div className="flex flex-col gap-3 rounded-full bg-[#e8eaee] p-2 pl-5 sm:flex-row sm:items-center">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Enter tracking number(s)"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-[#c4453a] px-8 py-2.5 text-sm font-semibold text-white"
              >
                Track
              </button>
            </div>
          </form>
        </div>
      </div>

      {donationId ? (
        <div className="bg-[#d7e3ec]">
          <TrackingMap donationId={donationId} />
        </div>
      ) : null}

      <div className="h-10 bg-[#2a7d9d]" />
    </section>
  );
}