'use client';

import { useState } from 'react';
import styles from '../app/page.module.css';

const SERVICE = {
  name: 'Eye Exam',
  duration: '45 mins',
  price: '$95',
};

const TIME_SLOTS = [
  { time: '9:30 AM', period: 'morning' },
  { time: '10:15 AM', period: 'morning' },
  { time: '11:00 AM', period: 'morning' },
  { time: '1:30 PM', period: 'afternoon' },
  { time: '2:15 PM', period: 'afternoon' },
  { time: '3:00 PM', period: 'afternoon' },
  { time: '4:15 PM', period: 'afternoon' },
];

export default function BookExam() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  
  // Patient details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [insurance, setInsurance] = useState(false);
  
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Generate a mock month (e.g., June 2026)
  // June 1st is a Monday
  const daysInMonth = 30;
  const startDayOffset = 0; // Monday start
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay || !selectedSlot || !name || !email || !phone) return;
    setIsSubmitted(true);
  };

  return (
    <div className={styles.bookContainer}>
      {/* EHR Banner Hook for Owner */}
      <div className={styles.ehrBanner}>
        <div className={styles.ehrIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <p className={styles.ehrText}>
          Booked exams automatically sync with your EHR system and send text reminders to reduce no-shows by 35%.
        </p>
      </div>

      <div className={styles.bookHeader}>
        <span className={styles.eyebrowSmall}>Concierge Service</span>
        <h1 className={styles.bookTitle}>Schedule an Eye Exam</h1>
        <p className={styles.bookSubtitle}>
          Select your preferred date and time. Our team will verify your benefits and prepare for your visit.
        </p>
      </div>

      {isSubmitted ? (
        <div className={styles.successScreen}>
          <div className={styles.successIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="16 9 11 14 8 11" />
            </svg>
          </div>
          <h2 className={styles.successTitle}>Appointment Requested</h2>
          <p className={styles.successMessage}>
            Thank you, <strong>{name}</strong>. Your eye exam has been tentatively scheduled.
          </p>
          <div className={styles.successDetails}>
            <div className={styles.detailRow}>
              <span>Date:</span>
              <strong>June {selectedDay}, 2026</strong>
            </div>
            <div className={styles.detailRow}>
              <span>Time:</span>
              <strong>{selectedSlot}</strong>
            </div>
            <div className={styles.detailRow}>
              <span>Insurance:</span>
              <strong>{insurance ? 'Vision Insurance Provided' : 'Self-Pay'}</strong>
            </div>
          </div>
          <p className={styles.successReminder}>
            A calendar invitation and text reminder have been sent to <strong>{phone}</strong> and <strong>{email}</strong>. We look forward to seeing you at 351 Matawan Rd B.
          </p>
          <button 
            className={styles.reserveBtn} 
            onClick={() => {
              setIsSubmitted(false);
              setName('');
              setEmail('');
              setPhone('');
              setSelectedDay(null);
              setSelectedSlot(null);
              setInsurance(false);
            }}
          >
            Schedule Another Appointment
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.bookGrid}>
          {/* Left Column: Form */}
          <div className={styles.bookFormColumn}>
            {/* Patient Info */}
            <div className={styles.sectionBlock}>
              <h3 className={styles.sectionLabel}>1. Patient Information</h3>
              <div className={styles.inputGroup}>
                <div className={styles.inputField}>
                  <label htmlFor="patient-name">Full Name</label>
                  <input
                    type="text"
                    id="patient-name"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className={styles.inputField}>
                  <label htmlFor="patient-email">Email Address</label>
                  <input
                    type="email"
                    id="patient-email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className={styles.inputField}>
                  <label htmlFor="patient-phone">Phone Number</label>
                  <input
                    type="tel"
                    id="patient-phone"
                    required
                    placeholder="(555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Insurance Toggle */}
              <div className={styles.insuranceToggleBlock}>
                <div className={styles.insuranceInfo}>
                  <span className={styles.insuranceLabel}>Will you be using vision insurance?</span>
                  <span className={styles.insuranceSubtext}>We accept VSP, EyeMed, Davis Vision and more.</span>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={insurance}
                    onChange={(e) => setInsurance(e.target.checked)}
                  />
                  <span className={styles.slider} />
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Calendar & Time Slots */}
          <div className={styles.bookCalendarColumn}>
            <div className={styles.sectionBlock}>
              <h3 className={styles.sectionLabel}>2. Select Date &amp; Time</h3>
              
              {/* Calendar Widget */}
              <div className={styles.calendarWidget}>
                <div className={styles.calendarMonth}>June 2026</div>
                <div className={styles.calendarGrid}>
                  <div className={styles.dayHeader}>M</div>
                  <div className={styles.dayHeader}>T</div>
                  <div className={styles.dayHeader}>W</div>
                  <div className={styles.dayHeader}>T</div>
                  <div className={styles.dayHeader}>F</div>
                  <div className={styles.dayHeader}>S</div>
                  <div className={styles.dayHeader}>S</div>
                  
                  {calendarDays.map((day) => {
                    // Let's make weekends unavailable (Sat after 4 is closed, Sun closed)
                    const dateObj = new Date(2026, 5, day); // June is month index 5
                    const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday
                    // Open Tue(2), Wed(3), Fri(5) only
                    const isClosed = ![2, 3, 5].includes(dayOfWeek);
                    
                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={isClosed}
                        className={`${styles.calendarDay} ${isClosed ? styles.dayClosed : ''} ${selectedDay === day ? styles.daySelected : ''}`}
                        onClick={() => {
                          setSelectedDay(day);
                          setSelectedSlot(null); // Reset slot on day change
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slots selection */}
              {selectedDay !== null && (
                <div className={styles.slotsBlock}>
                  <span className={styles.slotsTitle}>Available Times for June {selectedDay}</span>
                  <div className={styles.slotsGrid}>
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        className={`${styles.slotBtn} ${selectedSlot === slot.time ? styles.slotBtnSelected : ''}`}
                        onClick={() => setSelectedSlot(slot.time)}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Submit Footer */}
            <div className={styles.submitBlock}>
              <div className={styles.summaryBox}>
                <span>Selected:</span>
                <strong>
                  Eye Exam — {SERVICE.duration} — {SERVICE.price}
                  {selectedDay && ` · June ${selectedDay}`}
                  {selectedSlot && ` at ${selectedSlot}`}
                </strong>
              </div>
              <button
                type="submit"
                className={styles.bookConfirmBtn}
                disabled={!selectedDay || !selectedSlot || !name || !email || !phone}
              >
                Confirm Appointment Request
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
