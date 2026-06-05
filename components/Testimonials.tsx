'use client';

import styles from '../app/page.module.css';

/**
 * TESTIMONIALS — Replace the placeholder text below with your actual Google Reviews.
 * Each review object has:
 *   text  — the body of the review
 *   name  — reviewer's first name + last initial
 */
const REVIEWS = [
  {
    text: "From the moment I walked in, I knew this was different. No pressure, no rush — they spent nearly an hour helping me find exactly the right frame. I've never had an optical appointment like it, and I've been wearing glasses for fifteen years.",
    name: 'Sarah M.',
  },
  {
    text: "The selection is unlike anything I've found anywhere in New Jersey. Every frame has a story. I ended up with a pair I'd never have chosen on my own, and I get compliments on them constantly. Worth every penny.",
    name: 'James R.',
  },
  {
    text: "I came in for an eye exam and left with the most beautiful frames I've ever owned. The team is warm, incredibly knowledgeable, and genuinely invested in getting it right. This is what an independent optical should be.",
    name: 'Maria C.',
  },
];

export default function Testimonials() {
  return (
    <div className={styles.testimonialsPage}>

      {/* ── Header ── */}
      <header className={styles.sectionHero}>
        <span className={styles.eyebrowSmall}>Client Experiences</span>
        <h1 className={styles.sectionHeroTitle}>
          In their
          <br />
          <em className={styles.italic}>own words.</em>
        </h1>
      </header>

      {/* ── Review grid ── */}
      <div className={styles.reviewGrid}>
        {REVIEWS.map((review, i) => (
          <article key={i} className={styles.reviewCard}>

            {/* Large decorative open-quote */}
            <span className={styles.reviewQuoteMark} aria-hidden>&ldquo;</span>

            {/* Review body — replace with your actual Google Review text */}
            <p className={styles.reviewText}>{review.text}</p>

            <div className={styles.reviewDivider} />

            <footer className={styles.reviewFooter}>
              <div className={styles.reviewStars} aria-label="5 out of 5 stars">★★★★★</div>
              <span className={styles.reviewName}>{review.name}</span>
              <span className={styles.reviewBadge}>
                <span className={styles.reviewBadgeDot} aria-hidden />
                Verified Google Review
              </span>
            </footer>

          </article>
        ))}
      </div>

    </div>
  );
}
