import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Square, RotateCcw, Sparkles, Shield, Umbrella, Sun, FileText } from 'lucide-react';
import type { HotelBooking } from '../types';

interface PackingChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeHotel: HotelBooking | null;
}

interface PackingItem {
  id: string;
  category: 'beach' | 'heritage' | 'weather' | 'docs';
  title: string;
  note: string;
}

const DEFAULT_ITEMS: PackingItem[] = [
  // Beach & Sun
  { id: 'sunscreen', category: 'beach', title: 'Coral-Safe Sunscreen (SPF 50+)', note: 'Crucial for Goa afternoon UV rays and water sports.' },
  { id: 'sunglasses', category: 'beach', title: 'Polarized Sunglasses & Sun Hat', note: 'Reduces ocean glare and shields from tropical sun.' },
  { id: 'waterproof_pouch', category: 'beach', title: 'Waterproof Phone Pouch', note: 'Protects phones during boat trips, jet ski rides, and beach dips.' },
  { id: 'swimwear', category: 'beach', title: 'Swimwear & Quick-Dry Beach Towel', note: 'Resort pool & beach shacks.' },
  
  // Heritage & Temples
  { id: 'modest_wear', category: 'heritage', title: 'Shoulder & Knee-Covering Attire', note: 'Strict dress code enforced at Old Goa churches & temples.' },
  { id: 'slip_on_shoes', category: 'heritage', title: 'Slip-on Walking Sandals', note: 'Easy to remove when entering sacred heritage sites.' },
  { id: 'cotton_scarf', category: 'heritage', title: 'Lightweight Cotton Scarf', note: 'Handy for temple visits and sunset coastal breeze.' },

  // Weather & Tropical
  { id: 'linen_clothing', category: 'weather', title: 'Breathable Linen & Cotton Outfits', note: 'Goa humidity averages 70–80% year-round.' },
  { id: 'mosquito_repellent', category: 'weather', title: 'Mosquito Repellent (Odomos)', note: 'Essential for outdoor evening dinners & beach garden villas.' },
  { id: 'compact_umbrella', category: 'weather', title: 'Compact Travel Umbrella', note: 'Provides instant shade or monsoon rain protection.' },
  { id: 'power_bank', category: 'weather', title: 'Portable 20,000 mAh Power Bank', note: 'Navigation, camera, and beach day battery backup.' },

  // Docs & Nightlife
  { id: 'driving_license', category: 'docs', title: 'Physical Driver’s License', note: 'Mandatory police check requirement when renting scooters or self-drive cars.' },
  { id: 'hotel_voucher', category: 'docs', title: 'Digital Hotel Booking Voucher & ID', note: 'Fast check-in at resort reception.' },
  { id: 'evening_wear', category: 'docs', title: 'Smart Casual Evening Outfits', note: 'Required for high-end lounges like Thalassa, SFX, & Rockpool.' },
  { id: 'basic_meds', category: 'docs', title: 'Electrolytes & First-Aid Kit', note: 'Stay hydrated in coastal heat; motion sickness pills for ferry rides.' },
];

export const PackingChecklistModal: React.FC<PackingChecklistModalProps> = ({
  isOpen,
  onClose,
  activeHotel,
}) => {
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('concierge_packing_checklist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('concierge_packing_checklist', JSON.stringify(checkedIds));
  }, [checkedIds]);

  if (!isOpen) return null;

  const hotelName = activeHotel?.name || 'Taj Fort Aguada Resort & Spa';

  const toggleItem = (id: string) => {
    setCheckedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleReset = () => {
    if (window.confirm('Reset all items on your packing checklist?')) {
      setCheckedIds([]);
    }
  };

  const total = DEFAULT_ITEMS.length;
  const packedCount = checkedIds.length;
  const progressPct = Math.round((packedCount / total) * 100);

  const categories = [
    { id: 'beach', label: 'Beach & Coastal Sun', icon: <Sun size={15} color="var(--accent-primary)" /> },
    { id: 'heritage', label: 'Culture & Sacred Sites', icon: <Shield size={15} color="var(--accent-secondary)" /> },
    { id: 'weather', label: 'Tropical Weather Essentials', icon: <Umbrella size={15} color="var(--accent-warning)" /> },
    { id: 'docs', label: 'Documents & Evening Nightlife', icon: <FileText size={15} color="var(--accent-success)" /> },
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(11, 22, 38, 0.78)',
      backdropFilter: 'blur(6px)',
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
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'var(--bg-card)',
          padding: '28px',
          borderRadius: 'var(--radius-md)',
          position: 'relative',
          border: '1px solid var(--border-primary)',
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
            color: 'var(--text-secondary)',
          }}
        >
          <X size={16} />
        </button>

        {/* Modal Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-xs)',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              AI Smart Packing Checklist
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Tailored for your stay at <strong>{hotelName}</strong> and Goa’s coastal climate
            </span>
          </div>
        </div>

        {/* Progress Bar Header */}
        <div style={{
          margin: '18px 0',
          background: 'var(--bg-tertiary)',
          padding: '14px 18px',
          borderRadius: 'var(--radius-xs)',
          border: '1px solid var(--border-primary)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Packing Readiness: {packedCount} of {total} Items Packed ({progressPct}%)
            </span>
            <button
              onClick={handleReset}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.74rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="Reset packing checklist"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          <div style={{
            width: '100%',
            height: '8px',
            background: 'var(--border-primary)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progressPct}%`,
              height: '100%',
              background: progressPct === 100 ? 'var(--accent-success)' : 'var(--accent-primary)',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Checklist Groups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {categories.map((cat) => {
            const itemsInCat = DEFAULT_ITEMS.filter(i => i.category === cat.id);
            return (
              <div key={cat.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  {cat.icon}
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {cat.label}
                  </h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {itemsInCat.map((item) => {
                    const isChecked = checkedIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid',
                          borderColor: isChecked ? 'var(--accent-success)' : 'var(--border-primary)',
                          background: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span style={{ marginTop: '2px', color: isChecked ? 'var(--accent-success)' : 'var(--text-muted)' }}>
                          {isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '0.86rem',
                            fontWeight: 600,
                            color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)',
                            textDecoration: isChecked ? 'line-through' : 'none',
                          }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {item.note}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <button onClick={onClose} className="btn-primary" style={{ padding: '8px 22px', borderRadius: 'var(--radius-xs)' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
