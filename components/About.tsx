'use client';

import styles from '../app/page.module.css';

const VALUES = [
  {
    n: '01',
    title: 'Independent Curation',
    body: 'No chains. No mass-market labels. Every frame in our studio was personally selected because we believe in it — nothing more.',
  },
  {
    n: '02',
    title: 'Bespoke Optical Care',
    body: 'Expert examinations, custom fittings, and lens consultations — tailored to you specifically, without the rush of a corporate practice.',
  },
  {
    n: '03',
    title: 'Lasting Commitment',
    body: 'We stand behind every sale, repair any frame we sell, and guarantee every lens — indefinitely and without condition.',
  },
];

export default function About() {
  return (
    <div className={styles.aboutPage}>

      {/* ── Header ── */}
      <header className={styles.sectionHero}>
        <span className={styles.eyebrowSmall}>Est. — Matawan, New Jersey</span>
        <h1 className={styles.sectionHeroTitle}>
          A different kind
          <br />
          <em className={styles.italic}>of optical.</em>
        </h1>
      </header>

      <hr className={styles.sectionRule} />

      {/* ── Editorial ── */}
      <div className={styles.aboutEditorial}>
        <div className={styles.aboutLead}>
          <p>
            Avenue Eyewear was founded on a simple belief — that finding the right glasses
            should feel like discovering something made specifically for you.
          </p>
        </div>
        <div className={styles.aboutBody}>
          <p>
            We source exclusively from independent frame houses and small-batch manufacturers
            across Italy, Japan, and Denmark. Each collection is assembled by hand — visiting
            studios and ateliers to select pieces that meet our singular standard: exceptional
            materials, honest construction, and genuine design intent.
          </p>
          <p>
            Our opticians take the time. Not the eight-minute industry standard, but however
            long your eyes and your face require — a full consultation, unhurried. Every lens
            is cut and fitted in-house. Every recommendation is made by a person, not an
            algorithm.
          </p>
        </div>
      </div>

      <hr className={styles.sectionRule} />

      {/* ── Values ── */}
      <div className={styles.aboutValues}>
        {VALUES.map(({ n, title, body }) => (
          <div key={n} className={styles.aboutValue}>
            <span className={styles.aboutValueN}>{n}</span>
            <h3 className={styles.aboutValueTitle}>{title}</h3>
            <p className={styles.aboutValueBody}>{body}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
