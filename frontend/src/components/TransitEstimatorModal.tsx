import React, { useState } from 'react';
import { X, Bike, Car, ExternalLink, PhoneCall, AlertTriangle, ShieldCheck, Navigation } from 'lucide-react';
import type { HotelBooking } from '../types';

interface TransitEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeHotel: HotelBooking | null;
  onAskConcierge: (prompt: string) => void;
}

interface DestinationPreset {
  name: string;
  distanceKm: number;
  category: 'Airport' | 'Heritage' | 'Beach' | 'Dining';
}

export const TransitEstimatorModal: React.FC<TransitEstimatorModalProps> = ({
  isOpen,
  onClose,
  activeHotel,
  onAskConcierge,
}) => {
  const [selectedDistance, setSelectedDistance] = useState<number>(15);
  const [selectedVehicle, setSelectedVehicle] = useState<'scooter' | 'hatchback' | 'sedan' | 'suv'>('hatchback');

  if (!isOpen) return null;

  const hotelName = activeHotel?.name || 'Taj Fort Aguada Resort & Spa';
  const hotelArea = activeHotel?.area || 'Candolim';

  const presets: DestinationPreset[] = [
    { name: 'Manohar Int. Airport (Mopa / GOX)', distanceKm: 34, category: 'Airport' },
    { name: 'Dabolim Airport (GOI)', distanceKm: 38, category: 'Airport' },
    { name: 'Panjim Latin Quarter (Fontainhas)', distanceKm: 14, category: 'Heritage' },
    { name: 'Assagao Bohemian Dining Strip', distanceKm: 12, category: 'Dining' },
    { name: 'Anjuna & Vagator Sunset Cliffs', distanceKm: 16, category: 'Beach' },
    { name: 'Palolem Beach & South Goa', distanceKm: 74, category: 'Beach' },
  ];

  // Pricing calculations
  const calculateFare = (km: number, vehicle: string) => {
    switch (vehicle) {
      case 'scooter':
        return {
          rate: '₹450 – ₹600 / day',
          total: Math.max(500, Math.round(km * 8 + 450)),
          desc: 'Honda Activa 125cc • Freedom to navigate village lanes',
          timing: `${Math.round(km * 2.2)} mins`,
        };
      case 'hatchback':
        return {
          rate: '₹40 / km (min ₹500)',
          total: Math.max(500, Math.round(km * 42)),
          desc: 'Maruti WagonR / Swift • AC • Up to 3 passengers',
          timing: `${Math.round(km * 2.0)} mins`,
        };
      case 'sedan':
        return {
          rate: '₹55 / km (min ₹700)',
          total: Math.max(700, Math.round(km * 55)),
          desc: 'Toyota Etios / Honda City • Air-Conditioned comfort',
          timing: `${Math.round(km * 1.9)} mins`,
        };
      case 'suv':
        return {
          rate: '₹80 / km (min ₹1,100)',
          total: Math.max(1100, Math.round(km * 82)),
          desc: 'Toyota Innova Crysta • Premium leather seats, 6-7 seats',
          timing: `${Math.round(km * 1.9)} mins`,
        };
      default:
        return {
          rate: '₹55 / km (min ₹700)',
          total: Math.max(700, Math.round(km * 55)),
          desc: 'Toyota Etios / Honda City • Air-Conditioned comfort',
          timing: `${Math.round(km * 1.9)} mins`,
        };
    }
  };

  const currentFare = calculateFare(selectedDistance, selectedVehicle);

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
          maxWidth: '780px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-xs)',
            background: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
          }}>
            <Car size={22} />
          </div>
          <div>
            <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Goa Transit & Taxi Fare Estimator
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Origin: <strong>{hotelName}</strong> ({hotelArea}) • Avoid Tourist Taxi Overcharging
            </span>
          </div>
        </div>

        {/* Local Caution Notice */}
        <div style={{
          background: 'var(--bg-tertiary)',
          borderLeft: '4px solid var(--accent-primary)',
          padding: '10px 14px',
          borderRadius: '0 4px 4px 0',
          margin: '16px 0',
          fontSize: '0.82rem',
          color: 'var(--text-primary)',
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start',
        }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--accent-primary)' }} />
          <div>
            <strong>Goa Transit Insight:</strong> Standard ride-hailing apps like Uber and Ola are strictly banned in Goa. Use this calculator for fair price benchmarking when booking local taxis, or use the official state-authorized <strong>GoaMiles App</strong>.
          </div>
        </div>

        {/* Quick Destination Presets */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
            Select Popular Destination from {hotelName}:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
            {presets.map((dest, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDistance(dest.distanceKm)}
                style={{
                  textAlign: 'left',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid',
                  borderColor: selectedDistance === dest.distanceKm ? 'var(--accent-primary)' : 'var(--border-primary)',
                  background: selectedDistance === dest.distanceKm ? 'rgba(208, 91, 59, 0.1)' : 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: selectedDistance === dest.distanceKm ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                    {dest.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {dest.category} • ~{dest.distanceKm} km
                  </div>
                </div>
                {selectedDistance === dest.distanceKm && <Navigation size={14} color="var(--accent-primary)" />}
              </button>
            ))}
          </div>
        </div>

        {/* Distance Slider */}
        <div style={{
          background: 'var(--bg-tertiary)',
          padding: '14px 18px',
          borderRadius: 'var(--radius-xs)',
          border: '1px solid var(--border-primary)',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Custom One-Way Distance:
            </span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--accent-primary)' }}>
              {selectedDistance} km (~{Math.round(selectedDistance * 2.0)} mins drive)
            </strong>
          </div>
          <input
            type="range"
            min="2"
            max="80"
            value={selectedDistance}
            onChange={(e) => setSelectedDistance(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
          />
        </div>

        {/* Vehicle Selector Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
          {[
            { id: 'scooter', label: 'Scooter (Rental)', icon: <Bike size={16} /> },
            { id: 'hatchback', label: 'AC Hatchback', icon: <Car size={16} /> },
            { id: 'sedan', label: 'Prime Sedan', icon: <Car size={16} /> },
            { id: 'suv', label: 'Innova / SUV', icon: <Car size={16} /> },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVehicle(v.id as any)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 8px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid',
                borderColor: selectedVehicle === v.id ? 'var(--accent-primary)' : 'var(--border-primary)',
                background: selectedVehicle === v.id ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: selectedVehicle === v.id ? '#FFFFFF' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.78rem',
                transition: 'all 0.15s ease',
              }}
            >
              {v.icon}
              <span>{v.label}</span>
            </button>
          ))}
        </div>

        {/* Fare Result Card */}
        <div className="glass-card" style={{
          padding: '18px 22px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--accent-primary)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <div>
            <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Estimated Fair Market Rate
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              ₹{currentFare.total}
              <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '6px' }}>
                ({currentFare.rate})
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
              {currentFare.desc} • Estimated Duration: <strong>{currentFare.timing}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <a
              href="https://www.goamiles.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ fontSize: '0.8rem', padding: '8px 14px', textDecoration: 'none', gap: '4px' }}
            >
              <ExternalLink size={13} /> Open GoaMiles
            </a>

            <button
              onClick={() => {
                onClose();
                onAskConcierge(`Can you help book a chauffeur service from ${hotelName} to our destination (${selectedDistance} km)? What are the exact hotel vehicle rates?`);
              }}
              className="btn-terracotta"
              style={{ fontSize: '0.8rem', padding: '8px 14px', gap: '4px' }}
            >
              <PhoneCall size={13} /> Request Hotel Chauffeur
            </button>
          </div>
        </div>

        {/* Regulations / Tips */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="var(--accent-success)" />
            <span>Prepaid counters available at both GOI & GOX airports</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="var(--accent-success)" />
            <span>Night rides (11 PM - 5 AM) incur a standard +25% surcharge</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="var(--accent-success)" />
            <span>Helmets mandatory for rider & pillion on all Goan highways</span>
          </div>
        </div>
      </div>
    </div>
  );
};
