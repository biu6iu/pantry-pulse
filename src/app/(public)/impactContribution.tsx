// our impact/contribution

import Image from 'next/image';
import boxPacking from '@/components/images/boxPacking.png';
import medSupplies from '@/components/images/medSupplies.jpg';
import heartIcon from '@/components/images/heartIcon.png';

const impactStats = [
  {
    value: '1028',
    label: 'locations have received your donations',
  },
  {
    value: '1028',
    label: 'organisations who donate',
  },
  {
    value: '1028',
    label: 'items saved from landfil',
  },
  {
    value: '1028',
    label: 'locations have received your donations',
  },
];

export default function ImpactContribution() {
  const styles = {
    section: {
      width: '100%',
      padding: '32px 28px 48px',
      background: '#f3f1ee',
      color: '#1d2438',
      fontFamily: 'var(--font-poppins), Arial, sans-serif',
    },
    header: {
      display: 'grid',
      gridTemplateColumns: 'minmax(280px, 0.9fr) minmax(420px, 1.4fr)',
      gap: '40px',
      alignItems: 'center',
    },
    copy: {
      maxWidth: '490px',
      marginTop: '0',
    },
    h2: {
      margin: '0 0 18px',
      fontSize: 'clamp(2.2rem, 4vw, 4.3rem)',
      lineHeight: 1.05,
      letterSpacing: '-0.08em',
      fontWeight: 700,
      color: '#1f2a44',
      fontFamily: 'Poppins, Arial, sans-serif',
    },
    p: {
      margin: '0 0 18px',
      fontSize: 'clamp(1.1rem, 1.8vw, 1.6rem)',
      lineHeight: 1.45,
      color: '#1e2435',
      fontWeight: 400,
      letterSpacing: '-0.03em',
      fontFamily: 'Poppins, Arial, sans-serif',
    },
    hero: {
      width: '100%',
      minHeight: '260px',
      position: 'relative',
      overflow: 'hidden',
      background: 'transparent',
      borderRadius: '28px',
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.02)',
    },
    summary: {
      marginTop: '54px',
    },
    h3: {
      margin: '0 0 22px',
      fontSize: 'clamp(2.7rem, 6vw, 5rem)',
      lineHeight: 1.06,
      letterSpacing: '-0.08em',
      fontWeight: 700,
      color: '#1c2b53',
      fontFamily: 'Poppins, Arial, sans-serif',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'minmax(300px, 0.98fr) minmax(360px, 1.35fr)',
      gap: '32px',
      alignItems: 'stretch',
    },
    visual: {
      minHeight: '420px',
      position: 'relative',
      overflow: 'hidden',
      background: 'transparent',
      borderRadius: '32px',
      width: '100%',
    },
    list: {
      display: 'grid',
      gap: '16px',
    },
    card: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      minHeight: '86px',
      padding: '14px 18px',
      borderRadius: '26px',
      border: '2px solid rgba(24, 31, 47, 0.9)',
      background: 'rgba(255, 255, 255, 0.12)',
    },
    icon: {
      flexShrink: 0,
      width: '54px',
      height: '54px',
    },
    content: {
      display: 'flex',
      alignItems: 'baseline',
      flexWrap: 'wrap',
      gap: '8px',
      rowGap: '2px',
    },
    value: {
      fontSize: 'clamp(2.2rem, 3vw, 3.8rem)',
      lineHeight: 1.06,
      letterSpacing: '-0.08em',
      fontWeight: 700,
      color: '#1d2438',
      fontFamily: 'Poppins, Arial, sans-serif',
    },
    label: {
      fontSize: 'clamp(1rem, 1.5vw, 1.5rem)',
      lineHeight: 1.35,
      color: '#1d2438',
      fontWeight: 400,
      letterSpacing: '-0.04em',
      opacity: 0.9,
      fontFamily: 'Poppins, Arial, sans-serif',
    },
  } as const;

  return (
    <section style={styles.section}>
      <div style={styles.header}>
        <div style={styles.copy}>
          <h2 style={styles.h2}>OUR IMPACT</h2>

          <p style={styles.p}>
            Every figure in this report traces back to individual items that have
            been donated.
          </p>

          <p style={styles.p}>
            Thank you to the sponsors and the amazing volunteers
            which make programs like ours possible.
          </p>
        </div>

        <div style={styles.hero}>
          <Image
            src={boxPacking}
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            loading="eager"
            style={{ objectFit: 'cover' }}
          />
        </div>
      </div>

      <div style={styles.summary}>
        <h2 style={styles.h2}>YOUR CONTRIBUTION MEANS</h2>

        <div style={styles.grid}>
          <div style={styles.visual}>
            <Image
              src={medSupplies}
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
            />
          </div>

          <div style={styles.list}>
            {impactStats.map((stat, index) => (
              <div key={`${stat.value}-${index}`} style={styles.card}>
                <Image
                  src={heartIcon}
                  alt=""
                  aria-hidden="true"
                  style={styles.icon}
                />

                <div style={styles.content}>
                  <span style={styles.value}>{stat.value}</span>
                  <span style={styles.label}>{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
