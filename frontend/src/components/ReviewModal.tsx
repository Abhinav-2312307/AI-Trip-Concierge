import React, { useState } from 'react';
import { Star, X, Sparkles, Check, Heart } from 'lucide-react';
import type { HotelBooking, ReviewCreatePayload } from '../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotel: HotelBooking;
  guestName?: string;
  onSubmitReview: (payload: ReviewCreatePayload) => Promise<void>;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  hotel,
  guestName = '',
  onSubmitReview,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);

  const [categoryRatings, setCategoryRatings] = useState({
    cleanliness: 5,
    service: 5,
    location: 5,
    dining: 5,
    value: 5,
  });

  const [travelType, setTravelType] = useState<string>('Couple');
  const [name, setName] = useState<string>(guestName || '');
  const [title, setTitle] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Ocean View', 'Romantic Sunset']);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const availableTags = [
    'Ocean View',
    'Private Beach',
    'Romantic Sunset',
    'Jiva Spa',
    'Delicious Breakfast',
    'Cocktails & Vibe',
    'Serene Luxury',
    'Infinity Pool',
    'Kid Friendly',
    'Heritage Charm'
  ];

  const travelTypes = ['Couple', 'Family', 'Solo', 'Friends', 'Business'];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !comment.trim() || !name.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    if (comment.trim().length < 10) {
      setErrorMsg('Please provide a slightly more detailed review (minimum 10 characters).');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await onSubmitReview({
        hotel_id: hotel.id,
        guest_name: name.trim(),
        rating,
        category_ratings: categoryRatings,
        travel_type: travelType,
        title: title.trim(),
        comment: comment.trim(),
        tags: selectedTags,
        verified_stay: true,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(11, 22, 38, 0.78)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      padding: '20px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '580px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
        position: 'relative',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        padding: '32px clamp(20px, 4vw, 36px)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748B',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#E2E8F0';
            e.currentTarget.style.color = '#0B1626';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#F1F5F9';
            e.currentTarget.style.color = '#64748B';
          }}
        >
          <X size={18} />
        </button>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#ECFDF5',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
            }}>
              <Check size={32} strokeWidth={3} />
            </div>
            <h3 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.6rem',
              color: '#0B1626',
              margin: '0 0 8px'
            }}>
              Thank You for Your Review!
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.94rem' }}>
              Your feedback has been published and helps fellow Goa travellers discover great stays.
            </p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#FFF5F0',
                color: '#FF6B4A',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                <Sparkles size={13} />
                <span>Verified Guest Review</span>
              </div>
              <h2 style={{
                margin: 0,
                fontSize: '1.65rem',
                fontFamily: 'Playfair Display, serif',
                fontWeight: 800,
                color: '#0B1626',
                lineHeight: 1.2
              }}>
                Rate Your Stay
              </h2>
              <p style={{ margin: '6px 0 0', color: '#64748B', fontSize: '0.92rem' }}>
                {hotel.name} • {hotel.area}
              </p>
            </div>

            {errorMsg && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#B91C1C',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.86rem',
                marginBottom: '20px'
              }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Overall Star Rating */}
              <div style={{
                background: '#F8FAFC',
                borderRadius: '16px',
                padding: '18px',
                textAlign: 'center',
                border: '1px solid #E2E8F0'
              }}>
                <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  Overall Experience Rating
                </span>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          transform: active ? 'scale(1.15)' : 'scale(1)',
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        <Star
                          size={32}
                          fill={active ? '#FF6B4A' : 'none'}
                          color={active ? '#FF6B4A' : '#CBD5E1'}
                          strokeWidth={2}
                        />
                      </button>
                    );
                  })}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: '#FF6B4A',
                  marginTop: '8px'
                }}>
                  {rating === 5 && '⭐️⭐️⭐️⭐️⭐️ Exceptional'}
                  {rating === 4 && '⭐️⭐️⭐️⭐️ Very Good'}
                  {rating === 3 && '⭐️⭐️⭐️ Average'}
                  {rating === 2 && '⭐️⭐️ Below Expectation'}
                  {rating === 1 && '⭐️ Poor'}
                </div>
              </div>

              {/* Sub-Category Ratings */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#0B1626', marginBottom: '10px' }}>
                  Detailed Ratings
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                  {[
                    { key: 'cleanliness', label: '✨ Cleanliness & Hygiene' },
                    { key: 'service', label: '🛎️ Hospitality & Service' },
                    { key: 'location', label: '🌅 Location & Views' },
                    { key: 'dining', label: '🍽️ Dining & Breakfast' },
                    { key: 'value', label: '💎 Value for Money' },
                  ].map(({ key, label }) => (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#F8FAFC',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0'
                      }}
                    >
                      <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 600 }}>{label}</span>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setCategoryRatings(prev => ({ ...prev, [key]: s }))}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '2px',
                              cursor: 'pointer'
                            }}
                          >
                            <Star
                              size={15}
                              fill={(categoryRatings as any)[key] >= s ? '#F59E0B' : 'none'}
                              color={(categoryRatings as any)[key] >= s ? '#F59E0B' : '#CBD5E1'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Travel Type */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#0B1626', marginBottom: '8px' }}>
                  Who did you travel with?
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {travelTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTravelType(type)}
                      style={{
                        padding: '7px 16px',
                        borderRadius: '9999px',
                        border: '1px solid',
                        borderColor: travelType === type ? '#FF6B4A' : '#CBD5E1',
                        background: travelType === type ? '#FFF5F0' : '#FFFFFF',
                        color: travelType === type ? '#FF6B4A' : '#475569',
                        fontSize: '0.84rem',
                        fontWeight: travelType === type ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Title Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aditya Sharma"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Review Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Magical sunset views and great service!"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Detailed Review Comment */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Your Experience Details *
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about the room, hospitality, views, breakfast, or concierge recommendations..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Highlight Tags */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Select Stay Highlights
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '9999px',
                          border: '1px solid',
                          borderColor: isSelected ? '#FF6B4A' : '#E2E8F0',
                          background: isSelected ? '#FFF1EE' : '#F8FAFC',
                          color: isSelected ? '#FF6B4A' : '#64748B',
                          fontSize: '0.78rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '}{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  marginTop: '8px',
                  background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A65 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 16px rgba(255, 107, 74, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: isSubmitting ? 0.7 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                <Heart size={18} fill="#FFFFFF" />
                <span>{isSubmitting ? 'Publishing Review...' : 'Publish Guest Review'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
