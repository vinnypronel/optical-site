'use client';

import { useEffect, useRef, useState, Fragment } from 'react';
import ScrollFrames from '@/components/ScrollFrames';
import About        from '@/components/About';
import Testimonials from '@/components/Testimonials';
import Contact      from '@/components/Contact';
import { BUSINESS, HOURS } from '@/lib/business';
import styles from './page.module.css';

// Enter/Space activate handler for elements acting as buttons
const onKeyActivate = (fn: () => void) => (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fn();
  }
};

type View = 'home' | 'about' | 'testimonials' | 'contact';

const NAV_ITEMS: { view: View; label: string }[] = [
  { view: 'home',         label: 'Home'         },
  { view: 'about',        label: 'About'        },
  { view: 'testimonials', label: 'Testimonials' },
  { view: 'contact',      label: 'Contact Us'   },
];

export default function Home() {
  const sequenceRef                = useRef<HTMLElement>(null);
  const scrollAllowedRef           = useRef(false);
  const [currentView, setCurrentView] = useState<View>('home');
  const [mounted, setMounted] = useState(false);
  const [transitionState, setTransitionState] = useState<'idle' | 'entering' | 'leaving'>('idle');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Lock background scroll when mobile hamburger menu is open
  useEffect(() => {
    if (!mounted) return;
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }, [isMenuOpen, mounted]);
  const [previewReviews, setPreviewReviews] = useState<any[]>([
    {
      reviewId: 'fallback-1',
      authorName: 'Sarah M.',
      rating: 5,
      reviewText: "From the moment I walked in, I knew this was different. No pressure, no rush - they spent nearly an hour helping me find exactly the right frame. I've never had an optical appointment like it.",
      originalGoogleUrl: 'https://www.google.com/maps/place/Avenue+Eyewear',
    },
    {
      reviewId: 'fallback-2',
      authorName: 'James R.',
      rating: 5,
      reviewText: "The selection is unlike anything I've found anywhere in New Jersey. Every frame has a story. I ended up with a pair I'd never have chosen on my own, and I get compliments on them constantly.",
      originalGoogleUrl: 'https://www.google.com/maps/place/Avenue+Eyewear',
    },
  ]);

  useEffect(() => {
    async function loadPreviewReviews() {
      try {
        const res = await fetch('/api/reviews');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.reviews && data.reviews.length > 0) {
          const withText = data.reviews.filter((r: any) => r.reviewText && r.reviewText.trim().length > 0);
          if (withText.length >= 2) {
            setPreviewReviews(withText.slice(0, 2));
          } else if (data.reviews.length >= 2) {
            setPreviewReviews(data.reviews.slice(0, 2));
          } else {
            setPreviewReviews([data.reviews[0], previewReviews[1]]);
          }
        }
      } catch (err) {
        console.warn('[Home] Could not load preview reviews:', err);
      }
    }
    loadPreviewReviews();
  }, []);

  // Always start at the top of the page on load and lock scroll during intro
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Force scroll position to 0 immediately
    window.scrollTo(0, 0);

    // Repeatedly force scroll position to 0 over the first 100ms
    // to override any browser-restored scrolls or layout shifts
    let count = 0;
    const scrollInterval = setInterval(() => {
      window.scrollTo(0, 0);
      count++;
      if (count >= 15) {
        clearInterval(scrollInterval);
      }
    }, 10);

    // Lock body and html scroll after a brief moment to freeze at 0
    const lockTimer = setTimeout(() => {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }, 50);

    // Intercept any programmatic scrolls and force back to 0 until user interacts
    const handleScroll = () => {
      if (!scrollAllowedRef.current) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Enable scroll once the user actually initiates a physical scroll/click gesture
    const allowScroll = () => {
      scrollAllowedRef.current = true;
      window.removeEventListener('wheel', allowScroll);
      window.removeEventListener('touchmove', allowScroll);
      window.removeEventListener('keydown', allowScroll);
      window.removeEventListener('mousedown', allowScroll);
      window.removeEventListener('pointerdown', allowScroll);
    };

    // Unlock body and html scroll after the intro completes
    const unlockTimer = setTimeout(() => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.scrollTo(0, 0);
      setMounted(true);

      // Listen for physical user scroll input gestures
      window.addEventListener('wheel', allowScroll, { passive: true });
      window.addEventListener('touchmove', allowScroll, { passive: true });
      window.addEventListener('keydown', allowScroll, { passive: true });
      window.addEventListener('mousedown', allowScroll, { passive: true });
      window.addEventListener('pointerdown', allowScroll, { passive: true });
    }, 1220);

    return () => {
      clearInterval(scrollInterval);
      clearTimeout(lockTimer);
      clearTimeout(unlockTimer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', allowScroll);
      window.removeEventListener('touchmove', allowScroll);
      window.removeEventListener('keydown', allowScroll);
      window.removeEventListener('mousedown', allowScroll);
      window.removeEventListener('pointerdown', allowScroll);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const changeView = (view: View) => {
    if (view === currentView) return;
    setIsMenuOpen(false);
    setTransitionState('entering');

    setTimeout(() => {
      setCurrentView(view);
      window.scrollTo({ top: 0, behavior: 'instant' });
      // Let the layout settle before firing resize (important for scroll-canvas)
      setTimeout(() => window.dispatchEvent(new Event('resize')), 80);
      setTransitionState('leaving');

      setTimeout(() => {
        setTransitionState('idle');
      }, 450);
    }, 400);
  };

  return (
    <main id="main" className={styles.main}>

      {/* ── Page Transition Shutter ────────────────────────────────────────── */}
      <div className={`${styles.transitionOverlay} ${
        transitionState === 'entering' ? styles.transitionEntering : ''
      } ${
        transitionState === 'leaving' ? styles.transitionLeaving : ''
      } ${
        transitionState !== 'idle' ? styles.transitionActive : ''
      }`}>
        <div className={styles.transitionBrand}>
          AVENUE <span className={styles.brandThin}>EYEWEAR</span>
        </div>
      </div>

      {/* ── Global nav ─────────────────────────────────────────────────────── */}
      <nav className={styles.nav} aria-label="Primary">
        <span
          className={styles.brand}
          role="button"
          tabIndex={0}
          aria-label="Avenue Eyewear — home"
          onClick={() => {
            setIsMenuOpen(false);
            changeView('home');
          }}
          onKeyDown={onKeyActivate(() => { setIsMenuOpen(false); changeView('home'); })}
          style={{ cursor: 'pointer' }}
        >
          AVENUE <span className={styles.brandThin}>EYEWEAR</span>
        </span>

        <ul className={styles.navLinks}>
          {NAV_ITEMS.map(({ view, label }) => (
            <li
              key={view}
              role="button"
              tabIndex={0}
              aria-current={currentView === view ? 'page' : undefined}
              onClick={() => changeView(view)}
              onKeyDown={onKeyActivate(() => changeView(view))}
              className={currentView === view ? styles.navLinkActive : ''}
            >
              {label}
            </li>
          ))}
          <li className={styles.cta}>
            <a href={BUSINESS.phoneHref}>Call to Book</a>
          </li>
        </ul>

        <button
          className={`${styles.hamburger} ${isMenuOpen ? styles.hamburgerActive : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          <span className={styles.hamburgerBar} />
          <span className={styles.hamburgerBar} />
          <span className={styles.hamburgerBar} />
        </button>
      </nav>

      {/* ── Mobile Menu Overlay ────────────────────────────────────────────── */}
      <div
        className={`${styles.mobileDrawer} ${isMenuOpen ? styles.mobileDrawerOpen : ''}`}
        aria-hidden={!isMenuOpen}
      >
        <ul className={styles.mobileNavLinks}>
          {NAV_ITEMS.map(({ view, label }) => (
            <li
              key={view}
              role="button"
              tabIndex={isMenuOpen ? 0 : -1}
              aria-current={currentView === view ? 'page' : undefined}
              onClick={() => {
                setIsMenuOpen(false);
                changeView(view);
              }}
              onKeyDown={onKeyActivate(() => { setIsMenuOpen(false); changeView(view); })}
              className={currentView === view ? styles.mobileNavLinkActive : ''}
            >
              {label}
            </li>
          ))}
          <li className={styles.mobileCta} onClick={() => setIsMenuOpen(false)}>
            <a href={BUSINESS.phoneHref} tabIndex={isMenuOpen ? 0 : -1}>Call to Book</a>
          </li>
        </ul>
      </div>

      {/* ── Home — scroll animation + editorial preview sections ─────────────── */}
      <div className={currentView === 'home' ? styles.viewActive : styles.viewInactive}>

        {/* Scroll-driven glasses animation */}
        <section ref={sequenceRef} className={`${styles.sequence} ${mounted ? styles.ready : ''}`}>
          <div className={styles.sticky}>
            <ScrollFrames rangeRef={sequenceRef} isReady={mounted} />

            {/* Hero text */}
            <div className={`${styles.overlay} ${styles.heroOverlay}`}>
              <div className={styles.heroContent}>
                <h1 className={styles.display}>
                  <span className={styles.nowrap}>Your vision,</span>
                  <br />
                  <em className={styles.italic}>effortlessly.</em>
                </h1>
                <p className={styles.lede}>
                  Hand-polished for a fit so natural, you'll forget you're even wearing them.
                </p>
                <div className={styles.cue}>
                  <span className={styles.cueLine} />
                </div>
              </div>
            </div>

            {/* Mid-sequence captions */}
            <div className={`${styles.overlay} ${styles.captionA}`}>
              <span className={styles.tag}>01 - Bridge</span>
              <h3 className={styles.capH}>Hand-polished frames built for all-day comfort.</h3>
            </div>
            <div className={`${styles.overlay} ${styles.captionB}`}>
              <span className={styles.tag}>02 - Lens</span>
              <h3 className={styles.capH}>
                High-clarity,<br />
                scratch-resistant<br />
                lenses with an anti-<br />
                reflective coating for<br />
                sharp, glare-free vision.
              </h3>
            </div>
            <div className={`${styles.overlay} ${styles.captionC}`}>
              <span className={styles.tag}>03 - Temple</span>
              <h3 className={styles.capH}>
                Custom hardware designed to hold its shape year after year.
              </h3>
            </div>
          </div>
        </section>

        {/* ── ABOUT PREVIEW ─────────────────────────────────────────────────── */}
        <section className={styles.homePreviewAbout}>
          <div className={styles.homePreviewAboutLeft}>
            <span className={styles.eyebrowSmall}>Our Story</span>
            <h2 className={styles.homePreviewTitle}>
              A different kind
              <br />
              <em className={styles.italic}>of optical.</em>
            </h2>
            <p className={styles.homePreviewBody}>
              We source exclusively from independent frame houses and small-batch
              manufacturers. Founded on the belief that finding the right glasses
              should feel like discovering something made specifically for you.
            </p>
            <button
              className={styles.homePreviewBtn}
              onClick={() => changeView('about')}
            >
              About Avenue Eyewear
            </button>
          </div>

          <div className={styles.homePreviewPillars}>
            {[
              { n: '01', title: 'Independent Curation' },
              { n: '02', title: 'Bespoke Optical Care'  },
              { n: '03', title: 'Lasting Commitment'    },
            ].map(({ n, title }) => (
              <div key={n} className={styles.homePreviewPillar}>
                <span className={styles.homePreviewPillarN}>{n}</span>
                <span className={styles.homePreviewPillarTitle}>{title}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIALS PREVIEW ──────────────────────────────────────────── */}
        <section className={styles.homePreviewTestimonials}>
          <span className={styles.eyebrowSmall}>Featured Reviews</span>

          <div className={styles.homePreviewQuotePair}>
            {previewReviews.map((review, i) => (
              <Fragment key={review.reviewId}>
                {i > 0 && <div className={styles.homePreviewQuoteDivider} aria-hidden />}
                <a
                  href={review.originalGoogleUrl || 'https://www.google.com/maps/place/Avenue+Eyewear/@40.4305742,-74.2539434,17z'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.homePreviewQuote}
                >
                  <span className={styles.homePreviewQuoteMark} aria-hidden>&ldquo;</span>
                  <p className={styles.homePreviewQuoteText}>
                    {review.reviewText || `${review.authorName} left a ${review.rating}-star rating.`}
                  </p>
                  <div className={styles.homePreviewQuoteAttrib}>
                    <span className={styles.homePreviewStars} aria-label={`${review.rating} out of 5 stars`}>
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </span>
                    <span className={styles.homePreviewQuoteName}>{review.authorName}</span>
                    <span className={styles.homePreviewQuoteBadge}>Verified Google Review</span>
                  </div>
                </a>
              </Fragment>
            ))}
          </div>

          <button
            className={styles.homePreviewBtn}
            onClick={() => changeView('testimonials')}
          >
            Read All Reviews
          </button>
        </section>

        {/* ── CONTACT PREVIEW ───────────────────────────────────────────────── */}
        <section className={styles.homePreviewContact}>
          <div className={styles.homePreviewContactLeft}>
            <span className={styles.eyebrowSmall}>Visit Us</span>
            <h2 className={styles.homePreviewTitle}>
              <span className={styles.nowrap}>Come see us</span>
              <br />
              <em className={styles.italic}>in person.</em>
            </h2>
            <p className={styles.homePreviewBody}>
              Frame fittings, eye examinations, and lens consultations -
              by appointment or walk-in. Our opticians will spend the time
              it takes to get things right.
            </p>
            <button
              className={styles.homePreviewBtn}
              onClick={() => changeView('contact')}
            >
              Contact Us
            </button>
          </div>

          <div className={styles.homePreviewContactRight}>
            <div className={styles.homePreviewContactItem}>
              <span className={styles.contactLabel}>Address</span>
              <address className={styles.homePreviewAddress}>
                351 Matawan Rd&nbsp;B<br />Matawan, NJ 07747
              </address>
            </div>
            <div className={styles.homePreviewContactItem}>
              <span className={styles.contactLabel}>Phone</span>
              <a href={BUSINESS.phoneHref} className={styles.homePreviewPhone}>
                {BUSINESS.phone}
              </a>
            </div>
            <div className={styles.homePreviewContactItem}>
              <span className={styles.contactLabel}>Hours</span>
              <div className={styles.homePreviewHours}>
                {HOURS.filter(h => h.time !== 'Closed').map(({ day, time }) => (
                  <span key={day}>{day}&nbsp;&nbsp;{time}</span>
                ))}
              </div>
            </div>
            <div className={styles.homePreviewContactItem}>
              <span className={styles.contactLabel}>Social</span>
              <div className={styles.homePreviewSocials}>
                <a
                  href="https://www.instagram.com/explore/locations/1018925198/avenue-eyewear/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.homePreviewSocialLink}
                >
                  Instagram
                </a>
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.homePreviewSocialLink}
                >
                  Facebook
                </a>
              </div>
            </div>
          </div>

          <div className={styles.homePreviewMap}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3036.082001550974!2d-74.2539434!3d40.4305742!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c3cc9b7e61fa8f%3A0x166207fe79e2dd74!2sAvenue%20Eyewear!5e0!3m2!1sen!2sus!4v1780700539123!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Avenue Eyewear location"
            />

            <div className={styles.mapCard}>
              <div className={styles.mapCardLogo}>
                AE
              </div>
              <div className={styles.mapCardMeta}>
                <strong>Avenue Eyewear</strong>
                <span>351 Matawan Rd B, Matawan, NJ 07747</span>
              </div>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Avenue+Eyewear+351+Matawan+Rd+B+Matawan+NJ+07747"
                target="_blank"
                rel="noreferrer"
                className={styles.mapCardDirections}
                title="Get Directions"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
              </a>
            </div>
          </div>

        </section>

      </div>


      {/* ── About ──────────────────────────────────────────────────────────── */}
      <div className={currentView === 'about' ? styles.viewActive : styles.viewInactive}>
        <About />
      </div>

      {/* ── Testimonials ───────────────────────────────────────────────────── */}
      <div className={currentView === 'testimonials' ? styles.viewActive : styles.viewInactive}>
        <Testimonials />
      </div>

      {/* ── Contact ────────────────────────────────────────────────────────── */}
      <div className={currentView === 'contact' ? styles.viewActive : styles.viewInactive}>
        <Contact />
      </div>

      {/* ── Global footer ──────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div
          className={styles.footCol}
          role="button"
          tabIndex={0}
          aria-label="Avenue Eyewear — home"
          onClick={() => changeView('home')}
          onKeyDown={onKeyActivate(() => changeView('home'))}
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.footBrand}>
            AVENUE <span className={styles.brandThin}>EYEWEAR</span>
          </div>
          <p className={styles.footTag}>Independent optical · Matawan, NJ</p>
        </div>
        <div className={styles.footSocials}>
          <a
            href="https://www.instagram.com/explore/locations/1018925198/avenue-eyewear/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footSocialLink}
          >
            Instagram
          </a>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footSocialLink}
          >
            Facebook
          </a>
        </div>
        <div className={styles.footMeta}>
          <span>{BUSINESS.street}, {BUSINESS.city}, {BUSINESS.region} {BUSINESS.postal}</span>
          <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>
          <span>© {new Date().getFullYear()} Avenue Eyewear</span>
        </div>
        <p className={styles.footDisclaimer}>
          Ray-Ban® and Wayfarer® are registered trademarks of Luxottica Group S.p.A.
          Product imagery is shown for illustrative purposes only and does not imply
          affiliation with or endorsement by the trademark holders.
        </p>
      </footer>

    </main>
  );
}
