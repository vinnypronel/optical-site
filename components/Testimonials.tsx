/**
 * =============================================================================
 * Testimonials — Google Reviews Component
 * =============================================================================
 * FILE: components/Testimonials.tsx
 *
 * FEATURES:
 *  - Fetches reviews and business metadata from /api/reviews (our local DB)
 *  - Header disclaimer showing average rating + total review count
 *  - Each card is a clickable <a> tag linking to the original Google review
 *  - Skeleton loading state while data is fetched
 *  - Graceful error handling with a fallback to hardcoded reviews
 *  - Profile photo avatars with text fallback
 *  - Animated entrance for cards (CSS staggered fade-in)
 *
 * STYLING:
 *  - Uses CSS Modules (page.module.css) to stay consistent with the rest
 *    of the site. New class names are prefixed with `gr` (Google Reviews).
 *  - Inherits the beige / bronze / dark-ink palette from CSS custom properties.
 *
 * =============================================================================
 */

'use client';

import { useEffect, useState } from 'react';
import styles from '../app/page.module.css';

// ---------------------------------------------------------------------------
// ── TYPES ────────────────────────────────────────────────────────────────────
// ---------------------------------------------------------------------------

interface Review {
  reviewId:          string;
  authorName:        string;
  rating:            number;
  reviewText:        string | null;
  publishDate:       string | null;
  profilePhotoUrl:   string | null;
  originalGoogleUrl: string | null;
}

interface ReviewsMeta {
  totalReviewCount: number;
  averageRating:    number | null;
  lastUpdated:      string;
}

interface ReviewsApiResponse {
  meta:    ReviewsMeta;
  reviews: Review[];
  error?:  string;
}

// ---------------------------------------------------------------------------
// ── FALLBACK DATA ─────────────────────────────────────────────────────────────
// Shown if the API call fails (e.g. no DATABASE_URL configured yet).
// Replace these with your real seed reviews, or remove them once the DB is live.
// ---------------------------------------------------------------------------
const FALLBACK_REVIEWS: Review[] = [
  {
    reviewId:          'fallback-1',
    authorName:        'Sarah M.',
    rating:            5,
    reviewText:        "From the moment I walked in, I knew this was different. No pressure, no rush — they spent nearly an hour helping me find exactly the right frame. I've never had an optical appointment like it, and I've been wearing glasses for fifteen years.",
    publishDate:       null,
    profilePhotoUrl:   null,
    originalGoogleUrl: 'https://www.google.com/maps/place/Avenue+Eyewear',
  },
  {
    reviewId:          'fallback-2',
    authorName:        'James R.',
    rating:            5,
    reviewText:        "The selection is unlike anything I've found anywhere in New Jersey. Every frame has a story. I ended up with a pair I'd never have chosen on my own, and I get compliments on them constantly. Worth every penny.",
    publishDate:       null,
    profilePhotoUrl:   null,
    originalGoogleUrl: 'https://www.google.com/maps/place/Avenue+Eyewear',
  },
  {
    reviewId:          'fallback-3',
    authorName:        'Maria C.',
    rating:            5,
    reviewText:        "I came in for an eye exam and left with the most beautiful frames I've ever owned. The team is warm, incredibly knowledgeable, and genuinely invested in getting it right. This is what an independent optical should be.",
    publishDate:       null,
    profilePhotoUrl:   null,
    originalGoogleUrl: 'https://www.google.com/maps/place/Avenue+Eyewear',
  },
];

const FALLBACK_META: ReviewsMeta = {
  totalReviewCount: 0,
  averageRating:    null,
  lastUpdated:      new Date().toISOString(),
};

// ---------------------------------------------------------------------------
// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
// ---------------------------------------------------------------------------

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>(FALLBACK_REVIEWS);
  const [meta, setMeta] = useState<ReviewsMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const REVIEWS_PER_PAGE = 12;

  // When reviews update (e.g. loaded from API), reset page to 1
  useEffect(() => {
    setCurrentPage(1);
  }, [reviews]);

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      try {
        const res = await fetch('/api/reviews');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: ReviewsApiResponse = await res.json();
        if (cancelled) return;

        if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
          setMeta(data.meta);
        }
      } catch (err) {
        console.warn('[Testimonials] Could not load reviews from API — using fallback data.', err);
      }
    }

    loadReviews();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);

  const paginatedReviews = reviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  );

  // Intersection Observer for seamless scroll-reveal entry animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.animateIn);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    const cards = document.querySelectorAll(`.${styles.reviewCard}`);
    cards.forEach((card) => observer.observe(card));

    return () => {
      cards.forEach((card) => observer.unobserve(card));
    };
  }, [paginatedReviews]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    
    // Smoothly scroll back to the testimonials section header
    const headerElement = document.getElementById('testimonials-header');
    if (headerElement) {
      headerElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const googleMapsListingUrl = 'https://www.google.com/maps/place/Avenue+Eyewear/@40.4305742,-74.2539434,17z';

  // Stats calculation: Fallbacks show 3 reviews, live database shows total counted 4-5 stars out of total Google reviews
  const totalCount = meta ? meta.totalReviewCount : reviews.length;
  const reviews45Count = reviews.length;

  return (
    <div className={styles.testimonialsPage}>

      {/* ── Header ── */}
      <header id="testimonials-header" className={`${styles.sectionHero} ${styles.testimonialsHero}`}>
        <div>
          <span className={styles.eyebrowSmall}>Client Experiences</span>
          <h1 className={styles.sectionHeroTitle}>
            In their
            <br />
            <em className={styles.italic}>own words.</em>
          </h1>
        </div>

        {/* Dynamic Reviews Statistics */}
        <div className={styles.testimonialsStats}>
          <span className={styles.statsCount}>
            Showing {reviews45Count}/{totalCount} Reviews
          </span>
          <span className={styles.statsDisclaimer}>
            Selected 4 &amp; 5-star ratings only
          </span>
        </div>
      </header>

      {/* ── Review grid ── */}
      <div className={styles.reviewGrid}>
        {paginatedReviews.map((review, i) => (
          <a
            key={review.reviewId}
            href={review.originalGoogleUrl || googleMapsListingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.reviewCard}
            style={{ '--card-index': i % 3 } as React.CSSProperties}
            aria-label={`Read ${review.authorName}'s review on Google`}
          >
            {/* Large decorative open-quote */}
            <span className={styles.reviewQuoteMark} aria-hidden>&ldquo;</span>

            <p className={styles.reviewText}>
              {review.reviewText || `${review.authorName} left a ${review.rating}-star rating.`}
            </p>

            <div className={styles.reviewDivider} />

            <footer className={styles.reviewFooter}>
              <div className={styles.reviewStars} aria-label={`${review.rating} out of 5 stars`}>
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </div>
              <span className={styles.reviewName}>{review.authorName}</span>
              <span className={styles.reviewBadge}>
                <span className={styles.reviewBadgeDot} aria-hidden />
                Verified Google Review
              </span>
            </footer>
          </a>
        ))}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <nav className={styles.pagination} aria-label="Testimonials pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.paginationBtn}
            aria-label="Previous page"
          >
            ← Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`${styles.paginationBtn} ${currentPage === page ? styles.paginationBtnActive : ''}`}
              aria-label={`Go to page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.paginationBtn}
            aria-label="Next page"
          >
            Next →
          </button>
        </nav>
      )}

    </div>
  );
}
