'use client';

import { useState, useRef, useEffect } from 'react';
import styles from '../app/page.module.css';

export default function LensTech() {
  const [sliderPos, setSliderPos] = useState(50); // 0 to 100
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Before/After Slider drag handlers
  const handleMove = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging.current) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.body.style.cursor = '';
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDown = () => {
    isDragging.current = true;
    document.body.style.cursor = 'ew-resize';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    const handleTouchEnd = () => {
      isDragging.current = false;
    };
    
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className={styles.techContainer}>
      {/* ── Section 1: Hero ── */}
      <div className={styles.techHero}>
        <span className={styles.eyebrowSmall}>The Lens is the Product</span>
        <h1 className={styles.techTitle}>The Ultimate Clarity</h1>
        <p className={styles.techSubtitle}>
          High-clarity, scratch-resistant lenses with an anti-reflective coating for sharp, glare-free vision.
        </p>
      </div>

      {/* ── Section 2: Interactive Glare Slider ── */}
      <div className={styles.sliderSection}>
        <div className={styles.sliderHeader}>
          <span className={styles.sliderLabelLeft}>Standard Lens (Blinded by Glare)</span>
          <span className={styles.sliderLabelRight}>Avenue AR Lens (Glare-Free)</span>
        </div>

        {/* Draggable Viewport Container */}
        <div 
          ref={sliderRef} 
          className={styles.sliderViewport}
          onMouseDown={handleMouseDown}
          onTouchStart={() => { isDragging.current = true; }}
          onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        >
          {/* Layer A (Underneath): Night Glare scene */}
          <div className={styles.sliderLayerA}>
            <svg viewBox="0 0 800 450" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
              {/* Dark highway night background */}
              <rect width="800" height="450" fill="#08080c" />
              <path d="M 150,450 L 380,260 L 420,260 L 650,450 Z" fill="#13131a" />
              <line x1="400" y1="260" x2="400" y2="450" stroke="rgba(255,255,255,0.06)" strokeWidth="2" strokeDasharray="8 8" />

              {/* Distant skyline & starlight */}
              <circle cx="200" cy="80" r="1" fill="#fff" opacity="0.6" />
              <circle cx="580" cy="120" r="1.5" fill="#fff" opacity="0.8" />
              <circle cx="670" cy="60" r="0.8" fill="#fff" opacity="0.5" />

              {/* Oncoming car headlights with MASSIVE GLARE halos */}
              {/* Headlight 1 */}
              <circle cx="340" cy="275" r="14" fill="#fff" />
              <circle cx="340" cy="275" r="60" fill="url(#haloGlare)" opacity="0.6" />
              {/* Starburst rays */}
              <path d="M 300,275 L 380,275 M 340,235 L 340,315 M 312,247 L 368,303 M 312,303 L 368,247" stroke="#fff" strokeWidth="1.5" opacity="0.85" />
              <path d="M 280,275 L 400,275 M 340,215 L 340,335" stroke="#fff" strokeWidth="0.5" opacity="0.5" />

              {/* Headlight 2 */}
              <circle cx="365" cy="275" r="12" fill="#fff" />
              <circle cx="365" cy="275" r="50" fill="url(#haloGlare)" opacity="0.6" />
              <path d="M 330,275 L 400,275 M 365,240 L 365,310 M 340,250 L 390,300 M 340,300 L 390,250" stroke="#fff" strokeWidth="1.2" opacity="0.85" />

              {/* Defs for gradients */}
              <defs>
                <radialGradient id="haloGlare" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fff" />
                  <stop offset="25%" stopColor="#ffeed0" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#ffb97b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ffb97b" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          {/* Layer B (Clipped, Top): Sharp, Anti-Reflective scene */}
          <div 
            className={styles.sliderLayerB} 
            style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
          >
            <svg viewBox="0 0 800 450" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
              {/* Same background but road looks clearer and contrast is higher */}
              <rect width="800" height="450" fill="#030305" />
              <path d="M 150,450 L 380,260 L 420,260 L 650,450 Z" fill="#0c0c11" />
              <line x1="400" y1="260" x2="400" y2="450" stroke="rgba(221,199,160,0.18)" strokeWidth="2" strokeDasharray="8 8" />

              {/* Crisper stars */}
              <circle cx="200" cy="80" r="1" fill="#fff" opacity="0.9" />
              <circle cx="580" cy="120" r="1.5" fill="#fff" opacity="1" />
              <circle cx="670" cy="60" r="1" fill="#fff" opacity="0.8" />

              {/* Headlights are perfectly clean dots - no halos or rays */}
              <circle cx="340" cy="275" r="7" fill="#fff" />
              <circle cx="340" cy="275" r="14" fill="#ffebd2" opacity="0.35" />
              
              <circle cx="365" cy="275" r="6" fill="#fff" />
              <circle cx="365" cy="275" r="12" fill="#ffebd2" opacity="0.35" />

              {/* Road markings visible and high contrast */}
              <line x1="280" y1="450" x2="390" y2="260" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
              <line x1="520" y1="450" x2="410" y2="260" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
            </svg>
          </div>

          {/* Draggable Divider Handle */}
          <div className={styles.sliderBar} style={{ left: `${sliderPos}%` }}>
            <div className={styles.sliderHandle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="8 17 3 12 8 7" />
                <polyline points="16 17 21 12 16 7" />
              </svg>
            </div>
          </div>
        </div>
        <p className={styles.sliderHint}>← Drag the slider to experience the anti-reflective lens simulation →</p>
      </div>

      {/* ── Section 3: Premium Coatings ── */}
      <div className={styles.coatingsSection}>
        <span className={styles.eyebrowSmall}>Coating Upgrades</span>
        <h2 className={styles.coatingsTitle}>Uncompromising Protection</h2>
        
        <div className={styles.coatingsGrid}>
          <div className={styles.coatingCard}>
            <div className={styles.coatingIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8M12 8v8" />
              </svg>
            </div>
            <h3 className={styles.coatingCardName}>Advanced Anti-Reflective</h3>
            <p className={styles.coatingCardDesc}>
              Blocks 99% of digital & night-driving glare. Eliminates bounce-back reflections from headlights and back-lit screens.
            </p>
          </div>

          <div className={styles.coatingCard}>
            <div className={styles.coatingIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 className={styles.coatingCardName}>Diamond Tough Matrix</h3>
            <p className={styles.coatingCardDesc}>
              Slick hydrophobic, ultra-scratch-resistant coating. Water beads off instantly, and dust particles bounce off.
            </p>
          </div>

          <div className={styles.coatingCard}>
            <div className={styles.coatingIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3 className={styles.coatingCardName}>Smart Blue-Block</h3>
            <p className={styles.coatingCardDesc}>
              Intelligently filters high-energy blue-violet light emitted by digital devices, easing ocular strain and improving sleep.
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 4: Prescription Submission Hook ── */}
      <div className={styles.rxSection}>
        <div className={styles.rxContent}>
          <span className={styles.eyebrowSmall}>Seamless Checkout</span>
          <h2 className={styles.rxTitle}>Prescription Submission Made Easy</h2>
          <p className={styles.rxBody}>
            Don't have your Rx on hand? No problem. Complete your frame order and upload a photo of your paper prescription anytime, or let us contact your doctor to retrieve it.
          </p>
          
          <div className={styles.rxSteps}>
            <div className={styles.rxStep}>
              <div className={styles.rxStepNum}>1</div>
              <strong>Choose Frame & Lenses</strong>
              <span>Select your style, frame color, and lens types.</span>
            </div>
            <div className={styles.rxStep}>
              <div className={styles.rxStepNum}>2</div>
              <strong>Checkout Safely</strong>
              <span>Enter shipping details and secure payment.</span>
            </div>
            <div className={styles.rxStep}>
              <div className={styles.rxStepNum}>3</div>
              <strong>Upload Prescription</strong>
              <span>Drag & drop a file, snap a photo, or enter doctor details.</span>
            </div>
          </div>

          <div className={styles.rxUploadBox}>
            <div className={styles.rxUploadIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
            </div>
            <span className={styles.rxUploadTitle}>Submit prescription now</span>
            <span className={styles.rxUploadSub}>Drag and drop your Rx file or click to browse (PDF, PNG, JPG)</span>
            <input type="file" className={styles.hiddenInput} id="rx-upload" disabled />
            <label htmlFor="rx-upload" className={styles.rxUploadBtn}>Upload Photo of Rx</label>
          </div>
        </div>
      </div>
    </div>
  );
}
