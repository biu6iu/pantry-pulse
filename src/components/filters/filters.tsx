"use client";

import { useId } from "react";
import { DateField } from "./dateField";
import {
  CountryOption,
  FilterValues,
  STATUS_OPTIONS,
  countActiveFilters,
  regionOptionsForCountry,
} from "./filterValues";

const LABEL_CLASS = "mb-2 block text-sm font-medium text-slate-700";
const CONTROL_CLASS =
  "w-full rounded-full border border-brand-blue/15 bg-brand-blue/[0.06] px-5 py-2.5 text-sm text-[#141a43] outline-none focus-visible:ring-2 focus-visible:ring-brand-blue disabled:cursor-not-allowed disabled:opacity-60";

// A drawn arrow in place of the browser's own, which sits hard against the right edge and can't be moved
const SELECT_CLASS = `${CONTROL_CLASS} appearance-none bg-no-repeat pr-11`;
const SELECT_STYLE = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5l5 5 5-5' stroke='%23141a43' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
  backgroundPosition: "right 1.25rem center",
} as const;

interface DonationFilterBarProps {
  values: FilterValues;
  onChange: (values: FilterValues) => void; // called on every change; there is no separate apply step
  onClear: () => void;
  countries?: CountryOption[]; // the countries orders were delivered to, built from the data
  regions?: Record<string, string[]>; // for each country, the regions orders were delivered to
  error?: string | null;
}

/* the date, country, region and status controls for narrowing a list of orders; it holds no data of its own */
export function DonationFilterBar({
  values,
  onChange,
  onClear,
  countries = [],
  regions = {},
  error = null,
}: DonationFilterBarProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hasFilters = countActiveFilters(values) > 0;
  // the region control is always shown so the row doesn't jump; it only has choices once a country is picked
  const regionOptions = regionOptionsForCountry(values.country, regions);

  return (
    <div role="group" aria-label="Filter orders" aria-describedby={error ? errorId : undefined}>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))] gap-4">
        <div>
          <label htmlFor={`${id}-from`} className={LABEL_CLASS}>
            From
          </label>
          <DateField
            id={`${id}-from`}
            label="From"
            value={values.from}
            max={values.to || undefined}
            onChange={(from) => onChange({ ...values, from })}
            invalid={Boolean(error)}
            className={CONTROL_CLASS}
          />
        </div>

        <div>
          <label htmlFor={`${id}-to`} className={LABEL_CLASS}>
            To
          </label>
          <DateField
            id={`${id}-to`}
            label="To"
            value={values.to}
            min={values.from || undefined}
            onChange={(to) => onChange({ ...values, to })}
            invalid={Boolean(error)}
            className={CONTROL_CLASS}
          />
        </div>

        <div>
          <label htmlFor={`${id}-country`} className={LABEL_CLASS}>
            Country
          </label>
          <select
            id={`${id}-country`}
            value={values.country}
            // a region belongs to one country, so it is cleared when the country changes
            onChange={(event) => onChange({ ...values, country: event.target.value, state: "" })}
            className={SELECT_CLASS}
            style={SELECT_STYLE}
          >
            <option value="">All countries</option>
            {countries.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${id}-state`} className={LABEL_CLASS}>
            Region
          </label>
          <select
            id={`${id}-state`}
            value={values.state}
            disabled={regionOptions.length === 0}
            onChange={(event) => onChange({ ...values, state: event.target.value })}
            className={SELECT_CLASS}
            style={SELECT_STYLE}
          >
            <option value="">{values.country ? "All regions" : "Pick a country"}</option>
            {regionOptions.map((option) => (
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
            className={SELECT_CLASS}
            style={SELECT_STYLE}
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
          className="mt-3 text-sm font-semibold text-brand-red underline underline-offset-2 hover:text-[#141a43] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Clear filters
        </button>
      ) : null}
    </div>
  );
}
