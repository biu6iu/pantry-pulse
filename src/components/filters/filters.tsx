"use client";

import { useId } from "react";
import { FilterValues, STATE_OPTIONS, STATUS_OPTIONS, countActiveFilters } from "./filterValues";

const LABEL_CLASS = "mb-2 block text-sm font-medium text-slate-700";
const CONTROL_CLASS =
  "w-full rounded-full bg-[#e8eaee] px-4 py-2.5 text-sm text-[#141a43] outline-none focus-visible:ring-2 focus-visible:ring-[#2a7d9d]";

interface DonationFilterBarProps {
  values: FilterValues;
  onChange: (values: FilterValues) => void; // called on every change; there is no separate apply step
  onClear: () => void;
  error?: string | null;
}

/* the date, state and status controls for narrowing a list of orders; it holds no data of its own */
export function DonationFilterBar({ values, onChange, onClear, error = null }: DonationFilterBarProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hasFilters = countActiveFilters(values) > 0;

  return (
    <div role="group" aria-label="Filter orders" aria-describedby={error ? errorId : undefined}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor={`${id}-from`} className={LABEL_CLASS}>
            From
          </label>
          <input
            id={`${id}-from`}
            type="date"
            value={values.from}
            max={values.to || undefined}
            onChange={(event) => onChange({ ...values, from: event.target.value })}
            aria-invalid={Boolean(error)}
            className={CONTROL_CLASS}
          />
        </div>

        <div>
          <label htmlFor={`${id}-to`} className={LABEL_CLASS}>
            To
          </label>
          <input
            id={`${id}-to`}
            type="date"
            value={values.to}
            min={values.from || undefined}
            onChange={(event) => onChange({ ...values, to: event.target.value })}
            aria-invalid={Boolean(error)}
            className={CONTROL_CLASS}
          />
        </div>

        <div>
          <label htmlFor={`${id}-state`} className={LABEL_CLASS}>
            State
          </label>
          <select
            id={`${id}-state`}
            value={values.state}
            onChange={(event) => onChange({ ...values, state: event.target.value })}
            className={CONTROL_CLASS}
          >
            <option value="">All states</option>
            {STATE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${id}-status`} className={LABEL_CLASS}>
            Status
          </label>
          <select
            id={`${id}-status`}
            value={values.status}
            onChange={(event) => onChange({ ...values, status: event.target.value as FilterValues["status"] })}
            className={CONTROL_CLASS}
          >
            <option value="">Any status</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <p id={errorId} role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {hasFilters ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-3 text-sm font-semibold text-[#2a7d9d] underline underline-offset-2 hover:text-[#141a43] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Clear filters
        </button>
      ) : null}
    </div>
  );
}
