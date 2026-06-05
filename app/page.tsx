'use client';

import { useEffect, useRef, useState } from 'react';
import ScrollFrames from '@/components/ScrollFrames';
import About        from '@/components/About';
import Testimonials from '@/components/Testimonials';
import Contact      from '@/components/Contact';
import styles from './page.module.css';

type View = 'home' | 'about' | 'testimonials' | 'contact';

const NAV_ITEMS: { view: View; label: string }[] = [
  { view: 'home',         label: 'Home'         },
  { view: 'about',        label: 'About'        },
  { view: 'testimonials', label: 'Testimonials' },
  { view: 'contact',      label: 'Contact Us'   },
];

export default function Home() {
  const sequenceRef                = useRef<HTMLElement>(null);
  const [currentView, setCurrentView] = useState<View>('home');

  // Always start at the top of the page on load
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  const changeView = (view: View) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Let the layout settle before firing resize (important for scroll-canvas)
    setTimeout(() => window.dispatchEvent(new Event('resize')), 80);
  };

  return (
    <main className={styles.main}>

      {/* ── Global nav ─────────────────────────────────────────────────────── */}
      <nav className={styles.nav}>
        <span
          className={styles.brand}
          onClick={() => changeView('home')}
          style={{ cursor: 'pointer' }}
        >
          AVENUE <span className={styles.brandThin}>EYEWEAR</span>
        </span>

        <ul className={styles.navLinks}>
          {NAV_ITEMS.map(({ view, label }) => (
            <li
              key={view}
              onClick={() => changeView(view)}
              className={currentView === view ? styles.navLinkActive : ''}
            >
              {label}
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Home — scroll animation + editorial preview sections ─────────────── */}
      <div className={currentView === 'home' ? styles.viewActive : styles.viewInactive}>

        {/* Scroll-driven glasses animation */}
        <section ref={sequenceRef} className={styles.sequence}>
          <div className={styles.sticky}>
            <ScrollFrames rangeRef={sequenceRef} />

            {/* Hero text */}
            <div className={`${styles.overlay} ${styles.heroOverlay}`}>
              <p className={styles.eyebrow}>Avenue Eyewear — Collection 04</p>
              <h1 className={styles.display}>
                Engineered
                <br />
                <em className={styles.italic}>in motion.</em>
              </h1>
              <p className={styles.lede}>
                Eight components. Seventy-two hand-finished surfaces.
                Scroll to disassemble the frame and meet every piece.
              </p>
              <div className={styles.cue}>
                <span className={styles.cueLine} />
                <span>Scroll</span>
              </div>
            </div>

            {/* Mid-sequence captions */}
            <div className={`${styles.overlay} ${styles.captionA}`}>
              <span className={styles.tag}>01 — Bridge</span>
              <h3 className={styles.capH}>Hand-polished frames built for all-day comfort.</h3>
            </div>
            <div className={`${styles.overlay} ${styles.captionB}`}>
              <span className={styles.tag}>02 — Temple</span>
              <h3 className={styles.capH}>Custom hardware designed to hold its shape year after year.</h3>
            </div>
            <div className={`${styles.overlay} ${styles.captionC}`}>
              <span className={styles.tag}>03 — Lens</span>
              <h3 className={styles.capH}>
                High-clarity, scratch-resistant lenses with an anti-reflective coating for sharp, glare-free vision.
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
          <span className={styles.eyebrowSmall}>Client Experiences</span>

          <div className={styles.homePreviewQuote}>
            <span className={styles.homePreviewQuoteMark} aria-hidden>&ldquo;</span>
            {/* Replace this with one of your favourite Google Reviews */}
            <p className={styles.homePreviewQuoteText}>
              From the moment I walked in, I knew this was different. No pressure,
              no rush — they spent nearly an hour helping me find exactly the right
              frame. I've never had an optical appointment like it.
            </p>
            <div className={styles.homePreviewQuoteAttrib}>
              <span className={styles.homePreviewStars} aria-label="5 stars">★★★★★</span>
              <span className={styles.homePreviewQuoteName}>Sarah M.</span>
              <span className={styles.homePreviewQuoteBadge}>Verified Google Review</span>
            </div>
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
              Come see us
              <br />
              <em className={styles.italic}>in person.</em>
            </h2>
            <p className={styles.homePreviewBody}>
              Frame fittings, eye examinations, and lens consultations —
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
              <a href="tel:+17325832800" className={styles.homePreviewPhone}>
                (732) 583-2800
              </a>
            </div>
            <div className={styles.homePreviewContactItem}>
              <span className={styles.contactLabel}>Hours</span>
              <div className={styles.homePreviewHours}>
                <span>Tue&nbsp;&nbsp;11:00 – 6:00</span>
                <span>Wed&nbsp;11:00 – 5:00</span>
                <span>Fri&nbsp;&nbsp;&nbsp;10:00 – 3:00</span>
              </div>
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
        <div className={styles.footCol}>
          <div
            className={styles.footBrand}
            onClick={() => changeView('home')}
            style={{ cursor: 'pointer' }}
          >
            AVENUE <span className={styles.brandThin}>EYEWEAR</span>
          </div>
          <p className={styles.footTag}>Independent optical · Matawan, NJ</p>
        </div>
        <div className={styles.footMeta}>
          <span>351 Matawan Rd B, Matawan, NJ 07747</span>
          <span>(732) 583-2800</span>
          <span>© {new Date().getFullYear()} Avenue Eyewear</span>
        </div>
      </footer>

    </main>
  );
}
