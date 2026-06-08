import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useToast } from '../../context/ToastContext';

export default function AddLead() {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'Manual',
    priority: 'Medium',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.phone) {
      addToast({ message: '❌ Phone and Name is required', type: 'error' });
      return;
    }
    try {
      setLoading(true);
      await API.post('/leads/add-lead', {
        ...form,
        assignedTo: null,
      });
      addToast({ message: '✅ Lead add !', type: 'success' });
      navigate('/agent/my-leads');
    } catch (err) {
      addToast({ message: err.response?.data?.message || '❌ Error aaya!', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    border: '1.5px solid #E8E6DF',
    borderRadius: 10,
    padding: '11px 14px',
    fontSize: 14,
    color: '#2C2C2A',
    outline: 'none',
    fontFamily: "'Inter', sans-serif",
    boxSizing: 'border-box',
    background: '#FAFAF8',
    transition: 'border-color 0.15s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#888780',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const priorityColors = {
    Low:    { active: { bg: '#E1F5EE', border: '#1D9E75', color: '#085041' }, dot: '#1D9E75' },
    Medium: { active: { bg: '#FAEEDA', border: '#BA7517', color: '#633806' }, dot: '#EF9F27' },
    High:   { active: { bg: '#FCEBEB', border: '#E24B4A', color: '#501313' }, dot: '#E24B4A' },
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F6F2',
      padding: '32px 20px',
      fontFamily: "'Inter', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        input:focus, select:focus, textarea:focus {
          border-color: #1D9E75 !important;
          background: #fff !important;
        }
      `}</style>

      {/* Header */}
      <div style={{ maxWidth:1140, margin: '0 auto 24px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            padding: '4px 0',
            fontSize: 13,
            color: '#888780',
            cursor: 'pointer',
            marginBottom: 16,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          ← Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42, height: 42,
            background: '#1D9E75',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
            flexShrink: 0,
            color:"#fff"
          }}>
            +
          </div>
          <div>
            <h1 style={{
              margin: 0, fontSize: 20, fontWeight: 700, color: '#2C2C2A',
              letterSpacing: '-0.3px',
            }}>
              Add New Lead
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#888780', marginTop: 2 }}>
              Manually add a lead to your pipeline
            </p>
          </div>
        </div>
      </div>

      {/* Card */}
      <div style={{
        background: '#fff',
        borderRadius: 18,
        border: '1.5px solid #E8E6DF',
        padding: '28px 28px',
        maxWidth: 1140,
        margin: '0 auto',
      }}>

        {/* Row: Name + Phone */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
          <div>
            <label style={labelStyle}>Full Name <span style={{ color: '#E24B4A' }}>*</span></label>
            <input
              type="text"
              placeholder="Customer name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Phone <span style={{ color: '#E24B4A' }}>*</span></label>
            <input
              type="tel"
              placeholder="9876543210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Email */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            placeholder="customer@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={inputStyle}
          />
        </div>

        {/* Row: Source + Priority */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
          <div>
            <label style={labelStyle}>Source</label>
            <select
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="Manual">Manual</option>
              <option value="Referral">Referral</option>
              <option value="Website">Website</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Phone Call">Phone Call</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Priority</label>
            <div style={{ display: 'flex', gap: 6, height: 42, alignItems: 'center' }}>
              {['Low', 'Medium', 'High'].map((p) => {
                const isActive = form.priority === p;
                const c = priorityColors[p];
                return (
                  <button
                    key={p}
                    onClick={() => setForm({ ...form, priority: p })}
                    style={{
                      flex: 1, height: '100%',
                      borderRadius: 8,
                      fontSize: 12.5, fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontFamily: "'Inter', sans-serif",
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      border: isActive ? `1.5px solid ${c.active.border}` : '1.5px solid #E8E6DF',
                      background: isActive ? c.active.bg : '#FAFAF8',
                      color: isActive ? c.active.color : '#888780',
                    }}
                  >
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: isActive ? c.dot : '#D3D1C7',
                      display: 'inline-block', flexShrink: 0,
                    }} />
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Notes</label>
          <textarea
            rows={3}
            placeholder="Any additional information..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
          />
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1.5px solid #F1EFE8', marginBottom: 20 }} />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? '#9FE1CB' : '#1D9E75',
            color: '#fff',
            border: 'none',
            borderRadius: 11,
            padding: '13px',
            fontSize: 14.5,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: "'Inter', sans-serif",
            letterSpacing: '0.01em',
            transition: 'background 0.15s, transform 0.1s',
          }}
          onMouseDown={e => { if (!loading) e.currentTarget.style.transform = 'scale(0.98)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {loading ? '⏳ Adding lead...' : '✅ Add Lead'}
        </button>
      </div>
    </div>
  );
}