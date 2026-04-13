import React from 'react';
import styles from './PartnerGrid.module.css';

export default function PartnerGrid() {
  const partners = [
    { id: 1, name: "Community Foundation", logo: "https://placehold.co/300x100/transparent/111827?text=Community+Foundation" },
    { id: 2, name: "Health Alliance", logo: "https://placehold.co/300x100/transparent/111827?text=Health+Alliance" },
    { id: 3, name: "Mindful Tech", logo: "https://placehold.co/300x100/transparent/111827?text=Mindful+Tech" },
    { id: 4, name: "Borough Council", logo: "https://placehold.co/300x100/transparent/111827?text=Borough+Council" },
    { id: 5, name: "Wellness Network", logo: "https://placehold.co/300x100/transparent/111827?text=Wellness+Network" },
  ];

  // We duplicate the array so the marquee loops seamlessly without blank space
  const duplicatedPartners = [...partners, ...partners];

  return (
    <section className={styles.section}>
      <h3 className={styles.title}>Proudly supported by our community partners</h3>
      
      <div className={styles.scroller}>
        <div className={styles.scrollerInner}>
          {duplicatedPartners.map((partner, index) => (
            <div key={`${partner.id}-${index}`} className={styles.logoWrapper} aria-label={partner.name}>
              <img 
                src={partner.logo} 
                alt={`${partner.name} Logo`} 
                className={styles.logo} 
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}