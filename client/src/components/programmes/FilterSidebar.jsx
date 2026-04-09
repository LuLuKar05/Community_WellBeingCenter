// components/FilterSidebar.jsx
'use client';
import React, { useState } from 'react';
import styles from './FilterSidebar.module.css';

// 1. Reusable Accordion Wrapper (FIXED)
const AccordionGroup = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={styles.accordionGroup}>
      {/* FIX: Removed the active class from the button itself */}
      <button 
        className={styles.accordionTrigger} 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {title} 
        {/* FIX: Moved the active rotation class ONLY to the arrow span */}
        <span className={`${styles.chevron} ${isOpen ? styles.chevronActive : ''}`}>
          ▼
        </span>
      </button>
      <div className={`${styles.accordionContent} ${isOpen ? styles.accordionContentActive : ''}`}>
        {children}
      </div>
    </div>
  );
};

// 2. Main Sidebar Component
export default function FilterSidebar({ 
  searchQuery, 
  setSearchQuery, 
  filters, 
  toggleFilter 
}) {
  
  // Helper to render the custom accessible checkboxes
  const renderCheckbox = (group, value, label) => {
    const currentGroup = filters[group] || [];
    const isChecked = currentGroup.includes(value);
    
    return (
      <label key={value} className={styles.checkboxLabel}>
        <input 
          type="checkbox" 
          checked={isChecked} 
          onChange={() => toggleFilter(group, value)} 
        />
        <div className={`${styles.customCheck} ${isChecked ? styles.isChecked : ''}`}></div> 
        {label}
      </label>
    );
  };

  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.sidebarHeader}>Filters</h2>
      
      {/* Search Input */}
      <div className={styles.searchWrapper}>
        <input 
          type="text" 
          className={styles.searchInput} 
          placeholder="Search classes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Accordion 1: Category */}
      <AccordionGroup title="Category" defaultOpen={true}>
        {renderCheckbox('category', 'Movement & Yoga', 'Movement & Yoga')}
        {renderCheckbox('category', 'Mental Health', 'Mental Health')}
        {renderCheckbox('category', 'Community Support', 'Community Support')}
        {renderCheckbox('category', 'Events', 'Events')}
      </AccordionGroup>

      {/* Accordion 2: Day of Week */}
      <AccordionGroup title="Day of Week">
        {renderCheckbox('day', 'Monday', 'Monday')}
        {renderCheckbox('day', 'Tuesday', 'Tuesday')}
        {renderCheckbox('day', 'Wednesday', 'Wednesday')}
        {renderCheckbox('day', 'Thursday', 'Thursday')}
        {renderCheckbox('day', 'Friday', 'Friday')}
      </AccordionGroup>

      {/* Accordion 3: Time of Day */}
      <AccordionGroup title="Time of Day">
        {renderCheckbox('time', 'Mornings (Before 12pm)', 'Mornings (Before 12pm)')}
        {renderCheckbox('time', 'Afternoons (12pm - 5pm)', 'Afternoons (12pm - 5pm)')}
        {renderCheckbox('time', 'Evenings (After 5pm)', 'Evenings (After 5pm)')}
      </AccordionGroup>

    </aside>
  );
}