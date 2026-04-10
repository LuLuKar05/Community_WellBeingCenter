import { Mail, Phone, MapPin, Clock, ChevronDown } from 'lucide-react';
import styles from './page.module.css';
import ContactForm from './ContactForm';

export const metadata = {
  title: 'Contact & FAQs | Community Wellbeing Center',
  description: 'Get in touch with our team or find answers to frequently asked questions.',
};

export default function ContactPage() {
  const faqs = [
    {
      question: "Do I need to book a class in advance?",
      answer: "While we do accept walk-ins if space permits, we highly recommend booking in advance through our website to guarantee your spot, as our therapy circles and yoga classes often fill up quickly."
    },
    {
      question: "How does the 'Pay What You Can' model work?",
      answer: "We believe wellbeing should be accessible to everyone. Our classes have a suggested donation amount (usually £5-£10), but if you are unable to pay, you can select the 'Free' option when booking. No questions asked."
    },
    {
      question: "Is the center wheelchair accessible?",
      answer: "Yes, our entire ground floor, including the main studio, consultation rooms, and restrooms, are fully wheelchair accessible. If you need any specific accommodations, please let us know."
    },
    {
      question: "Can I cancel a booking if I can't make it?",
      answer: "Absolutely. You can cancel your booking via your User Dashboard up to 2 hours before the class starts. This allows us to offer the spot to someone on our waiting list."
    },
    {
      question: "Do you offer one-on-one therapy?",
      answer: "Currently, our center focuses on peer-supported group sessions and holistic workshops. However, our staff can provide referrals to trusted one-on-one professional therapists in the local area."
    }
  ];

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>We're here for you.</h1>
        <p className={styles.subtitle}>
          Whether you have a question about our programs, need help with a booking, or just want to say hello, our doors and inboxes are always open.
        </p>
      </div>

      <div className={styles.grid}>
        
        {/* --- LEFT COLUMN: Contact Form & Info --- */}
        <div>
          <div className={styles.infoCard}>
            <ul className={styles.infoList}>
              <li className={styles.infoItem}>
                <div className={styles.iconWrapper}><MapPin size={24} /></div>
                <div>
                  <strong>Visit Us</strong><br />
                  123 Wellness Way, London, E1 6AN
                </div>
              </li>
              <li className={styles.infoItem}>
                <div className={styles.iconWrapper}><Clock size={24} /></div>
                <div>
                  <strong>Opening Hours</strong><br />
                  Mon-Fri: 9:00 AM - 8:00 PM<br />
                  Sat-Sun: 10:00 AM - 4:00 PM
                </div>
              </li>
              <li className={styles.infoItem}>
                <div className={styles.iconWrapper}><Phone size={24} /></div>
                <div>
                  <strong>Call Us</strong><br />
                  +44 20 1234 5678
                </div>
              </li>
              <li className={styles.infoItem}>
                <div className={styles.iconWrapper}><Mail size={24} /></div>
                <div>
                  <strong>Email Us</strong><br />
                  hello@healcenter.org
                </div>
              </li>
            </ul>
          </div>

          <ContactForm />
        </div>

        {/* --- RIGHT COLUMN: FAQs --- */}
        <div>
          <h2 className={styles.faqSectionTitle}>Common Questions</h2>
          <div className={styles.faqList}>
            {faqs.map((faq, index) => (
              /* The HTML <details> tag handles the open/close state natively! */
              <details key={index} className={styles.faqItem} name="faq-accordion">
                <summary className={styles.faqQuestion}>
                  {faq.question}
                  <ChevronDown size={20} className={styles.chevron} />
                </summary>
                <div className={styles.faqAnswer}>
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}