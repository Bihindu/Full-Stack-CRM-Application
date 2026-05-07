import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Zap } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>
            <Zap size={22} color="#4f8ef7" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={styles.logoText}>PipeLine<span style={{ color: 'var(--accent)' }}>CRM</span></h1>
            <p style={styles.logoSub}>Sales Intelligence Platform</p>
          </div>
        </div>

        <div style={styles.divider} />

        <h2 style={styles.heading}>Welcome back</h2>
        <p style={styles.sub}>Sign in to your account to continue</p>

        {error && (
          <div className="alert alert-error" style={{ marginTop: 16 }}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={styles.eyeBtn}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 4, padding: '11px 16px' }}
          >
            {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Sign in'}
          </button>
        </form>

        <div style={styles.hint}>
          <p>Test credentials: <strong>admin@example.com</strong> / <strong>password123</strong></p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundImage: 'radial-gradient(ellipse at 60% 20%, rgba(79,142,247,0.06) 0%, transparent 60%)',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    padding: '36px 36px 28px',
    boxShadow: 'var(--shadow-lg)',
    animation: 'slideUp 0.3s ease',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  logoIcon: {
    width: 44, height: 44,
    background: 'var(--accent-glow)',
    border: '1px solid rgba(79,142,247,0.3)',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.2rem',
    fontWeight: 800,
  },
  logoSub: {
    fontSize: '0.75rem',
    color: 'var(--text-3)',
    marginTop: 1,
  },
  divider: {
    height: 1,
    background: 'var(--border)',
    margin: '0 0 24px',
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.4rem',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    marginBottom: 4,
  },
  sub: {
    fontSize: '0.875rem',
    color: 'var(--text-3)',
    marginBottom: 20,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginTop: 16,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-3)',
    display: 'flex',
    padding: 4,
  },
  hint: {
    marginTop: 20,
    padding: '10px 14px',
    background: 'var(--bg-3)',
    borderRadius: 'var(--radius)',
    fontSize: '0.8rem',
    color: 'var(--text-3)',
    textAlign: 'center',
  },
};
