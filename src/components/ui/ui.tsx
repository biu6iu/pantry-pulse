
'use client';

import { useEffect, useState } from 'react';

const PHRASES = ['reduce waste', 'redistribute supplies', 'support communities'];

export default function RotatingText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = setInterval(() => {
      setIndex((i) => (i + 1) % PHRASES.length);
    }, 3000);

    return () => clearInterval(id);
  }, []);

  return (
    <span className="inline-block" aria-hidden="true">
      <span key={index} className="inline-block animate-fade">
        {PHRASES[index]}
      </span>
    </span>
  );
}
/* impact and contribution components*/

/* redistribution components*/

/* impact and contribution components*/

/* redistribution components*/