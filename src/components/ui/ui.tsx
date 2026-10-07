
'use client';

import {STATS} from '../statsData'
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

/* counts from 0 up to `target` once the element scrolls into view */
function useCountUp<T extends Element>(target: number, duration = 1500) {
  const ref = useRef<T>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();

      // skip the animation for users who turned on the reduce motion setting
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setValue(target);
        return;
      }

      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out
        setValue(target * eased);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target, duration]);

  return [ref, value] as const;
}

type CountUpProps = {
  value: number;
  suffix?: string;   // e.g. '%'
  duration?: number; // ms
};

export function CountUp({ value, suffix = '', duration }: CountUpProps) {
  const [ref, current] = useCountUp<HTMLSpanElement>(value, duration);

  return (
    <span ref={ref}>
      {Math.round(current).toLocaleString()}
      {suffix}
    </span>
  );
}


export function StatsBanner({ stats = STATS }: { stats?: string[] }) {
  return (
    <div className="marquee-banner-style">
      <div className="marquee-track">
        {/* two identical groups so the strip loops with no gap */}
        <div className="marquee-group">
          {stats.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
        <div className="marquee-group" aria-hidden="true">
          {stats.map((s) => (
            <span key={`${s}-dup`}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

type ImageOverlay = {
  text: React.ReactNode;
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

type PercentBarProps = {
  percent: number;   // 0-100
  width?: string;    // CSS value, e.g. '100%' or '240px'
  height?: string;   // CSS value, e.g. '10px'
};

export function PercentBar({ percent, width = '100%', height = '10px' }: PercentBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const [ref, current] = useCountUp<HTMLDivElement>(clamped);

  return (
    <div
      ref={ref}
      className="percent-bar"
      style={{ width, height }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="percent-bar__fill" style={{ width: `${current}%` }} />
    </div>
  );
}

type ImpactCategoryRowProps = {
  category: string;
  value: string;   // formatted CO2e, e.g. '1,240 kg'
  percent: number; // share of total CO2e, 0-100
};

export function ImpactCategoryRow({ category, value, percent }: ImpactCategoryRowProps) {
  return (
    <li className="impact-breakdown__row">
      <div className="impact-breakdown__row-text">
        <span className="impact-breakdown__category">{category}</span>
        <span className="impact-breakdown__value">
          {value} CO<sub>2</sub>e · {Math.round(percent)}%
        </span>
      </div>
      <PercentBar percent={percent} height="14px" />
    </li>
  );
}

type ImpactContributionStatCardProps = {
  value: string;
  label: string;
  icon: string;
};

export function ImpactContributionStatCard({ value, label, icon }: ImpactContributionStatCardProps) {
  return (
    <div className="impact-contribution__card">
      <Image
        src={icon}
        alt=""
        aria-hidden="true"
        width={54}
        height={54}
        className="impact-contribution__icon"
      />

      <div className="impact-contribution__content">
        <span className="impact-contribution__value">
          {/* only animate values that are plain numbers */}
          {Number.isFinite(Number(value)) ? <CountUp value={Number(value)} /> : value}
        </span>
        <span className="impact-contribution__label">{label}</span>
      </div>
    </div>
  );
}


/* impact and contribution components*/

/* redistribution components*/

/* impact and contribution components*/

/* redistribution components*/