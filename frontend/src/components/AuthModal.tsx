import React, { useState } from 'react';
import type { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState<string>('Aditya Sharma');
  const [email, setEmail] = useState<string>('aditya.sharma@example.com');
  const [password, setPassword] = useState<string>('••••••••');
  const [phone, setPhone] = useState<string>('+91 98765 43210');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user: User = {
      id: `user-${Date.now()}`,
      name: name.trim() || 'Aditya Sharma',
      email: email.trim() || 'aditya.sharma@example.com',
      phone: phone.trim()
    };
    onLogin(user);
    onClose();
  };

  const handleQuickDemo = () => {
    const demoUser: User = {
      id: 'demo-user-1',
      name: 'Aditya Sharma',
      email: 'aditya.sharma@example.com',
      phone: '+91 98765 43210'
    };
    onLogin(demoUser);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(11, 22, 38, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
      padding: '16px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '440px',
        padding: '32px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '1.4rem',
            color: '#94A3B8',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          ✕
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🌴</div>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'Playfair Display, serif', color: '#0B1626', margin: 0 }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#64748B', marginTop: '6px' }}>
            {mode === 'login' ? 'Access your booked Goa stays & AI concierge' : 'Start your AI-powered Goa journey'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: '#F1F5F9',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            onClick={() => setMode('login')}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              background: mode === 'login' ? '#FFFFFF' : 'transparent',
              color: mode === 'login' ? '#0B1626' : '#64748B',
              boxShadow: mode === 'login' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              background: mode === 'signup' ? '#FFFFFF' : 'transparent',
              color: mode === 'signup' ? '#0B1626' : '#64748B',
              boxShadow: mode === 'signup' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'signup' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Full Name
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
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. aditya.sharma@example.com"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: '8px',
              background: 'linear-gradient(135deg, #D05B3B 0%, #E28445 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(208, 91, 59, 0.3)'
            }}
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', position: 'relative' }}>
          <div style={{ borderTop: '1px solid #E2E8F0', margin: '14px 0' }} />
          <button
            type="button"
            onClick={handleQuickDemo}
            style={{
              width: '100%',
              background: '#F8FAFC',
              color: '#0B1626',
              border: '1px solid #CBD5E1',
              padding: '10px',
              borderRadius: '8px',
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>⚡</span>
            <span>Quick Demo Sign In (Aditya Sharma)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
