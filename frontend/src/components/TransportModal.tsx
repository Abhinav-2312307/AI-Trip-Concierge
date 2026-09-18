import React from 'react';
import { X, Bike, AlertTriangle } from 'lucide-react';
import type { TransportGuideItem } from '../types';

interface TransportModalProps {
  isOpen: boolean;
  onClose: () => void;
  guideItems: TransportGuideItem[];
}

export const TransportModal: React.FC<TransportModalProps> = ({
  isOpen,
  onClose,
  guideItems,
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(11, 22, 38, 0.75)',
      backdropFilter: 'blur(4px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }} className="animate-fade-in" onClick={onClose}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '740px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--bg-card)',
          padding: '28px',
          borderRadius: 'var(--radius-md)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'var(--bg-tertiary)',
            border: 'none',
            borderRadius: 'var(--radius-xs)',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-secondary)'
          }}
        >
          <X size={16} />
        </button>

        {/* Modal Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-xs)',
            background: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF'
          }}>
            <Bike size={19} />
          </div>
          <div>
            <h3 className="font-serif" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Goa Transport & Mobility Guide
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Taj Fort Aguada Resort & Spa, Goa • Sinquerim, Candolim
            </span>
          </div>
        </div>

        {/* Advisory Alert */}
        <div style={{
          background: 'var(--bg-tertiary)',
          borderLeft: '3px solid var(--accent-primary)',
          padding: '10px 14px',
          borderRadius: '0 4px 4px 0',
          margin: '16px 0',
          fontSize: '0.84rem',
          color: 'var(--text-primary)',
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start'
        }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Local Transit Note:</strong> App cabs like Uber/Ola do not operate in Goa. Use the authorized <strong>GoaMiles App</strong> or book chauffeur service directly with our front desk.
          </div>
        </div>

        {/* Transport Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
          {guideItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-xs)',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {item.type}
                </h4>
                <span className="badge-pill badge-ocean" style={{ fontSize: '0.76rem' }}>
                  {item.cost}
                </span>
              </div>

              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <strong>Best For:</strong> {item.best_for}
              </div>

              <div style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-card)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-primary)'
              }}>
                <strong>Concierge Tip:</strong> {item.tips}
              </div>
            </div>
          ))}
        </div>

        {/* Close action */}
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button onClick={onClose} className="btn-primary" style={{ padding: '8px 20px', borderRadius: 'var(--radius-xs)' }}>
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
