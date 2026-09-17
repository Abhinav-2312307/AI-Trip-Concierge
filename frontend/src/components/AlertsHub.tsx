import React from 'react';
import { ArrowRight, MessageSquare } from 'lucide-react';
import type { SmartAlert, HotelBooking } from '../types';

interface AlertsHubProps {
  alerts: SmartAlert[];
  activeHotel: HotelBooking | null;
  guestName?: string;
  onSimulate: (type: string) => void;
  onAlertAction: (alert: SmartAlert) => void;
  onDismissAlert: (id: string) => void;
}

export const AlertsHub: React.FC<AlertsHubProps> = ({
  alerts,
  activeHotel,
  guestName,
  onSimulate,
  onAlertAction,
  onDismissAlert,
}) => {
  const hotelName = activeHotel?.name || 'Taj Fort Aguada Resort & Spa, Goa';
  const hotelArea = activeHotel?.area || 'Candolim';

  const alertTypes = [
    { id: 'checkin_reminder', label: '🔑 Digital Room Key & Welcome Pass', desc: `Suite activation and check-in pass for ${hotelName}` },
    { id: 'rain_baga', label: `🌧️ Weather Advisory (${hotelArea})`, desc: 'Rain radar update with indoor dining suggestions' },
    { id: 'sunset_countdown', label: '🌅 Golden Hour Countdown', desc: `Alerts 45 mins before peak golden light near ${hotelArea}` },
    { id: 'high_tide', label: `🌊 Coastal Swell & Tide Advisory`, desc: `Sea conditions and lifeguard recommendations in ${activeHotel?.region || 'Goa'}` },
  ];

  return (
    <div className="animate-fade-in" style={{ marginTop: '12px', maxWidth: '920px', margin: '12px auto 0' }}>
      {/* Simulation Control Bar */}
      <div className="glass-card" style={{
        padding: '20px 24px',
        marginBottom: '20px',
        background: '#FFFFFF',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{
                background: 'rgba(208, 91, 59, 0.1)',
                color: 'var(--color-terracotta-500)',
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--radius-xs)',
              }}>
                Active Stay: {hotelName}
              </span>
            </div>
            <h2 className="font-serif" style={{ fontSize: '1.45rem', fontWeight: 700, color: '#101F35', margin: 0 }}>
              Proactive Guest Alerts
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.86rem', marginTop: '2px', marginBottom: 0 }}>
              Real-time contextual notifications for check-in milestones, weather advisories, and coastal conditions.
            </p>
          </div>
        </div>

        {/* Action buttons to trigger alerts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
          {alertTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => onSimulate(t.id)}
              style={{
                textAlign: 'left',
                padding: '10px 12px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--color-sand-50)',
                border: '1px solid var(--card-border)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-terracotta-500)';
                e.currentTarget.style.background = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--card-border)';
                e.currentTarget.style.background = 'var(--color-sand-50)';
              }}
            >
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#101F35' }}>
                {t.label}
              </span>
              <span style={{ fontSize: '0.74rem', color: '#64748B', lineHeight: 1.3 }}>
                {t.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#101F35', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Active Notifications</span>
            <span className="badge-pill badge-ocean" style={{ fontSize: '0.72rem' }}>
              {alerts.length}
            </span>
          </h3>
        </div>

        {alerts.length === 0 ? (
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: '#64748B', fontSize: '0.88rem', background: '#FFFFFF' }}>
            No active alerts at this moment. Trigger any scenario above to test live simulation.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="glass-card"
              style={{
                padding: '16px 20px',
                background: '#FFFFFF',
                borderLeft: `4px solid ${
                  alert.severity === 'warning' ? '#D05B3B' : (alert.severity === 'info' ? '#1E3A63' : '#265943')
                }`,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.5rem' }}>{alert.icon}</span>
                  <div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#101F35', margin: 0 }}>
                      {alert.title}
                    </h4>
                    <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                      {alert.timestamp || 'Just now'} • Verified for {hotelName} Guest{guestName ? `: ${guestName}` : ''}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onDismissAlert(alert.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    padding: '2px 6px'
                  }}
                >
                  Dismiss
                </button>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, background: 'var(--color-sand-50)', padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--card-border)', margin: 0 }}>
                {alert.message}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontSize: '0.82rem', color: '#D05B3B', fontWeight: 500 }}>
                  Suggested Action: <strong>{alert.recommended_action}</strong>
                </div>

                <button
                  onClick={() => onAlertAction(alert)}
                  className="btn-primary"
                  style={{ fontSize: '0.78rem', padding: '5px 12px', borderRadius: 'var(--radius-xs)' }}
                >
                  <MessageSquare size={12} /> Ask Concierge <ArrowRight size={11} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
