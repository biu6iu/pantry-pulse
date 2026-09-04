
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


/* impact and contribution components*/

/* redistribution components*/

/* impact and contribution components*/

/* redistribution components*/