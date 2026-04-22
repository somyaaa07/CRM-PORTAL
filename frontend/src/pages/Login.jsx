import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

/* ─────────────────────────────────────────────────────────────────────────
   Paste this into your index.html <head>:
   <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
   ───────────────────────────────────────────────────────────────────────── */

export default function Login() {
  const { login }     = useAuth();
  const navigate      = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/login', form);
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === 'admin' ? '/admin/dashboard' : '/agent/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'Manrope', sans-serif;
          background: #0b0715;
        }

        /* ── Left panel ── */
        .login-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
          background: #0b0715;
          position: relative;
          overflow: hidden;
          opacity: ${mounted ? 1 : 0};
          transition: opacity 0.6s ease;
        }

        /* Decorative rings */
        .ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(139,107,255,0.15);
        }
        .ring-1 { width: 360px; height: 360px; top: -80px; right: -120px; }
        .ring-2 { width: 240px; height: 240px; top: -20px; right: -60px; border-color: rgba(139,107,255,0.22); }
        .ring-3 { width: 130px; height: 130px; top: 50px; right: -10px; border-color: rgba(139,107,255,0.3); background: rgba(124,77,255,0.06); }
        .ring-4 { width: 420px; height: 420px; bottom: -200px; left: -140px; border-color: rgba(139,107,255,0.07); }

        .dot {
          position: absolute;
          border-radius: 50%;
        }
        .dot-1 { width: 6px; height: 6px; background: #7c4dff; top: 100px; right: 32px; opacity: 0.9; }
        .dot-2 { width: 4px; height: 4px; background: #b39dff; top: 58px; right: 72px; opacity: 0.6; }
        .dot-3 { width: 5px; height: 5px; background: #5722cc; bottom: 160px; left: 32px; opacity: 0.7; }

        .panel-brand {
          position: relative; z-index: 1;
        }

        .brand-icon {
          width: 48px; height: 48px;
          background: linear-gradient(135deg, #7c4dff, #5722cc);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1rem;
          box-shadow: 0 8px 24px rgba(124,77,255,0.4);
        }

        .brand-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .panel-middle {
          position: relative; z-index: 1;
        }

        .panel-headline {
          font-size: clamp(1.6rem, 2.8vw, 2.4rem);
          font-weight: 800;
          line-height: 1.15;
          color: #fff;
          letter-spacing: -0.04em;
          margin-bottom: 1.25rem;
        }

        .panel-headline em {
          font-style: normal;
          color: #9d7dff;
        }

        .activity-label {
          font-size: 0.62rem;
          font-weight: 700;
          color: rgba(255,255,255,0.22);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-bottom: 0.6rem;
        }

        .activity-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 0.75rem 0.9rem;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0.45rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .activity-item:last-child { border-bottom: none; padding-bottom: 0; }
        .activity-item:first-child { padding-top: 0; }

        .avatar {
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.6rem; font-weight: 700; flex-shrink: 0;
        }
        .avatar.green { background: rgba(29,158,117,0.25); color: #5dcaa5; }
        .avatar.purple { background: rgba(124,77,255,0.25); color: #b39dff; }
        .avatar.amber { background: rgba(239,159,39,0.2); color: #f0b429; }

        .activity-info { flex: 1; }
        .activity-name { font-size: 0.72rem; font-weight: 600; color: rgba(255,255,255,0.85); line-height: 1.25; }
        .activity-time { font-size: 0.62rem; font-weight: 400; color: rgba(255,255,255,0.3); }

        .pill {
          font-size: 0.58rem; font-weight: 700;
          padding: 2px 8px; border-radius: 20px;
        }
        .pill.won { background: rgba(29,158,117,0.2); color: #5dcaa5; }
        .pill.new { background: rgba(124,77,255,0.2); color: #b39dff; }
        .pill.call { background: rgba(239,159,39,0.15); color: #f0b429; }

        .panel-stats {
          display: flex;
          gap: 2.5rem;
          position: relative; z-index: 1;
        }

        .stat-item { display: flex; flex-direction: column; gap: 3px; }

        .stat-num {
          font-size: 1.5rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.04em;
        }

        .stat-label {
          font-size: 0.72rem;
          font-weight: 500;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .stat-divider {
          width: 1px;
          background: rgba(255,255,255,0.08);
          align-self: stretch;
        }

        /* ── Right panel / form ── */
        .login-form-side {
          width: 480px;
          flex-shrink: 0;
          background: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 3.5rem 3rem;
          position: relative;
          opacity: ${mounted ? 1 : 0};
          transform: ${mounted ? 'translateX(0)' : 'translateX(32px)'};
          transition: opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s;
        }

        .form-header { margin-bottom: 2.5rem; }

        .form-eyebrow {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #7c4dff;
          margin-bottom: 0.75rem;
        }

        .form-title {
          font-size: 1.9rem;
          font-weight: 800;
          color: #0b0715;
          letter-spacing: -0.04em;
          line-height: 1.1;
          margin-bottom: 0.5rem;
        }

        .form-desc {
          font-size: 0.85rem;
          font-weight: 400;
          color: rgba(11,7,21,0.4);
          line-height: 1.6;
        }

        /* Error */
        .error-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff1f2;
          border: 1px solid rgba(225,29,72,0.2);
          border-left: 3px solid #e11d48;
          border-radius: 10px;
          padding: 0.8rem 1rem;
          margin-bottom: 1.5rem;
          font-size: 0.82rem;
          font-weight: 500;
          color: #be123c;
        }

        /* Field */
        .field { margin-bottom: 1.25rem; }

        .field-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .field-label {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(11,7,21,0.55);
        }

        .forgot-link {
          font-size: 0.75rem;
          font-weight: 500;
          color: #7c4dff;
          text-decoration: none;
          transition: opacity 0.15s;
        }

        .forgot-link:hover { opacity: 0.7; }

        .field-wrap { position: relative; }

        .field-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          display: flex;
          align-items: center;
          color: rgba(11,7,21,0.25);
          transition: color 0.2s;
        }

        .field-wrap.focused .field-icon { color: #7c4dff; }

        .field-input {
          width: 100%;
          padding: 0.8rem 1rem 0.8rem 2.6rem;
          border: 1.5px solid rgba(11,7,21,0.1);
          border-radius: 10px;
          font-family: 'Manrope', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          color: #0b0715;
          background: #fafafa;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }

        .field-input::placeholder { color: rgba(11,7,21,0.22); font-weight: 400; }

        .field-input:focus {
          border-color: #7c4dff;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(124,77,255,0.1);
        }

        .eye-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: rgba(11,7,21,0.3);
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }

        .eye-btn:hover { color: #7c4dff; }

        /* Remember */
        .remember-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 1.75rem;
        }

        .checkbox-btn {
          width: 18px; height: 18px;
          border-radius: 5px;
          border: 1.5px solid rgba(11,7,21,0.18);
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.15s;
          padding: 0;
        }

        .checkbox-btn.checked {
          background: #7c4dff;
          border-color: #7c4dff;
        }

        .remember-text {
          font-size: 0.82rem;
          font-weight: 500;
          color: rgba(11,7,21,0.45);
          cursor: pointer;
          user-select: none;
        }

        /* Submit */
        .submit-btn {
          width: 100%;
          padding: 0.9rem;
          background: linear-gradient(135deg, #7c4dff, #5722cc);
          color: #fff;
          border: none;
          border-radius: 11px;
          font-family: 'Manrope', sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(124,77,255,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(124,77,255,0.45);
        }

        .submit-btn:active:not(:disabled) { transform: translateY(0); }

        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 1.75rem 0;
        }

        .divider-line { flex: 1; height: 1px; background: rgba(11,7,21,0.07); }

        .divider-text {
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(11,7,21,0.25);
          white-space: nowrap;
        }

        /* Social */
        .social-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        .social-btn {
          padding: 0.7rem;
          background: #fff;
          border: 1.5px solid rgba(11,7,21,0.1);
          border-radius: 10px;
          font-family: 'Manrope', sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          color: #0b0715;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: border-color 0.2s, transform 0.15s, box-shadow 0.2s;
        }

        .social-btn:hover {
          border-color: rgba(11,7,21,0.25);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(11,7,21,0.06);
        }

        /* Footer */
        .form-footer {
          margin-top: 2rem;
          text-align: center;
          font-size: 0.72rem;
          font-weight: 500;
          color: rgba(11,7,21,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .login-panel { display: none; }
          .login-form-side { width: 100%; padding: 2.5rem 1.75rem; }
        }
      `}</style>

      <div className="login-root">
        {/* ── Left decorative panel ── */}
        <div className="login-panel">
        
         
    

          <div className="panel-brand">
            <div className="brand-icon">
              <PhoneIcon />
            </div>
            <div className="brand-name">CRM Portal</div>
          </div>

          <div className="panel-middle">
            <h2 className="panel-headline">
              Close more.<br />
              Track everything.<br />
              <em>Move faster.</em>
            </h2>
            <p className="activity-label">Live activity</p>
            <div className="activity-card">
              <div className="activity-item">
                <div className="avatar green">SR</div>
                <div className="activity-info">
                  <div className="activity-name">Sarah closed Acme deal</div>
                  <div className="activity-time">2 min ago</div>
                </div>
                <span className="pill won">Won</span>
              </div>
              <div className="activity-item">
                <div className="avatar purple">JK</div>
                <div className="activity-info">
                  <div className="activity-name">Jake added 3 new leads</div>
                  <div className="activity-time">11 min ago</div>
                </div>
                <span className="pill new">+3</span>
              </div>
              <div className="activity-item">
                <div className="avatar amber">MP</div>
                <div className="activity-info">
                  <div className="activity-name">Maya scheduled follow-up</div>
                  <div className="activity-time">24 min ago</div>
                </div>
                <span className="pill call">Call</span>
              </div>
            </div>
          </div>

          <div className="panel-stats">
            <div className="stat-item">
              <span className="stat-num">12k+</span>
              <span className="stat-label">Active agents</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">98%</span>
              <span className="stat-label">Uptime SLA</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">4.9★</span>
              <span className="stat-label">User rating</span>
            </div>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="login-form-side">
          <div className="form-header">
            <p className="form-eyebrow">Secure Portal</p>
            <h1 className="form-title">Welcome back</h1>
            <p className="form-desc">Sign in to your workspace to continue</p>
          </div>

          {error && (
            <div className="error-banner">
              <ErrorIcon />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="field">
              <div className="field-label-row">
                <label className="field-label">Email address</label>
              </div>
              <div className={`field-wrap ${focusedField === 'email' ? 'focused' : ''}`}>
                <span className="field-icon"><MailIcon /></span>
                <input
                  className="field-input"
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="field">
              <div className="field-label-row">
                <label className="field-label">Password</label>
                <a href="/forgot-password" className="forgot-link">Forgot?</a>
              </div>
              <div className={`field-wrap ${focusedField === 'password' ? 'focused' : ''}`}>
                <span className="field-icon"><LockIcon /></span>
                <input
                  className="field-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  style={{ paddingRight: '2.8rem' }}
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="remember-row">
              <button
                type="button"
                className={`checkbox-btn ${remember ? 'checked' : ''}`}
                onClick={() => setRemember(!remember)}
                role="checkbox"
                aria-checked={remember}
              >
                {remember && <TickIcon />}
              </button>
              <span className="remember-text" onClick={() => setRemember(!remember)}>
                Keep me signed in for 30 days
              </span>
            </div>

            {/* Submit */}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowIcon />
                </>
              )}
            </button>
          </form>

     
          {/* Footer */}
          <div className="form-footer">
            <ShieldIcon />
            <span>Protected by enterprise-grade encryption</span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Icons ───────────────────────────────────────────────────────────── */

const PhoneIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.09 12
             19.79 19.79 0 01.07 3.37a2 2 0 012-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7
             2.81a2 2 0 01-.45 2.11L6.91 8.63a16 16 0 006.06 6.06l1.27-1.27a2 2 0 012.11-.45
             c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94
             M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19
             m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const TickIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 8" fill="none">
    <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ErrorIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const ArrowIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);
const MicrosoftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 21 21">
    <rect x="1"  y="1"  width="9" height="9" fill="#F25022"/>
    <rect x="11" y="1"  width="9" height="9" fill="#7FBA00"/>
    <rect x="1"  y="11" width="9" height="9" fill="#00A4EF"/>
    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
  </svg>
);