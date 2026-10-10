"use client";

import type { DonationSummaryDTO } from "@/lib/dto/donationSummary.dto";
import type { DonationStatus } from "@/lib/models/donationStatus";
import { formatCategory, formatDate } from "@/lib/format";

const STATUS_LABELS: Record<DonationStatus, string> = {
  COMPLETED: "Completed",
  OPEN: "Open",
  UNKNOWN: "Unknown",
};

const STATUS_CLASSES: Record<DonationStatus, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-900",
  OPEN: "bg-amber-100 text-amber-900",
  UNKNOWN: "bg-slate-200 text-slate-700",
};

const HEADER_CELL_CLASS = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600";
const PAGE_BUTTON_CLASS =
  "rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-[#141a43] hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50";

function StatusPill({ status }: { status: DonationStatus }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${STATUS_CLASSES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

// The list says where an order went and to what kind of recipient, not who received it:
// a public, browsable list of every recipient's name has not been agreed with the client
function Destination({ receiver }: { receiver: DonationSummaryDTO["receiver"] }) {
  const place = [receiver.city, receiver.state].filter(Boolean).join(", ");
  const type = receiver.type && receiver.type !== "unknown" ? formatCategory(receiver.type) : null;

  return (
    <>
      <span className="block">{place || "Not recorded"}</span>
      {type ? <span className="block text-xs text-slate-500">{type}</span> : null}
    </>
  );
}

interface DonationResultsTableProps {
  items: DonationSummaryDTO[];
  total: number; // every order matching the filters, not just this page
  page: number; // zero-based
  pageSize: number;
  onPageChange: (page: number) => void;
  onTrack: (id: string) => void;
  loading?: boolean;
}

/* one page of orders with a button to track each; the caller fetches the data and owns the paging */
export function DonationResultsTable({
  items,
  total,
  page,
  pageSize,
  onPageChange,
  onTrack,
  loading = false,
}: DonationResultsTableProps) {
  if (total === 0) {
    return (
      <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-600" role="status">
        No orders match these filters. Try a wider date range, or clear the filters.
      </p>
    );
  }

  const pageCount = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[520px] border-collapse text-sm text-[#141a43]">
          <caption className="sr-only">Orders matching the selected filters</caption>
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className={HEADER_CELL_CLASS}>Order</th>
              <th scope="col" className={HEADER_CELL_CLASS}>Created</th>
              <th scope="col" className={HEADER_CELL_CLASS}>Destination</th>
              <th scope="col" className={HEADER_CELL_CLASS}>Status</th>
              <th scope="col" className={HEADER_CELL_CLASS}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((donation) => (
              <tr key={donation.id} className="border-t border-slate-200">
                <th scope="row" className="px-4 py-3 text-left font-bold">{donation.id}</th>
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(donation.dateCreated)}</td>
                <td className="px-4 py-3"><Destination receiver={donation.receiver} /></td>
                <td className="px-4 py-3"><StatusPill status={donation.status} /></td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onTrack(donation.id)}
                    disabled={loading}
                    aria-label={`Track order ${donation.id}`}
                    className="rounded-full bg-[#141a43] px-5 py-2 text-xs font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-70"
                  >
                    Track
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 ? (
        <nav aria-label="Order results pages" className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={loading || page === 0}
            className={PAGE_BUTTON_CLASS}
          >
            Previous
          </button>
          <p className="text-sm text-slate-600">
            Page {page + 1} of {pageCount}
          </p>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={loading || page >= pageCount - 1}
            className={PAGE_BUTTON_CLASS}
          >
            Next
          </button>
        </nav>
      ) : null}
    </div>
  );
}
