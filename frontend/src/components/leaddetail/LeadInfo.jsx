import { useState } from 'react';
import API from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

/* ─── Google Fonts ─────────────────────────────────────────────────────────── */
const FONT_LINK = document.getElementById('crm-fonts');
if (!FONT_LINK) {
  const link = document.createElement('link');
  link.id   = 'crm-fonts';
  link.rel  = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700&family=Jost:wght@300;400;500&display=swap';
  document.head.appendChild(link);
}

/* ─── Token maps ────────────────────────────────────────────────────────────── */
const STATUS_STYLES = {
  'New':            { bg: '#E6F1FB', color: '#185FA5', border: '#B5D4F4' },
  'Contacted':      { bg: '#FAEEDA', color: '#854F0B', border: '#FAC775' },
  'Interested':     { bg: '#EAF3DE', color: '#3B6D11', border: '#C0DD97' },
  'Not Interested': { bg: '#FCEBEB', color: '#A32D2D', border: '#F7C1C1' },
  'Follow-Up':      { bg: '#EEEDFE', color: '#534AB7', border: '#AFA9EC' },
  'Converted':      { bg: '#E1F5EE', color: '#0F6E56', border: '#5DCAA5' },
  'Lost':           { bg: '#F1EFE8', color: '#5F5E5A', border: '#D3D1C7' },
};

const PRIORITY_STYLES = {
  'High':   { bg: '#FCEBEB', color: '#A32D2D' },
  'Medium': { bg: '#FAEEDA', color: '#854F0B' },
  'Low':    { bg: '#EAF3DE', color: '#3B6D11' },
};

/* ─── Tiny inline SVG icons ─────────────────────────────────────────────────── */
const PhoneIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.37 1.78.72 2.6a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.48-1.29a2 2 0 0 1 2.11-.45c.82.35 1.7.6 2.6.72A2 2 0 0 1 22 16.92z" />
  </svg>
);
const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <rect x="2" y="3" width="12" height="10" rx="1.5"/>
    <path d="M2 5l6 4 6-4"/>
  </svg>
);
const GlobeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <circle cx="8" cy="8" r="6"/>
    <path d="M8 2a9.5 9.5 0 0 1 0 12M8 2a9.5 9.5 0 0 0 0 12M2 8h12"/>
  </svg>
);
const AgentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <circle cx="8" cy="5.5" r="2.5"/>
    <path d="M3 14c0-2.761 2.239-5 5-5s5 2.239 5 5"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <rect x="2" y="2" width="12" height="12" rx="2"/>
    <path d="M5 1v2M11 1v2M2 6h12"/>
  </svg>
);

/* ─── Shared style helpers ───────────────────────────────────────────────────── */
const s = {
  card: {
    background: '#ffffff',
    border: '0.5px solid #ede8e8',
    borderRadius: '14px',
    padding: '20px',
    fontFamily: "'Jost', sans-serif",
  },
  titleFont: { fontFamily: "'Manrope', sans-serif" },
  badge: (bg, color, border) => ({
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '11px',
    fontWeight: 500,
    padding: '4px 10px',
    borderRadius: '20px',
    background: bg,
    color,
    border: `0.5px solid ${border || 'transparent'}`,
    fontFamily: "'Jost', sans-serif",
    letterSpacing: '0.2px',
  }),
  label: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#9e9a9a',
    marginBottom: '5px',
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontFamily: "'Manrope', sans-serif",
  },
  input: {
    width: '100%',
    border: '0.5px solid #e0dcdc',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '13px',
    fontFamily: "'Jost', sans-serif",
    color: '#2c2c2c',
    background: '#fefafa',
    outline: 'none',
    transition: 'border-color .15s',
  },
  saveBtn: {
    width: '100%',
    background: '#185FA5',
    color: '#fff',
    border: 'none',
    borderRadius: '9px',
    padding: '10px',
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: "'Manrope', sans-serif",
    cursor: 'pointer',
    transition: 'background .15s',
    letterSpacing: '0.3px',
  },
};

