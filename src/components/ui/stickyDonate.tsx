'use client';

import { useEffect, useState } from 'react';
import { DonateButton } from './donate';

// Floating donate button for visitors who have scrolled past the header. It hides again while any element
// marked with data-hide-sticky-donate (the header and the closing donate section) is on screen, so there
// are never two donate buttons in view at once.
export function StickyDonate() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const targets = document.querySelectorAll('[data-hide-sticky-donate]');
    if (targets.length === 0) return;

    const onScreen = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onScreen.add(entry.target);
        else onScreen.delete(entry.target);
      }
      setVisible(onScreen.size === 0);
    });

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed bottom-5 right-5 z-[1100] transition duration-300 motion-reduce:transition-none ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
      // above the Leaflet map controls; hidden from screen readers and the tab order while invisible
      aria-hidden={!visible}
      inert={!visible}
    >
      <DonateButton placement="sticky" size="lg">
        Donate
      </DonateButton>
    </div>
  );
}
