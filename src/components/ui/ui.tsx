
'use client';

import {STATS} from '../statsData'


export function StatsBanner() {
  return (
    <div className="marquee-banner-style">
      <div className="marquee-track">
        {STATS.map((s) => (
          <span key={s}>{s}</span>
        ))}
        {STATS.map((s) => (
          <span key={`${s}-dup`} aria-hidden="true">{s}</span>
        ))}
      </div>
    </div>
  );
}

type ImageOverlay = {
  text: string;
  top?: string;      // CSS value, e.g. '40%' or '20px'
  left?: string;
  right?: string;
  bottom?: string;
  fontSize?: string; // CSS value, e.g. '1.5rem' or '32px'
};

export function ImageBanner({
  src,
  alt,
  overlay,
  height = '400px',
}: {
  src: string;
  alt: string;
  overlay?: ImageOverlay | ImageOverlay[];
  height?: string;
}) {
  const overlays = overlay ? (Array.isArray(overlay) ? overlay : [overlay]) : [];

  return (
    <div className="relative overflow-hidden" style={{ height }}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      {overlays.map((o, i) => (
        <span
          key={i}
          className="absolute text-white font-bold drop-shadow-lg"
          style={{
            top: o.top,
            left: o.left,
            right: o.right,
            bottom: o.bottom,
            fontSize: o.fontSize ?? '1.5rem',
          }}
        >
          {o.text}
        </span>
      ))}
    </div>
  )
}


/* impact and contribution components*/

/* redistribution components*/

/* impact and contribution components*/

/* redistribution components*/