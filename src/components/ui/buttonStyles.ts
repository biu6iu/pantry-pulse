// Motion shared by every button, so they all feel the same: the pointer becomes a hand, the button lifts
// and gains a shadow on hover, presses down on click, stays still when disabled, and does not move at all
// for visitors who have asked for reduced motion. Each button adds its own hover colour.
export const BUTTON_MOTION_CLASS =
  "cursor-pointer transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95 " +
  "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 " +
  "disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none";
