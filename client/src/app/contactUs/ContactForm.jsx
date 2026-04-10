'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function ContactForm() {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    // Simulate network delay — replace with real fetch when backend endpoint exists
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setStatus('success');
  }

  if (status === 'success') {
    return (
      <div className={styles.successBanner}>
        <strong>Message sent!</strong> Thanks — we'll be in touch within 24 hours.
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.inputGroup}>
        <label htmlFor="name" className={styles.label}>Full Name</label>
        <input
          type="text"
          id="name"
          name="name"
          className={styles.input}
          placeholder="Jane Doe"
          value={form.name}
          onChange={handleChange}
          required
          disabled={status === 'loading'}
        />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="email" className={styles.label}>Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          className={styles.input}
          placeholder="jane@example.com"
          value={form.email}
          onChange={handleChange}
          required
          disabled={status === 'loading'}
        />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="message" className={styles.label}>Your Message</label>
        <textarea
          id="message"
          name="message"
          className={styles.textarea}
          placeholder="How can we help you today?"
          value={form.message}
          onChange={handleChange}
          required
          disabled={status === 'loading'}
        />
      </div>

      <button type="submit" className={styles.submitBtn} disabled={status === 'loading'}>
        {status === 'loading' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}
