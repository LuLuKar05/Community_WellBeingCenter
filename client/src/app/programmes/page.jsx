'use client';
import React, { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import TicketCard from '../../components/programmes/Card';
import FilterSidebar from '../../components/programmes/FilterSidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function DirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ category: [], day: [], time: [] });
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch programmes from the API whenever search or filters change.
  // useCallback memoises the function so the useEffect dependency is stable.
  const fetchProgrammes = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (searchQuery.trim())        params.set('search',   searchQuery.trim());
    if (filters.category.length)   params.set('category', filters.category.join(','));
    if (filters.day.length)        params.set('day',      filters.day.join(','));
    if (filters.time.length)       params.set('time',     filters.time.join(','));

    try {
      const res = await fetch(`${API_URL}/api/programmes?${params.toString()}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setProgrammes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters]);

  // Debounce: wait 300ms after the user stops typing before firing the fetch.
  // Filter chip changes (no typing) fire immediately via the dependency update.
  useEffect(() => {
    const timer = setTimeout(fetchProgrammes, 300);
    return () => clearTimeout(timer);
  }, [fetchProgrammes]);

  const toggleFilter = (group, value) => {
    setFilters(prev => {
      const currentGroup = prev[group];
      const newGroup = currentGroup.includes(value)
        ? currentGroup.filter(item => item !== value)
        : [...currentGroup, value];
      return { ...prev, [group]: newGroup };
    });
  };

  const removeFilter = (group, value) => {
    setFilters(prev => ({ ...prev, [group]: prev[group].filter(item => item !== value) }));
  };

  const activeChips = Object.entries(filters).flatMap(([group, values]) =>
    values.map(val => ({ group, val }))
  );

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '1px 0' }}>
      <div className={styles.layoutContainer}>

        <FilterSidebar
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          filters={filters} toggleFilter={toggleFilter}
        />

        <main className={styles.resultsArea}>
          <div className={styles.resultsHeader}>
            <h1 className={styles.resultsTitle}>All Programmes</h1>
            <div className={styles.resultsMeta}>
              {loading ? 'Loading…' : `Showing ${programmes.length} result${programmes.length !== 1 ? 's' : ''}`}
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className={styles.activeFilters}>
              {activeChips.map((chip, idx) => (
                <div key={idx} className={styles.activeChip}>
                  {chip.val} <button onClick={() => removeFilter(chip.group, chip.val)}>×</button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className={styles.emptyState}>
              <h3>Could not load programmes</h3>
              <p>{error}</p>
            </div>
          )}

          {!error && !loading && programmes.length === 0 && (
            <div className={styles.emptyState}>
              <h3>No classes found</h3>
              <p>Try adjusting your search or clearing some filters.</p>
            </div>
          )}

          {!error && programmes.map(item => (
            <TicketCard
              key={item._id}
              category={item.category}
              title={item.title}
              description={item.description}
              imageSrc={item.image}
              imageAlt={item.title}
              metaText={`${item.day} · ${item.timeStr}`}
              linkUrl={`/programmes/${item._id}`}
              buttonText="Book Now"
            />
          ))}
        </main>
      </div>
    </div>
  );
}
