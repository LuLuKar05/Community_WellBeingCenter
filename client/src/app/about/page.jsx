import styles from './page.module.css';

export const metadata = {
  title: 'About Us | Community Wellbeing Center',
  description: 'Learn about our mission, history, and the team behind our center.',
};

export default function AboutPage() {
  const teamMembers = [
    { name: 'Dr. Sarah Jenkins', role: 'Lead Therapist', img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=300&q=80' },
    { name: 'Marcus Chen', role: 'Yoga Instructor', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
    { name: 'Elena Rodriguez', role: 'Community Outreach', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80' },
    { name: 'David Okafor', role: 'Center Director', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
  ];

  return (
    <main className={styles.main}>
      <div className={styles.section}>
        
        {/* --- Hero --- */}
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>A foundation for <br /><i>collective</i> growth.</h1>
          <p className={styles.heroText}>
            We believe that mental, physical, and emotional wellbeing should not be a luxury. 
            Our center was founded to create a safe, accessible space where everyone in our community can heal and thrive.
          </p>
        </div>

        {/* --- Row 1: Our Story (Text Left, Image Right) --- */}
        <div className={styles.row}>
          <div className={`${styles.content} ${styles.textFirst}`}>
            <h2 className={styles.subtitle}>Our Story</h2>
            <p className={styles.bodyText}>
              Started in 2021 as a small weekly support group, we quickly realized the overwhelming need for accessible mental health and wellness resources in our neighborhood. 
            </p>
            <p className={styles.bodyText}>
              Thanks to community donations and dedicated volunteers, we opened our permanent doors in 2023, expanding our offerings to include yoga, art therapy, and financial counseling.
            </p>
          </div>
          <div className={`${styles.imageWrapper} ${styles.imgSecond}`}>
            <img 
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80" 
              alt="Community group sitting together" 
              className={styles.image} 
            />
          </div>
        </div>

        {/* --- Row 2: Our Philosophy (Image Left, Text Right) --- */}
        <div className={styles.row}>
          <div className={`${styles.imageWrapper} ${styles.imgFirst}`}>
            <img 
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&q=80" 
              alt="Yoga session" 
              className={styles.image} 
            />
          </div>
          <div className={`${styles.content} ${styles.textSecond}`}>
            <h2 className={styles.subtitle}>Our Philosophy</h2>
            <p className={styles.bodyText}>
              Healing does not happen in isolation. Our entire curriculum is built around the concept of community resilience. When one person heals, the entire neighborhood benefits.
            </p>
            <p className={styles.bodyText}>
              We operate on a "pay what you can" model, ensuring that financial barriers never prevent someone from accessing the care and community they deserve.
            </p>
          </div>
        </div>

        {/* --- Team Section --- */}
        <div className={styles.teamSection}>
          <h2 className={styles.subtitle}>Meet the Team</h2>
          <p className={styles.bodyText}>The dedicated professionals keeping our doors open.</p>
          
          <div className={styles.teamGrid}>
            {teamMembers.map((member, index) => (
              <div key={index} className={styles.teamCard}>
                <img src={member.img} alt={member.name} className={styles.teamImg} />
                <h3 className={styles.memberName}>{member.name}</h3>
                <span className={styles.memberRole}>{member.role}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}