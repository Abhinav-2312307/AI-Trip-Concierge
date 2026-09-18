import React, { useState } from 'react';
import type { TripSetupRequest } from '../types';
import { setupCustomTrip, fetchTripContext, clearCustomTrip } from '../services/api';

interface TripSetupViewProps {
  onSetupComplete: (context: any) => void;
}

export const TripSetupView: React.FC<TripSetupViewProps> = ({ onSetupComplete }) => {
  const [formData, setFormData] = useState<TripSetupRequest>({
    destination: '',
    hotel_name: '',
    check_in: '',
    check_out: '',
    guest_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.destination.trim()) {
      setError('Destination is required.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await setupCustomTrip(formData);
      // Wait a moment for backend to fetch geocode/weather data
      const contextRes = await fetchTripContext();
      onSetupComplete(contextRes);
    } catch (err: any) {
      setError(err.message || 'Failed to setup trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await clearCustomTrip();
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in" style={{ padding: '24px' }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
        backdropFilter: 'blur(16px)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        boxShadow: 'var(--shadow-elevated)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--accent-primary)', marginBottom: '8px' }}>
            🌍 Plan Your Dream Trip
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Tell us where you're going, and your AI Concierge will craft a personalized itinerary, fetch real-time weather, and provide local insights.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              Destination <span style={{ color: 'var(--accent-primary)' }}>*</span>
            </label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="e.g. Bali, Paris, Tokyo, New York"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent-primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-primary)')}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              Hotel / Stay Name (Optional)
            </label>
            <input
              type="text"
              name="hotel_name"
              value={formData.hotel_name}
              onChange={handleChange}
              placeholder="e.g. The Ritz-Carlton, Airbnb Downtown"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent-primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-primary)')}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                Check-in Date (Optional)
              </label>
              <input
                type="date"
                name="check_in"
                value={formData.check_in}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  colorScheme: 'light dark'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                Check-out Date (Optional)
              </label>
              <input
                type="date"
                name="check_out"
                value={formData.check_out}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  colorScheme: 'light dark'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              Guest Name (Optional)
            </label>
            <input
              type="text"
              name="guest_name"
              value={formData.guest_name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent-primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-primary)')}
            />
          </div>

          {error && (
            <div style={{ color: '#F87171', fontSize: '0.9rem', background: 'rgba(248, 113, 113, 0.1)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px',
                background: loading ? 'var(--accent-secondary)' : 'var(--accent-primary)',
                color: '#FFF',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s, transform 0.1s',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseDown={e => !loading && (e.currentTarget.style.transform = 'scale(0.98)')}
              onMouseUp={e => !loading && (e.currentTarget.style.transform = 'scale(1)')}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  Setting up magic...
                </>
              ) : (
                '🚀 Start AI Trip Concierge'
              )}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>
            Want to see the original Goa demo mode?
          </p>
          <button 
            onClick={handleReset}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            Reset to Demo Mode
          </button>
        </div>
      </div>
    </div>
  );
};
