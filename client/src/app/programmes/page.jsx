'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { LayoutGrid, CalendarDays } from 'lucide-react';
import styles from './page.module.css';
import TicketCard from '../../components/programmes/Card';
import FilterSidebar from '../../components/programmes/FilterSidebar';
import CalendarView from '../../components/programmes/CalendarView';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function DirectoryPage() {
  const { isSignedIn, getToken } = useAuth();

  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ category: [], day: [], time: [] });
  const [programmes, setProgrammes] = useState([]);
  const [bookedIds, setBookedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch programmes from the API whenever search or filters change.
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
  useEffect(() => {
    const timer = setTimeout(fetchProgrammes, 300);
    return () => clearTimeout(timer);
  }, [fetchProgrammes]);

  // Fetch the signed-in user's bookings so we can mark cards as "Registered".
  useEffect(() => {
    if (!isSignedIn) { setBookedIds(new Set()); return; }

    getToken().then((token) =>
      fetch(`${API_URL}/api/bookings/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((bookings) => setBookedIds(new Set(bookings.map((b) => String(b.programmeId)))))
        .catch(() => {/* silently ignore — user just won't see Registered state */})
    );
  }, [isSignedIn, getToken]);

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
    <div className={styles.pageShell}>
      <div className={styles.layoutContainer}>

        <FilterSidebar
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          filters={filters} toggleFilter={toggleFilter}
        />

        <main className={styles.resultsArea}>
          <div className={styles.resultsHeader}>
            <div className={styles.resultsTopRow}>
              <h1 className={styles.resultsTitle}>All Programmes</h1>
              <div className={styles.viewToggle}>
                <button
                  className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.toggleActive : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <LayoutGrid size={15} /> Grid
                </button>
                <button
                  className={`${styles.toggleBtn} ${viewMode === 'calendar' ? styles.toggleActive : ''}`}
                  onClick={() => setViewMode('calendar')}
                  aria-label="Calendar view"
                >
                  <CalendarDays size={15} /> Calendar
                </button>
              </div>
            </div>
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

          {!error && viewMode === 'calendar' && (
            <CalendarView programmes={programmes} bookedIds={bookedIds} />
          )}

          {!error && viewMode === 'list' && programmes.map(item => {
            const isBooked = bookedIds.has(String(item._id));
            return (
              <TicketCard
                key={item._id}
                category={item.category}
                title={item.title}
                description={item.description}
                imageSrc={item.image}
                imageAlt={item.title}
                metaText={`${item.day} · ${item.timeStr}`}
                linkUrl={`/programmes/${item._id}`}
                isBooked={isBooked}
              />
            );
          })}
        </main>
      </div>
    </div>
  );
}
