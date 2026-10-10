"use client";

import { useId, useState } from "react";
import { listDonations } from "@/lib/api/client";
import type { DonationListDTO } from "@/lib/dto/donationSummary.dto";
import { DonationFilterBar } from "@/components/filters/filters";
import { DonationResultsTable } from "@/components/donations/donations";
import {
  EMPTY_FILTER_VALUES,
  FilterValues,
  toDonationFilters,
  validateFilterValues,
} from "@/components/filters/filterValues";

const PAGE_SIZE = 10;

/* lets a visitor without an order number find one by date, state or status, then track it */
export default function BrowseOrders({ onTrack }: { onTrack: (id: string) => void }) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<FilterValues>(EMPTY_FILTER_VALUES); // what the form shows
  const [applied, setApplied] = useState<FilterValues>(EMPTY_FILTER_VALUES); // what the list was fetched with
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<DonationListDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(nextValues: FilterValues, nextPage: number) {
    setLoading(true);
    setError(null);

    try {
      const data = await listDonations({
        ...toDonationFilters(nextValues),
        limit: PAGE_SIZE,
        offset: nextPage * PAGE_SIZE,
      });
      setResult(data ?? { items: [], total: 0 });
      setApplied(nextValues);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load orders. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    // the first time the panel opens, show the most recent orders straight away
    if (next && result === null) void load(applied, 0);
  }

  function apply() {
    const problem = validateFilterValues(values);
    if (problem) {
      setError(problem);
      return;
    }
    void load(values, 0);
  }

  function reset() {
    setValues(EMPTY_FILTER_VALUES);
    void load(EMPTY_FILTER_VALUES, 0);
  }

  return (
    <div className="mt-4 overflow-hidden rounded-2xl bg-white">
      <h3>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-4 p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 md:p-5"
        >
          <span>
            <span className="block text-sm font-semibold uppercase tracking-wide text-[#141a43]">
              Browse orders
            </span>
            <span className="mt-1 block text-sm font-normal text-slate-600">
              No order number? Find an order by date, state or status.
            </span>
          </span>
          <span aria-hidden="true" className={`text-xl text-[#141a43] transition-transform ${open ? "rotate-180" : ""}`}>
            ▾
          </span>
        </button>
      </h3>

      {open ? (
        <div id={panelId} className="space-y-6 border-t border-slate-200 p-4 md:p-5">
          <DonationFilterBar
            values={values}
            onChange={setValues}
            onApply={apply}
            onReset={reset}
            loading={loading}
            error={error}
          />

          {result ? (
            <DonationResultsTable
              items={result.items}
              total={result.total}
              page={page}
              pageSize={PAGE_SIZE}
              onPageChange={(nextPage) => void load(applied, nextPage)}
              onTrack={onTrack}
              loading={loading}
            />
          ) : loading ? (
            <p className="text-sm text-slate-600" role="status">
              Loading orders…
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
