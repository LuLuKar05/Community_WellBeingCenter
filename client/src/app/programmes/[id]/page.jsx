'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import BookingWizard from '../../../components/BookingWizard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function LoadingSkeleton() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf9f7' }}>
      <p style={{ color: '#8c7a6b', fontStyle: 'italic', fontSize: '1rem' }}>Loading programme…</p>
    </div>
  );
}

function NotFound() {
  const router = useRouter();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#faf9f7', gap: '1rem' }}>
      <h2 style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: '2rem', color: '#1a1a1a' }}>Programme not found</h2>
      <button
        onClick={() => router.push('/programmes')}
        style={{ background: '#1a1a1a', color: '#fff', border: 'none', padding: '0.75rem 2rem', cursor: 'pointer', fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
      >
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
