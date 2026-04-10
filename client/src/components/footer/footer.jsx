'use client';
import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import styles from './footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>

        {/* Column 1: Brand & Mission */}
        <div>
          <h2 className={styles.brand}>HEAL<span className={styles.brandHighlight}>.</span></h2>
          <p className={styles.mission}>
            A safe space to grow, heal, and connect. We provide accessible wellbeing resources, therapy, and community support for everyone.
          </p>
          <div className={styles.socials}>
            <a href="#" className={styles.socialLink} aria-label="Instagram"><FaInstagram size={20} /></a>
            <a href="#" className={styles.socialLink} aria-label="Facebook"><FaFacebook size={20} /></a>
            <a href="#" className={styles.socialLink} aria-label="Twitter"><FaTwitter size={20} /></a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className={styles.heading}>Explore</h3>
          <ul className={styles.list}>
            <li><Link href="/" className={styles.link}>Home</Link></li>
            <li><Link href="/about" className={styles.link}>Our Story</Link></li>
            <li><Link href="/programmes" className={styles.link}>Upcoming Sessions</Link></li>
            <li><Link href="/donate" className={styles.link}>Support Our Mission</Link></li>
          </ul>
        </div>

        {/* Column 3: Contact */}
        <div>
          <h3 className={styles.heading}>Connect</h3>
          <ul className={styles.list}>
            <li>
              <a href="mailto:hello@healcenter.org" className={`${styles.link} ${styles.contactItem}`}>
                <Mail size={16} /> hello@healcenter.org
              </a>
            </li>
            <li>
              <a href="tel:+442012345678" className={`${styles.link} ${styles.contactItem}`}>
                <Phone size={16} /> +44 20 1234 5678
              </a>
            </li>
            <li>
              <span className={`${styles.link} ${styles.contactItem} ${styles.addressItem}`}>
                <MapPin size={16} className={styles.mapPin} />
                123 Wellness Way,<br />London, E1 6AN
              </span>
            </li>
          </ul>
        </div>

        {/* Column 4: Newsletter */}
        <div>
          <h3 className={styles.heading}>Stay Updated</h3>
          <p className={styles.mission}>
            Join our newsletter for weekly mindfulness tips and schedule updates.
          </p>
          <form className={styles.inputGroup} onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Email address"
              className={styles.input}
              required
            />
            <button type="submit" className={styles.btn}>Subscribe</button>
          </form>
        </div>

      </div>

      {/* Bottom Copyright Bar */}
      <div className={styles.bottomBar}>
        <p>&copy; {currentYear} HEAL Community Wellbeing Center. All rights reserved.</p>
        <div className={styles.bottomLinks}>
          <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
          <Link href="/terms" className={styles.link}>Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
