'use client';
import { useEffect } from 'react';

export default function UserDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[SmartTour User Dashboard Error]', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: '#FFFFFF',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(15,23,42,0.12)',
        borderRadius: 20,
        padding: '48px 40px',
        maxWidth: 440,
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(15,23,42,0.12)',
      }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0A0A0A', marginBottom: 8 }}>
          Something went wrong
        </h2>
        <p style={{
          fontSize: 13,
          color: '#4B5563',
          marginBottom: 24,
          fontFamily: 'monospace',
          wordBreak: 'break-word',
        }}>
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={reset}
          style={{
            padding: '12px 28px',
            background: '#10B981',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
