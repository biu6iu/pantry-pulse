"use client";

import { useId, useRef, useState } from "react";
import { getImpactReport, listDonations } from "@/lib/api/client";
import type { DonationListDTO } from "@/lib/dto/donationSummary.dto";
import type { OverallImpactSummary } from "@/lib/dto/impactReport.dto";
import { DonationFilterBar } from "@/components/filters/filters";
import { DonationResultsTable } from "@/components/donations/donations";
import { ImpactSummary } from "@/components/impact/impact";
import {
  EMPTY_FILTER_VALUES,
  FilterValues,
  toDonationFilters,
  validateFilterValues,
} from "@/components/filters/filterValues";

const PAGE_SIZE = 5;

/* lets a visitor without an order number find one by date, state or status, then track it */
export default function BrowseOrders({ onTrack }: { onTrack: (id: string) => void }) {
  const panelId = useId();
  const latestRequest = useRef(0);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<FilterValues>(EMPTY_FILTER_VALUES);
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<DonationListDTO | null>(null);
  const [summary, setSummary] = useState<OverallImpactSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters apply as soon as they change, so a slow response for older filters must not overwrite newer ones
  async function load(nextValues: FilterValues, nextPage: number, withSummary: boolean) {
    const request = ++latestRequest.current;
    const filters = toDonationFilters(nextValues);
    setLoading(true);
    setError(null);

    try {
      // open orders have no impact figures yet, so there is nothing to total for them
      const wantsSummary = withSummary && nextValues.status !== "OPEN";
      const [list, report] = await Promise.all([
        listDonations({ ...filters, limit: PAGE_SIZE, offset: nextPage * PAGE_SIZE }),
        wantsSummary ? getImpactReport(filters) : null,
      ]);
      if (request !== latestRequest.current) return;

      setResult(list ?? { items: [], total: 0 });
      setPage(nextPage);
      if (withSummary) setSummary(report?.overall ?? null);
    } catch (err) {
      if (request !== latestRequest.current) return;
      setError(err instanceof Error ? err.message : "Couldn't load orders. Try again.");
    } finally {
      if (request === latestRequest.current) setLoading(false);
    }
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    // the first time the panel opens, show the most recent orders straight away
    if (next && result === null) void load(values, 0, true);
  }

  function change(nextValues: FilterValues) {
    setValues(nextValues);

    const problem = validateFilterValues(nextValues);
    if (problem) {
      setError(problem);
      return;
    }
    void load(nextValues, 0, true);
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
        <div id={panelId} className="space-y-5 border-t border-slate-200 p-4 md:p-5" aria-busy={loading}>
          <DonationFilterBar
            values={values}
            onChange={change}
            onClear={() => change(EMPTY_FILTER_VALUES)}
            error={error}
          />

          {result ? (
            <>
              <ImpactSummary totalOrders={result.total} summary={summary} />
              <DonationResultsTable
                items={result.items}
                total={result.total}
                page={page}
                pageSize={PAGE_SIZE}
                onPageChange={(nextPage) => void load(values, nextPage, false)}
                onTrack={onTrack}
                loading={loading}
              />
            </>
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
