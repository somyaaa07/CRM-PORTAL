import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAlerts } from '../context/AdminAlertContext';

export default function MetaLeadsBanner() {
  const { metaAlerts } = useAdminAlerts();
  const navigate       = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (!metaAlerts || metaAlerts.last24Hours === 0 || dismissed) {
    return null;
  }

  return (
    <div style={{
      margin:     '14px 20px 0',
      background: '#EEF2FF',
      border:     '1px solid #C7D2FE',
      borderRadius: 12,
      padding:    '12px 16px',
      display:    'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Meta icon */}
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'linear-gradient(135deg, #1877F2, #42A5F5)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18, flexShrink: 0,
        }}>
          f
        </div>

        <div>
          <p style={{
            margin: 0, fontWeight: 700, fontSize: 13,
            color: '#3730A3',
            fontFamily: "'Manrope', sans-serif",
          }}>
            🎉 {metaAlerts.last24Hours} New Meta Lead{metaAlerts.last24Hours > 1 ? 's' : ''} Aaye!
          </p>
          <p style={{
            margin: 0, fontSize: 11, color: '#6366F1', marginTop: 2,
            fontFamily: "'Jost', sans-serif",
          }}>
            Last 24 hours • Total Meta Leads: {metaAlerts.totalMeta}
          </p>
        </div>
      </div>

      {/* Right — Buttons */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={() => navigate('/admin/leads?source=Meta Ads')}
          style={{
            background: '#4F46E5', color: '#fff',
            border: 'none', borderRadius: 8,
            padding: '7px 14px', fontSize: 12,
            fontWeight: 600, cursor: 'pointer',
            fontFamily: "'Manrope', sans-serif",
          }}
        >
          View Leads →
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none',
            border: '1px solid #C7D2FE',
            borderRadius: 8, color: '#6366F1',
            padding: '7px 10px', fontSize: 12,
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}