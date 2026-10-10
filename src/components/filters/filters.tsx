"use client";

import { FormEvent, useId } from "react";
import { FilterValues, STATE_OPTIONS, STATUS_OPTIONS, countActiveFilters } from "./filterValues";

const LABEL_CLASS = "mb-2 block text-sm font-medium text-slate-700";
const CONTROL_CLASS =
  "w-full rounded-full bg-[#e8eaee] px-4 py-2.5 text-sm text-[#141a43] outline-none focus-visible:ring-2 focus-visible:ring-[#2a7d9d]";

interface DonationFilterBarProps {
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onApply: () => void;
  onReset: () => void;
  loading?: boolean;
  error?: string | null;
}

/* the date, state and status controls for narrowing a list of orders; it holds no data of its own */
export function DonationFilterBar({
  values,
  onChange,
  onApply,
  onReset,
  loading = false,
  error = null,
}: DonationFilterBarProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const activeCount = countActiveFilters(values);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onApply();
  }

  return (
    <form onSubmit={onSubmit} aria-describedby={error ? errorId : undefined}>
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

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-[#D02327] px-8 py-2.5 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-70"
        >
          {loading ? "Searching…" : "Apply filters"}
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={loading || activeCount === 0}
          className="rounded-full border border-slate-300 px-6 py-2.5 text-sm font-semibold text-[#141a43] hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
        >
          Reset
        </button>
        <p className="text-sm text-slate-600" aria-live="polite">
          {activeCount === 0 ? "No filters applied" : `${activeCount} filter${activeCount === 1 ? "" : "s"} selected`}
        </p>
      </div>
    </form>
  );
}