export default function LeadInfo({ lead, agents, onUpdate }) {
  const { addToast } = useToast();
  const { user }     = useAuth();

  const [editing, setEditing]   = useState(false);
  const [updating, setUpdating] = useState(false);
  const [form, setForm]         = useState({
    status:     lead.status,
    priority:   lead.priority,
    assignedTo: lead.assignedTo || '',
    notes:      lead.notes      || '',
  });

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      await API.put(`/leads/${lead.id}/status`, {
        status:   form.status,
        priority: form.priority,
        notes:    form.notes,
      });
      if (user.role === 'admin' && form.assignedTo !== lead.assignedTo) {
        await API.put(`/leads/${lead.id}/assign`, { agentId: form.assignedTo });
      }
      addToast({ message: 'Lead updated!', type: 'success' });
      setEditing(false);
      onUpdate();
    } catch {
      addToast({ message: 'Update failed!', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const initials = lead.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const st = STATUS_STYLES[lead.status]   || STATUS_STYLES['New'];
  const pt = PRIORITY_STYLES[lead.priority] || PRIORITY_STYLES['Medium'];
  const isOverdue = lead.followUpDate && new Date(lead.followUpDate) < new Date();

  return (
    <div style={s.card}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: '#E6F1FB', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 700, fontSize: 14,
            color: '#185FA5', fontFamily: "'Manrope', sans-serif", flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <h2 style={{ ...s.titleFont, fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: 0, lineHeight: 1.2 }}>
              {lead.name}
            </h2>
            <p style={{ fontSize: 12, color: '#9e9a9a', margin: '3px 0 0', fontFamily: "'Jost', sans-serif" }}>
              #{lead.id} &nbsp;·&nbsp; {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          style={{
            fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: "'Manrope', sans-serif",
            padding: '5px 12px', borderRadius: 7, border: '0.5px solid #e0dcdc',
            background: editing ? '#f5f0f0' : '#fefafa', color: editing ? '#5f5e5a' : '#185FA5',
            transition: 'all .15s',
          }}
        >
          {editing ? '✕ Cancel' : '✏ Edit'}
        </button>
      </div>

      {/* ── Contact info ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {[
          { icon: <PhoneIcon />, content: <a href={`tel:${lead.phone}`} style={{ color: '#185FA5', textDecoration: 'none', fontWeight: 500 }}>{lead.phone}</a> },
          lead.email && { icon: <MailIcon />, content: <a href={`mailto:${lead.email}`} style={{ color: '#185FA5', textDecoration: 'none' }}>{lead.email}</a> },
          { icon: <GlobeIcon />, content: <span style={{ color: '#6b6868' }}>{lead.source || 'Manual'}</span> },
          lead.assignedAgent && { icon: <AgentIcon />, content: <span style={{ color: '#6b6868' }}>{lead.assignedAgent.name}</span> },
        ].filter(Boolean).map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, fontFamily: "'Jost', sans-serif" }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7, background: '#f5f0f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#9e9a9a', flexShrink: 0,
            }}>
              {item.icon}
            </div>
            {item.content}
          </div>
        ))}
      </div>

      {/* ── Status + Priority badges ── */}
      {!editing && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <span style={s.badge(st.bg, st.color, st.border)}>{lead.status}</span>
          <span style={s.badge(pt.bg, pt.color)}>● {lead.priority} Priority</span>
        </div>
      )}

      {/* ── Follow-up ── */}
      {lead.followUpDate && !editing && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12, padding: '8px 12px', borderRadius: 9, marginBottom: 14,
          fontFamily: "'Jost', sans-serif",
          background: isOverdue ? '#FCEBEB' : '#EEEDFE',
          color:      isOverdue ? '#A32D2D' : '#534AB7',
        }}>
          <CalendarIcon />
          Follow-up: {new Date(lead.followUpDate).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
          {isOverdue && <span style={{ marginLeft: 4, fontWeight: 600 }}>· Overdue</span>}
        </div>
      )}

      {/* ── Notes preview ── */}
      {lead.notes && !editing && (
        <div style={{ background: '#f9f5f5', borderRadius: 9, padding: '10px 12px', marginBottom: 16 }}>
          <p style={s.label}>Notes</p>
          <p style={{ fontSize: 13, color: '#4a4747', lineHeight: 1.55, margin: 0, fontFamily: "'Jost', sans-serif" }}>
            {lead.notes}
          </p>
        </div>
      )}

      {/* ── Edit form ── */}
      {editing && (
        <div style={{ borderTop: '0.5px solid #ede8e8', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={s.label}>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={s.input}>
                {['New','Contacted','Interested','Not Interested','Follow-Up','Converted','Lost'].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={s.label}>Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={s.input}>
                {['Low','Medium','High'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          {user.role === 'admin' && (
            <div>
              <label style={s.label}>Assign Agent</label>
              <select value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} style={s.input}>
                <option value="">Unassigned</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label style={s.label}>Notes</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Add notes about this lead..."
              style={{ ...s.input, resize: 'none', lineHeight: 1.55 }}
            />
          </div>

          <button
            onClick={handleUpdate}
            disabled={updating}
            style={{ ...s.saveBtn, opacity: updating ? 0.6 : 1 }}
          >
            {updating ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}