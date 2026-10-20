"use client";

import { useRef, useState } from "react";
import { displayToIsoDate, isoToDisplayDate } from "./filterValues";

interface DateFieldProps {
  id: string;
  label: string; // names the calendar button, e.g. "From"
  value: string; // "YYYY-MM-DD", or "" for not set
  onChange: (value: string) => void; // called with "YYYY-MM-DD" once a full date is typed or picked, "" when cleared
  min?: string;
  max?: string;
  invalid?: boolean;
  className: string;
}

/*
 * A date box that always reads DD/MM/YYYY. A plain <input type="date"> shows the browser's locale order,
 * so visitors with US settings would see MM/DD. The calendar button still opens the browser's own picker.
 */
export function DateField({ id, label, value, onChange, min, max, invalid = false, className }: DateFieldProps) {
  const pickerRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(() => isoToDisplayDate(value));
  const [shownValue, setShownValue] = useState(value);

  // the value changed from outside (the calendar or "Clear filters"), so show it in place of what was typed
  if (value !== shownValue) {
    setShownValue(value);
    setDraft(isoToDisplayDate(value));
  }

  function handleType(text: string) {
    setDraft(text);
    // a half-typed date is left in the box and only passed on once it is complete
    const next = text.trim() === "" ? "" : displayToIsoDate(text);
    if (next === null || next === value) return;
    setShownValue(next);
    onChange(next);
  }

  function openPicker() {
    const picker = pickerRef.current;
    if (!picker) return;
    try {
      picker.showPicker();
    } catch {
      picker.focus();
      picker.click();
    }
  }

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="DD/MM/YYYY"
        maxLength={10}
        value={draft}
        onChange={(event) => handleType(event.target.value)}
        // anything left unfinished goes back to the last full date
        onBlur={() => setDraft(isoToDisplayDate(value))}
        aria-invalid={invalid}
        className={`${className} pr-11`}
      />
      <button
        type="button"
        onClick={openPicker}
        aria-label={`Choose ${label.toLowerCase()} date`}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded text-[#141a43] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="1.75" y="2.75" width="12.5" height="11.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M1.75 6.25h12.5M5 1.25v3M11 1.25v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {/* hidden under the button so the browser's calendar opens beside it */}
      <input
        ref={pickerRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        className="pointer-events-none absolute bottom-0 right-4 h-0 w-0 opacity-0"
      />
    </div>
  );
}
