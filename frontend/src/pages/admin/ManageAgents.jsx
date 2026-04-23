import { useState, useEffect } from 'react';
import {
  Users, UserPlus, Key, Ban, CheckCircle2, Phone,
  TrendingUp, Target, X, Eye, EyeOff,
  Shield, AlertCircle, Loader2, UserCheck, UserX, Sparkles
} from 'lucide-react';
import API from '../../api/axios';
import { useToast } from '../../context/ToastContext';

/* ── Google Fonts ── */
const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Jost:wght@300;400;500;600&display=swap');
`;

/* ── Avatar gradient pool ── */
const GRADIENTS = [
  ['#7c3aed', '#a855f7'],
  ['#2563eb', '#7c3aed'],
  ['#059669', '#10b981'],
  ['#dc2626', '#f97316'],
  ['#0891b2', '#6366f1'],
];
const avatarGrad = (name) => GRADIENTS[name.charCodeAt(0) % GRADIENTS.length];

/* ── Stat box ── */
function StatBox({ icon: Icon, value, label, color }) {
  return (
    <div className="stat-box">
      <span className="stat-value" style={{ color }}>
        <Icon size={10} strokeWidth={2.5} />
        {value ?? '—'}
      </span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

/* ── Field label ── */
function Label({ children }) {
  return (
    <label className="field-label">{children}</label>
  );
}

/* ── Input ── */
function StyledInput({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`styled-input ${className}`}
    />
  );
}

/* ── Password input ── */
function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw-wrap">
      <StyledInput
        type={show ? 'text' : 'password'}
        value={value} onChange={onChange} placeholder={placeholder}
        className="pr-10"
      />
      <button type="button" onClick={() => setShow(!show)} className="pw-toggle">
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

/* ── Summary card ── */
function SummaryCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="summary-card">
      <div className="summary-icon" style={{ background: `${accent}18` }}>
        <Icon size={16} style={{ color: accent }} strokeWidth={2} />
      </div>
      <div className="summary-text">
        <p className="summary-label">{label}</p>
        <p className="summary-value">{value}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
export default function ManageAgents() {
  const { addToast } = useToast();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [resetModal, setResetModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/agents');
      setAgents(res.data.agents);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAgents(); }, []);

  const handleAddAgent = async () => {
    if (!form.name || !form.email || !form.password) {
      addToast({ message: 'All fields are required.', type: 'error' }); return;
    }
    try {
      setFormLoading(true);
      await API.post('/admin/agents', form);
      addToast({ message: 'Agent created successfully!', type: 'success' });
      setForm({ name: '', email: '', password: '' });
      setShowForm(false);
      fetchAgents();
    } catch (err) {
      addToast({ message: err.response?.data?.message || 'Something went wrong.', type: 'error' });
    } finally { setFormLoading(false); }
  };

  const handleToggle = async (agentId, currentStatus) => {
    setTogglingId(agentId);
    try {
      await API.put(`/admin/agents/${agentId}/toggle`);
      addToast({ message: `Agent ${currentStatus ? 'deactivated' : 'activated'}.`, type: 'success' });
      fetchAgents();
    } catch { addToast({ message: 'Failed to update status.', type: 'error' }); }
    finally { setTogglingId(null); }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      addToast({ message: 'Password must be at least 6 characters.', type: 'error' }); return;
    }
    try {
      await API.put(`/admin/agents/${resetModal.agentId}/password`, { newPassword });
      addToast({ message: 'Password reset successfully.', type: 'success' });
      setResetModal(null); setNewPassword('');
    } catch { addToast({ message: 'Failed to reset password.', type: 'error' }); }
  };

  const activeCount   = agents.filter(a => a.isActive).length;
  const inactiveCount = agents.length - activeCount;

  return (
    <>
      <style>{`
        ${FONTS}

        /* ── Reset & base ── */
        *, *::before, *::after { box-sizing: border-box; }

        .page-bg {
          background-color: #f5f3ff;
          min-height: 100dvh;
          padding: clamp(12px, 3vw, 40px);
          font-family: 'Jost', sans-serif;
        }

        .page-inner {
          margin: 0 auto;
          width: 100%;
          max-width: 1100px;
        }

        /* ── Animations ── */
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(.93); }
          to   { opacity: 1; transform: scale(1); }
        }
        .anim-slide { animation: slideDown .28s cubic-bezier(.16,1,.3,1) both; }
        .anim-fade  { animation: fadeUp   .32s cubic-bezier(.16,1,.3,1) both; }
        .anim-scale { animation: scaleIn  .22s cubic-bezier(.16,1,.3,1) both; }

        /* ── Page header ── */
        .page-header { margin-bottom: clamp(20px, 4vw, 36px); }
        .page-eyebrow {
          display: flex; align-items: center; gap: 6px;
          margin-bottom: 6px;
        }
        .page-eyebrow span {
          font-size: clamp(9px, 1.5vw, 11px);
          font-weight: 600;
          color: #7c3aed;
          text-transform: uppercase;
          letter-spacing: .12em;
        }
        .page-title {
          font-family: 'Manrope', sans-serif;
          font-size: clamp(1.4rem, 4vw, 2.1rem);
          font-weight: 800;
          color: #111827;
          line-height: 1.2;
          margin: 0 0 4px;
        }
        .page-sub {
          font-size: clamp(11px, 1.8vw, 14px);
          color: #9ca3af;
          margin: 0;
        }

        /* ── Summary strip ── */
        .summary-strip {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(8px, 2vw, 16px);
          margin-bottom: clamp(16px, 3vw, 28px);
        }
        .summary-card {
          background: rgba(255,255,255,.75);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,.9);
          border-radius: clamp(12px, 2vw, 18px);
          padding: clamp(10px, 2vw, 18px);
          display: flex;
          align-items: center;
          gap: clamp(8px, 1.5vw, 14px);
          box-shadow: 0 2px 12px rgba(124,58,237,.07);
          min-width: 0;
        }
        .summary-icon {
          width: clamp(32px, 5vw, 44px);
          height: clamp(32px, 5vw, 44px);
          border-radius: clamp(8px, 1.5vw, 12px);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .summary-icon svg { width: clamp(13px, 2vw, 18px); height: auto; }
        .summary-text { min-width: 0; }
        .summary-label {
          font-size: clamp(9px, 1.4vw, 12px);
          color: #9ca3af;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .summary-value {
          font-family: 'Manrope', sans-serif;
          font-size: clamp(1.1rem, 3vw, 1.6rem);
          font-weight: 800;
          color: #1f2937;
          line-height: 1.1;
        }

        /* ── Toolbar ── */
        .toolbar {
          display: flex;
          justify-content: flex-end;
          margin-bottom: clamp(10px, 2vw, 18px);
        }
        .btn-violet {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          box-shadow: 0 4px 14px rgba(124,58,237,.30);
          color: #fff;
          border: none;
          border-radius: clamp(10px, 1.5vw, 14px);
          font-family: 'Jost', sans-serif;
          font-size: clamp(12px, 1.8vw, 14px);
          font-weight: 600;
          padding: clamp(9px, 1.5vw, 11px) clamp(14px, 2.5vw, 22px);
          cursor: pointer;
          transition: box-shadow .2s, filter .2s;
          white-space: nowrap;
        }
        .btn-violet:hover {
          box-shadow: 0 6px 22px rgba(124,58,237,.42);
          filter: brightness(1.06);
        }
        .btn-violet:disabled { opacity: .5; cursor: not-allowed; }

        /* ── Add agent form ── */
        .add-form {
          background: rgba(255,255,255,.85);
          backdrop-filter: blur(10px);
          border: 1px solid #ede9fe;
          border-radius: clamp(14px, 2vw, 20px);
          box-shadow: 0 6px 28px rgba(124,58,237,.09);
          padding: clamp(16px, 3vw, 28px);
          margin-bottom: clamp(14px, 2vw, 20px);
        }
        .form-header {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: clamp(14px, 2vw, 22px);
        }
        .form-icon {
          width: clamp(28px, 4vw, 36px);
          height: clamp(28px, 4vw, 36px);
          border-radius: clamp(8px, 1.2vw, 11px);
          background: #7c3aed;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(124,58,237,.3);
        }
        .form-title {
          font-family: 'Manrope', sans-serif;
          font-size: clamp(13px, 2vw, 16px);
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        /* Fields grid: 1 col → 2 col → 3 col */
        .form-fields {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(10px, 2vw, 16px);
          margin-bottom: clamp(14px, 2vw, 20px);
        }
        @media (min-width: 480px) {
          .form-fields { grid-template-columns: 1fr 1fr; }
        }
        @media (min-width: 720px) {
          .form-fields { grid-template-columns: 1fr 1fr 1fr; }
        }

        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-label {
          font-size: clamp(9px, 1.4vw, 11px);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: .1em;
          color: #7c3aed;
        }

        .styled-input {
          width: 100%;
          background: rgba(255,255,255,.85);
          border: 1px solid #ede9fe;
          border-radius: clamp(8px, 1.2vw, 12px);
          padding: clamp(8px, 1.5vw, 11px) clamp(12px, 2vw, 16px);
          font-family: 'Jost', sans-serif;
          font-size: clamp(12px, 1.6vw, 14px);
          color: #374151;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .styled-input::placeholder { color: #d1d5db; }
        .styled-input:focus {
          border-color: #a78bfa;
          box-shadow: 0 0 0 3px rgba(124,58,237,.12);
        }

        .pw-wrap { position: relative; }
        .pw-toggle {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #c4b5fd; padding: 0; display: flex; align-items: center;
          transition: color .15s;
        }
        .pw-toggle:hover { color: #7c3aed; }

        .form-footer {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          padding-top: clamp(12px, 2vw, 18px);
          border-top: 1px solid #f5f3ff;
        }
        .form-hint {
          font-size: clamp(10px, 1.4vw, 12px);
          color: #9ca3af;
        }

        /* ── Agents list ── */
        .agents-list { display: flex; flex-direction: column; gap: clamp(8px, 1.5vw, 14px); }

        .agent-card {
          background: rgba(255,255,255,.78);
          backdrop-filter: blur(8px);
          border-radius: clamp(14px, 2vw, 20px);
          border: 1px solid rgba(255,255,255,.95);
          transition: box-shadow .2s, transform .18s;
          overflow: hidden;
        }
        .agent-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(124,58,237,.10);
        }
        .agent-card.inactive { border-color: #fee2e2; background: rgba(254,242,242,.3); }

        /* Main row inside card */
        .agent-row {
          display: flex;
          align-items: center;
          gap: clamp(10px, 2vw, 18px);
          padding: clamp(12px, 2vw, 18px);
          flex-wrap: nowrap;
        }

        /* Avatar */
        .avatar-wrap { position: relative; flex-shrink: 0; }
        .avatar {
          width: clamp(36px, 6vw, 48px);
          height: clamp(36px, 6vw, 48px);
          border-radius: clamp(9px, 1.5vw, 13px);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Manrope', sans-serif;
          font-size: clamp(13px, 2.2vw, 18px);
          font-weight: 800;
          color: #fff;
        }
        .avatar-dot {
          position: absolute; bottom: -3px; right: -3px;
          width: clamp(9px, 1.5vw, 13px);
          height: clamp(9px, 1.5vw, 13px);
          border-radius: 50%;
          border: 2px solid #fff;
        }
        .avatar-dot.active { background: #34d399; }
        .avatar-dot.inactive { background: #d1d5db; }

        /* Info block */
        .agent-info { flex: 1; min-width: 0; }
        .agent-name-row {
          display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
        }
        .agent-name {
          font-family: 'Manrope', sans-serif;
          font-size: clamp(12px, 2vw, 15px);
          font-weight: 700;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        .status-badge {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: clamp(9px, 1.2vw, 11px);
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 999px;
          border: 1px solid;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .status-badge.active  { background: #ecfdf5; color: #065f46; border-color: #a7f3d0; }
        .status-badge.inactive { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
        .agent-email {
          font-size: clamp(10px, 1.5vw, 12px);
          color: #9ca3af;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 2px;
        }

        /* Stats — desktop inline (shown when card is wide enough) */
        .stats-desktop {
          display: none;
          align-items: center;
          flex-shrink: 0;
        }
        @media (min-width: 680px) {
          .stats-desktop { display: flex; }
        }

        .divider-v {
          width: 1px;
          align-self: stretch;
          background: linear-gradient(to bottom, transparent, #ddd6fe, transparent);
          margin: 0 clamp(6px, 1.2vw, 14px);
          flex-shrink: 0;
        }

        .stat-box {
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          padding: 0 clamp(6px, 1.2vw, 14px);
        }
        .stat-value {
          font-family: 'Manrope', sans-serif;
          font-size: clamp(10px, 1.6vw, 13px);
          font-weight: 700;
          display: flex; align-items: center; gap: 3px;
        }
        .stat-label {
          font-size: clamp(8px, 1.1vw, 10px);
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: .08em;
          font-weight: 500;
        }

        /* Stats — mobile strip (shown below card row) */
        .stats-mobile {
          display: flex;
          align-items: center;
          justify-content: space-around;
          border-top: 1px solid rgba(237,233,254,.6);
          padding: clamp(8px, 1.5vw, 12px) clamp(10px, 2vw, 18px);
        }
        @media (min-width: 680px) {
          .stats-mobile { display: none; }
        }

        /* Actions */
        .agent-actions {
          display: flex;
          align-items: center;
          gap: clamp(6px, 1vw, 10px);
          flex-shrink: 0;
        }

        .btn-action {
          display: inline-flex;
          align-items: center;
          gap: clamp(4px, .8vw, 7px);
          font-family: 'Jost', sans-serif;
          font-size: clamp(10px, 1.5vw, 13px);
          font-weight: 600;
          padding: clamp(7px, 1.2vw, 9px) clamp(9px, 1.5vw, 14px);
          border-radius: clamp(8px, 1.2vw, 12px);
          border: 1px solid;
          cursor: pointer;
          transition: background .15s, border-color .15s;
          white-space: nowrap;
        }
        .btn-action:disabled { opacity: .5; cursor: not-allowed; }
        .btn-action svg { flex-shrink: 0; }

        .btn-reset {
          background: #f5f3ff;
          color: #6d28d9;
          border-color: #ede9fe;
        }
        .btn-reset:hover { background: #ede9fe; border-color: #c4b5fd; }

        .btn-deactivate {
          background: #fef2f2;
          color: #dc2626;
          border-color: #fecaca;
        }
        .btn-deactivate:hover { background: #fee2e2; border-color: #fca5a5; }

        .btn-activate {
          background: #ecfdf5;
          color: #065f46;
          border-color: #a7f3d0;
        }
        .btn-activate:hover { background: #d1fae5; border-color: #6ee7b7; }

        /* Hide action text labels on very small screens */
        .action-text { display: none; }
        @media (min-width: 400px) { .action-text { display: inline; } }

        /* ── Empty / loading states ── */
        .state-center {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center;
          padding: clamp(48px, 10vw, 100px) 16px;
          gap: 12px; text-align: center;
        }
        .empty-icon-wrap {
          width: clamp(48px, 8vw, 64px);
          height: clamp(48px, 8vw, 64px);
          background: #fff;
          border-radius: clamp(12px, 2vw, 18px);
          box-shadow: 0 2px 10px rgba(124,58,237,.08);
          display: flex; align-items: center; justify-content: center;
        }
        .state-title {
          font-family: 'Manrope', sans-serif;
          font-size: clamp(13px, 2vw, 16px);
          font-weight: 700; color: #374151; margin: 0;
        }
        .state-sub {
          font-size: clamp(11px, 1.6vw, 14px);
          color: #9ca3af; margin: 0;
        }

        /* ── Modal overlay ── */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,.42);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: flex-end;  /* bottom-sheet on mobile */
          justify-content: center;
          z-index: 50;
          padding: 0;
        }
        @media (min-width: 480px) {
          .modal-overlay {
            align-items: center;
            padding: 20px;
          }
        }

        .modal-inner {
          background: #fff;
          width: 100%;
          max-width: 420px;
          border-radius: 24px 24px 0 0;
          box-shadow: 0 -4px 40px rgba(0,0,0,.14);
          overflow-y: auto;
          max-height: 92dvh;
          font-family: 'Jost', sans-serif;
        }
        @media (min-width: 480px) {
          .modal-inner {
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,.18);
            max-height: 90dvh;
          }
        }

        .drag-handle {
          display: flex; justify-content: center;
          padding: 12px 0 4px;
        }
        .drag-handle div {
          width: 36px; height: 4px;
          background: #e5e7eb; border-radius: 999px;
        }
        @media (min-width: 480px) { .drag-handle { display: none; } }

        .modal-header {
          position: relative;
          padding: clamp(14px, 2.5vw, 22px) clamp(18px, 3vw, 26px);
          padding-bottom: 14px;
        }
        .modal-header-inner { display: flex; align-items: center; gap: 12px; }
        .modal-icon {
          width: clamp(34px, 5vw, 42px);
          height: clamp(34px, 5vw, 42px);
          border-radius: 12px;
          background: #fffbeb;
          border: 1px solid #fef3c7;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .modal-title {
          font-family: 'Manrope', sans-serif;
          font-size: clamp(13px, 2vw, 15px);
          font-weight: 700; color: #111827; margin: 0;
        }
        .modal-sub {
          font-size: clamp(10px, 1.4vw, 12px);
          color: #9ca3af; margin-top: 2px;
        }
        .modal-close {
          position: absolute;
          top: clamp(12px, 2vw, 18px);
          right: clamp(12px, 2vw, 18px);
          width: 28px; height: 28px;
          border-radius: 8px; border: none; background: none;
          display: flex; align-items: center; justify-content: center;
          color: #9ca3af; cursor: pointer;
          transition: background .15s, color .15s;
        }
        .modal-close:hover { background: #f3f4f6; color: #374151; }

        .modal-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #fde68a, transparent);
          margin: 0 clamp(18px, 3vw, 26px);
        }

        .modal-body {
          padding: clamp(14px, 2.5vw, 22px) clamp(18px, 3vw, 26px);
          display: flex; flex-direction: column; gap: 14px;
        }

        .modal-warn {
          display: flex; align-items: flex-start; gap: 10px;
          background: #fffbeb; border: 1px solid #fde68a;
          border-radius: 12px;
          padding: clamp(10px, 1.8vw, 14px);
        }
        .modal-warn p {
          font-size: clamp(10px, 1.5vw, 12px);
          color: #92400e; line-height: 1.55; margin: 0;
        }

        .modal-err {
          display: flex; align-items: center; gap: 5px;
          font-size: clamp(10px, 1.4vw, 12px);
          color: #ef4444; margin-top: 4px;
        }

        .modal-footer {
          display: flex; gap: 10px;
          padding: clamp(12px, 2vw, 18px) clamp(18px, 3vw, 26px);
          /* safe area for iPhone home bar */
          padding-bottom: max(clamp(16px, 3vw, 22px), env(safe-area-inset-bottom, 16px));
        }
        .btn-secondary {
          flex: 1; border: 1px solid #e5e7eb; background: #fff;
          color: #374151; font-family: 'Jost', sans-serif;
          font-size: clamp(12px, 1.6vw, 14px); font-weight: 500;
          padding: clamp(9px, 1.5vw, 12px); border-radius: clamp(10px, 1.5vw, 13px);
          cursor: pointer; transition: background .15s;
        }
        .btn-secondary:hover { background: #f9fafb; }
      `}</style>

      <div className="page-bg">
        <div className="page-inner">

          {/* ── Page Header ── */}
          <div className="page-header anim-fade">
            <div className="page-eyebrow">
              <Sparkles size={11} color="#7c3aed" />
              <span>Admin Panel</span>
            </div>
            <h1 className="page-title">Agent Management</h1>
            <p className="page-sub">Create, manage and monitor your sales team.</p>
          </div>

          {/* ── Summary Strip ── */}
          <div className="summary-strip anim-fade" style={{ animationDelay: '60ms' }}>
            <SummaryCard icon={Users}     label="Total"    value={agents.length} accent="#7c3aed" />
            <SummaryCard icon={UserCheck} label="Active"   value={activeCount}   accent="#059669" />
            <SummaryCard icon={UserX}     label="Inactive" value={inactiveCount} accent="#dc2626" />
          </div>

          {/* ── Toolbar ── */}
          <div className="toolbar anim-fade" style={{ animationDelay: '100ms' }}>
            <button className="btn-violet" onClick={() => setShowForm(!showForm)}>
              {showForm ? <><X size={14} /> Cancel</> : <><UserPlus size={14} /> Add Agent</>}
            </button>
          </div>

          {/* ── Add Agent Form ── */}
          {showForm && (
            <div className="add-form anim-slide">
              <div className="form-header">
                <div className="form-icon">
                  <UserPlus size={14} color="#fff" />
                </div>
                <h3 className="form-title">New Agent</h3>
              </div>

              <div className="form-fields">
                <div className="field-group">
                  <Label>Full Name</Label>
                  <StyledInput
                    placeholder="e.g. Sarah Johnson"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="field-group">
                  <Label>Email Address</Label>
                  <StyledInput
                    type="email" placeholder="agent@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="field-group">
                  <Label>Password</Label>
                  <PasswordInput
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 6 characters"
                  />
                </div>
              </div>

              <div className="form-footer">
                <button
                  className="btn-violet"
                  onClick={handleAddAgent}
                  disabled={formLoading}
                >
                  {formLoading
                    ? <><Loader2 size={13} className="animate-spin" /> Creating…</>
                    : <><CheckCircle2 size={13} /> Create Agent</>}
                </button>
                <p className="form-hint">All fields are required.</p>
              </div>
            </div>
          )}

          {/* ── Agents List ── */}
          {loading ? (
            <div className="state-center">
              <Loader2 size={30} color="#a78bfa" className="animate-spin" />
              <p className="state-sub">Loading agents…</p>
            </div>
          ) : agents.length === 0 ? (
            <div className="state-center">
              <div className="empty-icon-wrap">
                <Users size={24} color="#c4b5fd" />
              </div>
              <p className="state-title">No agents yet</p>
              <p className="state-sub">Add your first agent to get started.</p>
            </div>
          ) : (
            <div className="agents-list">
              {agents.map((agent, i) => {
                const [g1, g2] = avatarGrad(agent.name);
                return (
                  <div
                    key={agent.id}
                    className={`agent-card anim-fade ${!agent.isActive ? 'inactive' : ''}`}
                    style={{ animationDelay: `${i * 45}ms` }}
                  >
                    {/* Main row */}
                    <div className="agent-row">

                      {/* Avatar */}
                      <div className="avatar-wrap">
                        <div className="avatar"
                          style={{
                            background: `linear-gradient(135deg, ${g1}, ${g2})`,
                            boxShadow: `0 4px 14px ${g1}50`
                          }}>
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <span className={`avatar-dot ${agent.isActive ? 'active' : 'inactive'}`} />
                      </div>

                      {/* Info */}
                      <div className="agent-info">
                        <div className="agent-name-row">
                          <span className="agent-name">{agent.name}</span>
                          <span className={`status-badge ${agent.isActive ? 'active' : 'inactive'}`}>
                            {agent.isActive
                              ? <><UserCheck size={9} /> Active</>
                              : <><UserX size={9} /> Inactive</>}
                          </span>
                        </div>
                        <p className="agent-email">{agent.email}</p>
                      </div>

                      {/* Stats — desktop */}
                      <div className="stats-desktop">
                        <div className="divider-v" />
                        <StatBox icon={Target}     value={agent.totalLeads}     label="Leads"     color="#6d28d9" />
                        <div className="divider-v" />
                        <StatBox icon={TrendingUp} value={agent.convertedLeads} label="Converted" color="#059669" />
                        <div className="divider-v" />
                        <StatBox icon={Phone}      value={agent.totalCalls}     label="Calls"     color="#2563eb" />
                        <div className="divider-v" />
                      </div>

                      {/* Actions */}
                      <div className="agent-actions">
                        <button
                          className="btn-action btn-reset"
                          onClick={() => setResetModal({ agentId: agent.id, name: agent.name })}
                          title="Reset password"
                        >
                          <Key size={12} />
                          <span className="action-text">Reset</span>
                        </button>

                        <button
                          className={`btn-action ${agent.isActive ? 'btn-deactivate' : 'btn-activate'}`}
                          onClick={() => handleToggle(agent.id, agent.isActive)}
                          disabled={togglingId === agent.id}
                        >
                          {togglingId === agent.id
                            ? <Loader2 size={12} className="animate-spin" />
                            : agent.isActive
                              ? <><Ban size={12} /><span className="action-text">Deactivate</span></>
                              : <><CheckCircle2 size={12} /><span className="action-text">Activate</span></>}
                        </button>
                      </div>
                    </div>

                    {/* Stats — mobile strip */}
                    <div className="stats-mobile">
                      <StatBox icon={Target}     value={agent.totalLeads}     label="Leads"     color="#6d28d9" />
                      <div className="divider-v" />
                      <StatBox icon={TrendingUp} value={agent.convertedLeads} label="Converted" color="#059669" />
                      <div className="divider-v" />
                      <StatBox icon={Phone}      value={agent.totalCalls}     label="Calls"     color="#2563eb" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ══ Reset Password Modal ══ */}
      {resetModal && (
        <div className="modal-overlay">
          <div className="modal-inner anim-scale">

            {/* Drag handle (mobile) */}
            <div className="drag-handle"><div /></div>

            {/* Header */}
            <div className="modal-header">
              <div className="modal-header-inner">
                <div className="modal-icon">
                  <Key size={16} color="#f59e0b" />
                </div>
                <div>
                  <p className="modal-title">Reset Password</p>
                  <p className="modal-sub">{resetModal.name}</p>
                </div>
              </div>
              <button
                className="modal-close"
                onClick={() => { setResetModal(null); setNewPassword(''); }}
              >
                <X size={14} />
              </button>
            </div>

            <div className="modal-divider" />

            {/* Body */}
            <div className="modal-body">
              <div className="modal-warn">
                <AlertCircle size={14} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
                <p>The agent will need to use this new password on their next login session.</p>
              </div>
              <div className="field-group">
                <Label>New Password</Label>
                <PasswordInput
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                />
                {newPassword.length > 0 && newPassword.length < 6 && (
                  <p className="modal-err">
                    <AlertCircle size={11} /> At least 6 characters required
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => { setResetModal(null); setNewPassword(''); }}
              >
                Cancel
              </button>
              <button
                className="btn-violet"
                style={{ flex: 1 }}
                onClick={handleResetPassword}
              >
                <Shield size={14} />
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}