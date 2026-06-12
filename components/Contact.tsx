'use client';

import { useState } from 'react';
import styles from '../app/page.module.css';

const HOURS = [
  { day: 'Mon',     time: 'Closed'       },
  { day: 'Tue',     time: '11:00 – 6:00' },
  { day: 'Wed',     time: '11:00 – 5:00' },
  { day: 'Thu',     time: 'Closed'       },
  { day: 'Fri',     time: '10:00 – 3:00' },
  { day: 'Sat',     time: 'Closed'       },
  { day: 'Sun',     time: 'Closed'       },
];

export default function Contact() {
  const [form, setForm]   = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent]   = useState(false);
  const [busy, setBusy]   = useState(false);

  const handleFieldChange = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) {
      setErrors(errs => {
        const next = { ...errs };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) {
      newErrors.name = 'Please fill out this field.';
    }
    if (!form.email.trim()) {
      newErrors.email = 'Please fill out this field.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!form.phone.trim()) {
      newErrors.phone = 'Please fill out this field.';
    }
    if (!form.message.trim()) {
      newErrors.message = 'Please fill out this field.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Focus the first invalid field
      const firstErrorField = Object.keys(newErrors)[0];
      const el = document.getElementById(`cf-${firstErrorField}`);
      if (el) {
        el.focus();
      }
      return;
    }

    setErrors({});
    setBusy(true);
    // Simulate network delay; wire up a real API route or Formspree endpoint here.
    await new Promise(r => setTimeout(r, 800));
    setSent(true);
    setBusy(false);
    setForm({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className={styles.contactPage}>

      {/* ── Header ── */}
      <header className={styles.sectionHero}>
        <span className={styles.eyebrowSmall}>Get In Touch</span>
        <h1 className={styles.sectionHeroTitle}>
          We would love
          <br />
          <em className={styles.italic}>to hear from you.</em>
        </h1>
      </header>

      <div className={styles.contactGrid}>

        {/* ── Left: contact details ── */}
        <div className={styles.contactInfo}>

          <div className={styles.contactBlock}>
            <span className={styles.contactLabel}>Phone</span>
            <a href="tel:+17325832800" className={styles.contactValueLink}>
              (732) 583-2800
            </a>
          </div>

          <div className={styles.contactBlock}>
            <span className={styles.contactLabel}>Address</span>
            <address className={styles.contactAddress}>
              351 Matawan Rd&nbsp;B<br />
              Matawan, NJ 07747
            </address>
          </div>

          <div className={styles.contactBlock}>
            <span className={styles.contactLabel}>Hours</span>
            <div className={styles.contactHoursTable}>
              {HOURS.map(({ day, time }) => (
                <div key={day} className={styles.hoursRow}>
                  <span>{day}</span>
                  <span>{time}</span>
                </div>
              ))}
            </div>
          </div>

          <a
            href="https://www.google.com/maps/place/Avenue+Eyewear/@40.4305742,-74.2539434,17z/data=!3m1!4b1!4m6!3m5!1s0x89c3cc9b7e61fa8f:0x166207fe79e2dd74!8m2!3d40.4305701!4d-74.2513685!16s%2Fg%2F11b6vjssvm"
            target="_blank"
            rel="noreferrer"
            className={styles.contactMapLink}
          >
            Open in Google Maps →
          </a>

        </div>

        {/* ── Right: inquiry form ── */}
        <div className={styles.contactFormWrap}>
          {sent ? (
            <div className={styles.contactSuccess}>
              <p className={styles.contactSuccessText}>
                Thank you.
                <br />
                <em>We'll be in touch soon.</em>
              </p>
            </div>
          ) : (
            <form className={styles.contactForm} onSubmit={handleSubmit} noValidate>

              <div className={styles.contactField}>
                <label className={styles.contactFieldLabel} htmlFor="cf-name">
                  Name
                </label>
                <input
                  id="cf-name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={e => handleFieldChange('name', e.target.value)}
                  className={`${styles.contactInput} ${errors.name ? styles.hasError : ''}`}
                />
                {errors.name && <span className={styles.contactError}>{errors.name}</span>}
              </div>

              <div className={styles.contactField}>
                <label className={styles.contactFieldLabel} htmlFor="cf-email">
                  Email
                </label>
                <input
                  id="cf-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => handleFieldChange('email', e.target.value)}
                  className={`${styles.contactInput} ${errors.email ? styles.hasError : ''}`}
                />
                {errors.email && <span className={styles.contactError}>{errors.email}</span>}
              </div>

              <div className={styles.contactField}>
                <label className={styles.contactFieldLabel} htmlFor="cf-phone">
                  Phone
                </label>
                <input
                  id="cf-phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="Your phone number"
                  value={form.phone}
                  onChange={e => handleFieldChange('phone', e.target.value)}
                  className={`${styles.contactInput} ${errors.phone ? styles.hasError : ''}`}
                />
                {errors.phone && <span className={styles.contactError}>{errors.phone}</span>}
              </div>

              <div className={styles.contactField}>
                <label className={styles.contactFieldLabel} htmlFor="cf-message">
                  Message
                </label>
                <textarea
                  id="cf-message"
                  required
                  rows={5}
                  placeholder="How can we help you?"
                  value={form.message}
                  onChange={e => handleFieldChange('message', e.target.value)}
                  className={`${styles.contactTextarea} ${errors.message ? styles.hasError : ''}`}
                />
                {errors.message && <span className={styles.contactError}>{errors.message}</span>}
              </div>

              <button
                type="submit"
                className={styles.contactSubmit}
                disabled={busy}
              >
                {busy ? 'Sending…' : 'Send Message'}
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
