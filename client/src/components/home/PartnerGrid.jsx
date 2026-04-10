import React from 'react';
import styles from './PartnerGrid.module.css';

export default function PartnerGrid() {
  const partners = [
    { id: 1, name: "Community Foundation", logo: "https://placehold.co/300x100/transparent/111827?text=Community+Foundation" },
    { id: 2, name: "Health Alliance", logo: "https://placehold.co/300x100/transparent/111827?text=Health+Alliance" },
    { id: 3, name: "Mindful Tech", logo: "https://placehold.co/300x100/transparent/111827?text=Mindful+Tech" },
    { id: 4, name: "Local Borough Council", logo: "https://placehold.co/300x100/transparent/111827?text=Local+Borough+Council" },
    { id: 5, name: "Wellness Network", logo: "https://placehold.co/300x100/transparent/111827?text=Wellness+Network" },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h3 className={styles.title}>Proudly supported by our community partners</h3>
        
        <div className={styles.grid}>
          {partners.map((partner) => (
            <div key={partner.id} className={styles.logoWrapper} aria-label={partner.name}>
              <img 
                src={partner.logo} 
                alt={`${partner.name} Logo`} 
                className={styles.logo} 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}