'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import BookingWizard from '../../../components/BookingWizard';
import styles from './detail.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function LoadingSkeleton() {
  return (
    <div className={styles.loadingShell}>
      <p className={styles.loadingText}>Loading programme…</p>
    </div>
  );
}

function NotFound() {
  const router = useRouter();
  return (
    <div className={styles.notFoundShell}>
      <h2 className={styles.notFoundTitle}>Programme not found</h2>
      <button className={styles.notFoundBtn} onClick={() => router.push('/programmes')}>
        Back to Programmes
      </button>
    </div>
  );
}

export default function ProgrammeDetailPage() {
  const { id } = useParams();
  const [programme, setProgramme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/api/programmes/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => { if (data) setProgramme(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)  return <LoadingSkeleton />;
  if (notFound) return <NotFound />;
  return <BookingWizard programme={programme} />;
}
