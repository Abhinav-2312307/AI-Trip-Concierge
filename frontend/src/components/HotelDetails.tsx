import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageSquarePlus, CheckCircle2, Sparkles, Filter } from 'lucide-react';
import type { HotelBooking, HotelRoom, ReviewSummary, ReviewCreatePayload } from '../types';
import { fetchHotelReviews, submitHotelReview, voteReviewHelpful } from '../services/api';
import { ReviewModal } from './ReviewModal';

interface HotelDetailsProps {
  hotel: HotelBooking;
  guestName?: string;
  onBack: () => void;
  onProceedToCheckout: (bookingConfig: {
    hotel: HotelBooking;
    room: HotelRoom;
    checkIn: string;
    checkInFormatted: string;
    checkOut: string;
    checkOutFormatted: string;
    nights: number;
    guests: number;
    subtotal: number;
    gst: number;
    totalAmount: number;
  }) => void;
}

export const HotelDetails: React.FC<HotelDetailsProps> = ({
  hotel,
  guestName = '',
  onBack,
  onProceedToCheckout,
}) => {
  const images = hotel.images && hotel.images.length > 0 ? hotel.images : [hotel.image_url || ''];
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Reviews state
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [travelTypeFilter, setTravelTypeFilter] = useState<string>('all');
  const [votedReviewIds, setVotedReviewIds] = useState<string[]>([]);

  useEffect(() => {
    const loadReviews = async () => {
      setReviewsLoading(true);
      try {
        const data = await fetchHotelReviews(hotel.id, travelTypeFilter);
        setReviewSummary(data);
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };
    loadReviews();
  }, [hotel.id, travelTypeFilter]);

  const handleHelpfulVote = async (reviewId: string) => {
    if (votedReviewIds.includes(reviewId)) return;
    try {
      setVotedReviewIds(prev => [...prev, reviewId]);
      const res = await voteReviewHelpful(reviewId);
      if (reviewSummary) {
        setReviewSummary({
          ...reviewSummary,
          reviews: reviewSummary.reviews.map(r =>
            r.id === reviewId ? { ...r, helpful_count: res.helpful_count, user_has_voted: true } : r
          )
        });
      }
    } catch (err) {
      console.error('Failed to vote review helpful:', err);
    }
  };

  const handleReviewSubmitted = async (payload: ReviewCreatePayload) => {
    const res = await submitHotelReview(payload);
    if (res.review) {
      const refreshed = await fetchHotelReviews(hotel.id, travelTypeFilter).catch(() => null);
      if (refreshed) {
        setReviewSummary(refreshed);
      } else if (reviewSummary) {
        setReviewSummary({
          ...reviewSummary,
          count: reviewSummary.count + 1,
          reviews: [res.review, ...reviewSummary.reviews]
        });
      }
    }
  };

  const defaultRooms: HotelRoom[] = hotel.rooms && hotel.rooms.length > 0 ? hotel.rooms : [
    { id: 'room-std', name: 'Superior Room', capacity: 2, pricePerNight: hotel.startingPrice || 22000 },
    { id: 'room-dlx', name: 'Deluxe Suite with Ocean View', capacity: 3, pricePerNight: (hotel.startingPrice || 22000) * 1.35 },
    { id: 'room-villa', name: 'Luxury Villa with Private Pool', capacity: 4, pricePerNight: (hotel.startingPrice || 22000) * 2.2 }
  ];

  const [selectedRoom, setSelectedRoom] = useState<HotelRoom>(defaultRooms[0]);

  // Date calculation defaults
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const fourDaysLater = new Date(tomorrow);
  fourDaysLater.setDate(fourDaysLater.getDate() + 3);

  const formatDateVal = (d: Date) => d.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState<string>(hotel.check_in || formatDateVal(tomorrow));
  const [checkOut, setCheckOut] = useState<string>(hotel.check_out || formatDateVal(fourDaysLater));
  const [guests, setGuests] = useState<number>(2);

  // Compute nights
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
  const calculatedNights = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));

  const subtotal = selectedRoom.pricePerNight * calculatedNights;
  const gst = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + gst;

  const formatDateDisplay = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const handleBookNow = () => {
    onProceedToCheckout({
      hotel,
      room: selectedRoom,
      checkIn,
      checkInFormatted: formatDateDisplay(checkIn),
      checkOut,
      checkOutFormatted: formatDateDisplay(checkOut),
      nights: calculatedNights,
      guests,
      subtotal,
      gst,
      totalAmount
    });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 20px 80px' }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: '#D05B3B',
          fontWeight: 700,
          fontSize: '0.92rem',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '20px',
          padding: 0
        }}
      >
        ← Back to all Goa stays
      </button>

      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{
              background: '#0B1626',
              color: '#FFFFFF',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '0.78rem',
              fontWeight: 700
            }}>
              {hotel.region}
            </span>
            <span style={{
              background: '#F1F5F9',
              color: '#334155',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '0.78rem',
              fontWeight: 600
            }}>
              {hotel.area}
            </span>
            <span style={{
              background: '#FEF3C7',
              color: '#92400E',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '0.78rem',
              fontWeight: 700
            }}>
              ⭐ {hotel.rating || 4.8} ({hotel.reviewCount || 2400} reviews)
            </span>
          </div>

          <h1 style={{
            fontSize: '2.4rem',
            fontFamily: 'Playfair Display, Georgia, serif',
            color: '#0B1626',
            margin: '0 0 6px'
          }}>
            {hotel.name}
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#64748B', margin: 0 }}>
            📍 {hotel.address || `${hotel.area}, ${hotel.region}, Goa`}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Starting rate</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#D05B3B' }}>
            ₹{(hotel.startingPrice || 22000).toLocaleString('en-IN')}{' '}
            <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#64748B' }}>/ night</span>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{
          height: '440px',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        }}>
          <img
            src={images[activeImageIndex] || images[0]}
            alt={hotel.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {images.length > 1 && (
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '6px' }}>
            {images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                style={{
                  width: '120px',
                  height: '80px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: activeImageIndex === idx ? '3px solid #D05B3B' : '2px solid transparent',
                  opacity: activeImageIndex === idx ? 1 : 0.7,
                  transition: 'all 0.2s',
                  flexShrink: 0
                }}
              >
                <img src={img} alt={`${hotel.name} ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '40px',
        alignItems: 'flex-start'
      }}>
        {/* Left Column: Description, Amenities, Highlights, Rooms */}
        <div>
          {/* Description */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.3rem', fontFamily: 'Playfair Display, serif', color: '#0B1626', marginBottom: '12px' }}>
              About the Stay
            </h2>
            <p style={{ fontSize: '0.98rem', color: '#475569', lineHeight: 1.7, margin: 0 }}>
              {hotel.description}
            </p>
          </section>

          {/* Highlights */}
          {hotel.highlights && hotel.highlights.length > 0 && (
            <section style={{
              background: '#FBF8F3',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #E28445',
              marginBottom: '32px'
            }}>
              <h3 style={{ fontSize: '1.1rem', color: '#0B1626', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✨</span> <span>Property Highlights & Concierge Perks</span>
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#334155', fontSize: '0.92rem', lineHeight: 1.5 }}>
                {hotel.highlights.map((hl, idx) => (
                  <li key={idx}><strong>{hl}</strong></li>
                ))}
              </ul>
            </section>
          )}

          {/* Amenities */}
          <section style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '1.3rem', fontFamily: 'Playfair Display, serif', color: '#0B1626', marginBottom: '16px' }}>
              Resort Amenities
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {(hotel.amenities || []).map((amenity, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    background: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: '#1E293B'
                  }}
                >
                  <span style={{ color: '#10B981', fontWeight: 800 }}>✓</span>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Room Selection */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.3rem', fontFamily: 'Playfair Display, serif', color: '#0B1626', marginBottom: '16px' }}>
              Select Room Type
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {defaultRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  style={{
                    padding: '18px 20px',
                    borderRadius: '12px',
                    border: selectedRoom.id === room.id ? '2px solid #D05B3B' : '1px solid #E2E8F0',
                    background: selectedRoom.id === room.id ? '#FFFBF8' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: selectedRoom.id === room.id ? '0 4px 12px rgba(208, 91, 59, 0.15)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0B1626', marginBottom: '4px' }}>
                      {room.name}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                      👥 Capacity: Up to {room.capacity} Guests • Free Breakfast & Wi-Fi
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#D05B3B' }}>
                      ₹{room.pricePerNight.toLocaleString('en-IN')}
                    </div>
                    <span style={{ fontSize: '0.76rem', color: '#94A3B8' }}>/ night</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Booking Card & Price Breakdown */}
        <div style={{
          position: 'sticky',
          top: '90px',
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 12px 32px rgba(11, 22, 38, 0.12)',
          border: '1px solid #E2E8F0'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontFamily: 'Playfair Display, serif', color: '#0B1626', margin: '0 0 18px' }}>
            Book Your Stay & AI Companion
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {/* Check-in / Check-out inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  📅 Check-in Date
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.86rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  📅 Check-out Date
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.86rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Guests selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                👥 Guests
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <option value={1}>1 Guest</option>
                <option value={2}>2 Guests (Standard)</option>
                <option value={3}>3 Guests</option>
                <option value={4}>4 Guests (Family / Suite)</option>
              </select>
            </div>

            {/* Selected Room Pill */}
            <div style={{
              background: '#F8FAFC',
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              fontSize: '0.86rem'
            }}>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.74rem' }}>Selected Room:</span>
              <strong style={{ color: '#0B1626' }}>{selectedRoom.name}</strong>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div style={{
            borderTop: '1px solid #E2E8F0',
            borderBottom: '1px solid #E2E8F0',
            padding: '16px 0',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            fontSize: '0.9rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
              <span>₹{selectedRoom.pricePerNight.toLocaleString('en-IN')} × {calculatedNights} night{calculatedNights > 1 ? 's' : ''}</span>
              <span style={{ fontWeight: 600, color: '#0B1626' }}>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
              <span>18% GST (Taxes & Tourism Cess)</span>
              <span style={{ fontWeight: 600, color: '#0B1626' }}>₹{gst.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981', fontWeight: 600, fontSize: '0.84rem' }}>
              <span>24/7 AI Concierge Companion</span>
              <span>Included FREE</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#0B1626',
              paddingTop: '10px',
              borderTop: '1px dashed #CBD5E1'
            }}>
              <span>Total Payable</span>
              <span style={{ color: '#D05B3B' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Booking CTA */}
          <button
            onClick={handleBookNow}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #D05B3B 0%, #E28445 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '16px',
              borderRadius: '10px',
              fontSize: '1.05rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(208, 91, 59, 0.35)',
              transition: 'transform 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Book This Stay →
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.76rem', color: '#94A3B8', marginTop: '12px', margin: '12px 0 0' }}>
            🔒 Instant confirmation • Unlocks post-booking AI concierge
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          GUEST REVIEWS & VERIFIED FEEDBACK SECTION
      ───────────────────────────────────────────────────────────── */}
      <section style={{
        marginTop: '60px',
        paddingTop: '40px',
        borderTop: '1px solid #E2E8F0'
      }}>
        {/* Section Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FFF5F0',
              color: '#FF6B4A',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              <Sparkles size={14} />
              <span>Traveller Voices</span>
            </div>
            <h2 style={{
              margin: 0,
              fontSize: '1.85rem',
              fontFamily: 'Playfair Display, serif',
              fontWeight: 800,
              color: '#0B1626'
            }}>
              Guest Reviews & Ratings
            </h2>
            <p style={{ margin: '6px 0 0', color: '#64748B', fontSize: '0.94rem' }}>
              Authentic feedback from verified guests who stayed at {hotel.name}
            </p>
          </div>

          <button
            onClick={() => setIsReviewModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A65 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '9999px',
              padding: '12px 24px',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(255, 107, 74, 0.35)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 107, 74, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 107, 74, 0.35)';
            }}
          >
            <MessageSquarePlus size={18} />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Aggregate Ratings Card */}
        {reviewSummary && (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            padding: '28px clamp(20px, 3.5vw, 36px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            marginBottom: '32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '32px',
            alignItems: 'center'
          }}>
            {/* Left Overall Score */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              paddingRight: '16px',
              borderRight: '1px solid #F1F5F9'
            }}>
              <div style={{
                width: '88px',
                height: '88px',
                borderRadius: '22px',
                background: 'linear-gradient(135deg, #FF6B4A 0%, #E28445 100%)',
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(255, 107, 74, 0.35)',
                flexShrink: 0
              }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>
                  {reviewSummary.average_rating}
                </span>
                <span style={{ fontSize: '0.74rem', opacity: 0.9, marginTop: '2px' }}>
                  out of 5
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '6px' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={18}
                      fill={s <= Math.round(reviewSummary.average_rating) ? '#FF6B4A' : '#CBD5E1'}
                      color={s <= Math.round(reviewSummary.average_rating) ? '#FF6B4A' : '#CBD5E1'}
                    />
                  ))}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0B1626' }}>
                  {reviewSummary.average_rating >= 4.7 ? 'Exceptional Stay' : reviewSummary.average_rating >= 4.0 ? 'Highly Recommended' : 'Good Experience'}
                </div>
                <div style={{ fontSize: '0.86rem', color: '#64748B', marginTop: '2px' }}>
                  Based on {reviewSummary.count} verified guest review{reviewSummary.count !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Middle Category Progress Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Hospitality & Service', score: reviewSummary.category_averages?.service || 4.9 },
                { label: 'Cleanliness & Comfort', score: reviewSummary.category_averages?.cleanliness || 4.9 },
                { label: 'Location & Views', score: reviewSummary.category_averages?.location || 4.8 },
                { label: 'Dining & Cuisine', score: reviewSummary.category_averages?.dining || 4.7 },
                { label: 'Value for Money', score: reviewSummary.category_averages?.value || 4.6 },
              ].map(({ label, score }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '150px', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                    {label}
                  </span>
                  <div style={{
                    flex: 1,
                    height: '7px',
                    background: '#F1F5F9',
                    borderRadius: '9999px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${(score / 5) * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #FF8A65 0%, #FF6B4A 100%)',
                      borderRadius: '9999px'
                    }} />
                  </div>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0B1626', width: '28px', textAlign: 'right' }}>
                    {score}
                  </span>
                </div>
              ))}
            </div>

            {/* Right Rating Distribution */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {['5', '4', '3', '2', '1'].map((starKey) => {
                const count = reviewSummary.rating_distribution?.[starKey as '5' | '4' | '3' | '2' | '1'] || 0;
                const percentage = reviewSummary.count > 0 ? (count / reviewSummary.count) * 100 : 0;
                return (
                  <div key={starKey} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                    <span style={{ width: '45px', color: '#64748B', fontWeight: 600 }}>{starKey} Star</span>
                    <div style={{
                      flex: 1,
                      height: '6px',
                      background: '#F1F5F9',
                      borderRadius: '9999px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: '#F59E0B',
                        borderRadius: '9999px'
                      }} />
                    </div>
                    <span style={{ width: '25px', textAlign: 'right', color: '#94A3B8', fontSize: '0.76rem' }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Travel Type Filter Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '24px',
          overflowX: 'auto',
          paddingBottom: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '0.84rem', fontWeight: 600, marginRight: '6px' }}>
            <Filter size={15} />
            <span>Filter by:</span>
          </div>
          {['all', 'Couple', 'Family', 'Solo', 'Friends', 'Business'].map((t) => (
            <button
              key={t}
              onClick={() => setTravelTypeFilter(t)}
              style={{
                padding: '6px 16px',
                borderRadius: '9999px',
                border: '1px solid',
                borderColor: travelTypeFilter === t ? '#FF6B4A' : '#E2E8F0',
                background: travelTypeFilter === t ? '#FFF5F0' : '#FFFFFF',
                color: travelTypeFilter === t ? '#FF6B4A' : '#475569',
                fontSize: '0.84rem',
                fontWeight: travelTypeFilter === t ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {t === 'all' ? 'All Reviews' : t}
            </button>
          ))}
        </div>

        {/* Reviews Feed */}
        {reviewsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
            Loading verified guest reviews...
          </div>
        ) : reviewSummary && reviewSummary.reviews && reviewSummary.reviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {reviewSummary.reviews.map((rev) => {
              const userInitial = rev.guest_name ? rev.guest_name.charAt(0).toUpperCase() : 'G';
              const formattedDate = new Date(rev.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div
                  key={rev.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '18px',
                    border: '1px solid #E2E8F0',
                    padding: '24px clamp(16px, 3vw, 28px)',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Top Row: User Avatar, Name, Verified Badge, Rating, Date */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #FF6B4A 0%, #E28445 100%)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1rem',
                        boxShadow: '0 3px 10px rgba(255, 107, 74, 0.3)'
                      }}>
                        {userInitial}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '0.98rem', color: '#0B1626' }}>
                            {rev.guest_name}
                          </strong>
                          {rev.verified_stay && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#ECFDF5',
                              color: '#059669',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '9999px'
                            }}>
                              <CheckCircle2 size={12} />
                              Verified Stay
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                          {rev.travel_type && <span>{rev.travel_type} Trip</span>}
                          <span>•</span>
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Star Rating Badge */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#FFF5F0',
                      padding: '5px 12px',
                      borderRadius: '9999px',
                      color: '#FF6B4A',
                      fontWeight: 800,
                      fontSize: '0.92rem'
                    }}>
                      <Star size={15} fill="#FF6B4A" color="#FF6B4A" />
                      <span>{rev.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Review Title */}
                  <h4 style={{
                    margin: '0 0 8px 0',
                    fontSize: '1.05rem',
                    color: '#0B1626',
                    fontWeight: 700,
                    lineHeight: 1.3
                  }}>
                    {rev.title}
                  </h4>

                  {/* Review Text */}
                  <p style={{
                    margin: '0 0 16px 0',
                    color: '#475569',
                    fontSize: '0.92rem',
                    lineHeight: 1.6
                  }}>
                    {rev.comment}
                  </p>

                  {/* Highlight Tags */}
                  {rev.tags && rev.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      {rev.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            color: '#64748B',
                            fontSize: '0.75rem',
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            fontWeight: 600
                          }}
                        >
                          ✓ {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer: Helpful Button */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    borderTop: '1px solid #F1F5F9',
                    paddingTop: '12px'
                  }}>
                    <button
                      onClick={() => handleHelpfulVote(rev.id)}
                      disabled={votedReviewIds.includes(rev.id) || rev.user_has_voted}
                      style={{
                        background: (votedReviewIds.includes(rev.id) || rev.user_has_voted) ? '#FFF5F0' : 'transparent',
                        border: '1px solid',
                        borderColor: (votedReviewIds.includes(rev.id) || rev.user_has_voted) ? '#FF6B4A' : '#E2E8F0',
                        borderRadius: '9999px',
                        padding: '6px 14px',
                        color: (votedReviewIds.includes(rev.id) || rev.user_has_voted) ? '#FF6B4A' : '#64748B',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: (votedReviewIds.includes(rev.id) || rev.user_has_voted) ? 'default' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <ThumbsUp size={14} />
                      <span>
                        {(votedReviewIds.includes(rev.id) || rev.user_has_voted) ? 'Helpful' : 'Helpful'} ({rev.helpful_count})
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            background: '#F8FAFC',
            borderRadius: '16px',
            padding: '40px 20px',
            textAlign: 'center',
            border: '1px dashed #CBD5E1'
          }}>
            <p style={{ color: '#64748B', margin: '0 0 12px' }}>
              No reviews found matching this filter.
            </p>
            <button
              onClick={() => setTravelTypeFilter('all')}
              style={{
                background: '#FF6B4A',
                color: '#FFFFFF',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '9999px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Show All Reviews
            </button>
          </div>
        )}
      </section>

      {/* Review Submission Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        hotel={hotel}
        guestName={guestName}
        onSubmitReview={handleReviewSubmitted}
      />
    </div>
  );
};
