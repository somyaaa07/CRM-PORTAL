import { useState } from 'react';
import { useAlerts } from '../context/AlertContext';
import { useNavigate } from 'react-router-dom';

/* ── Icons ──────────────────────────────────────────────────────────────────── */
const BellIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M8 1.5A4.5 4.5 0 0 0 3.5 6v3l-1.5 2h12l-1.5-2V6A4.5 4.5 0 0 0 8 1.5z"/>
    <path d="M6.5 13.5a1.5 1.5 0 0 0 3 0"/>
  </svg>
);
const PhoneIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
    <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015L10.164 5.564a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L3.737 3.53a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58z"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="2" width="12" height="12" rx="2"/>
    <path d="M5 1v2M11 1v2M2 6h12"/>
  </svg>
);
const ChevronIcon = ({ up }) => (
  <svg
    width="14" height="14" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="2"
    style={{ transform: up ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s' }}
  >
    <path d="M3 6l5 5 5-5"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M3 3l10 10M13 3L3 13"/>
  </svg>
);
const WarningIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M8 2L1.5 13.5h13z"/>
    <path d="M8 7v3M8 11.5h.01"/>
  </svg>
);

/* ── Dot pulse animation style tag ──────────────────────────────────────────── */
const ANIM = `
  @keyframes pulse-ring {
    0%   { transform: scale(1);   opacity: .8; }
    100% { transform: scale(1.9); opacity: 0;  }
  }
  @keyframes slide-down {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
`;

export default function AlertBanner() {
  const { alerts, alertStats, dismissAlert, loading } = useAlerts();
  const [expanded, setExpanded]     = useState(true);
  const [dismissing, setDismissing] = useState(null);
  const navigate = useNavigate();

  if (loading || alerts.length === 0) return null;

  const handleDismiss = async (leadId) => {
    setDismissing(leadId);
    await dismissAlert(leadId);
    setDismissing(null);
  };

  const hasOverdue = alertStats.overdue > 0;

  /* ── Color tokens based on severity ── */
  const accent = hasOverdue
    ? { header: '#FCEBEB', headerBorder: '#F09595', headerText: '#A32D2D', dot: '#E24B4A', pill: { bg: '#FCEBEB', color: '#A32D2D', border: '#F7C1C1' } }
    : { header: '#FAEEDA', headerBorder: '#FAC775', headerText: '#854F0B', dot: '#EF9F27', pill: { bg: '#FAEEDA', color: '#854F0B', border: '#FAC775' } };

  return (
    <>
      <style>{ANIM}</style>
      <div style={{ margin: '14px 20px 0', fontFamily: "'Jost', sans-serif" }}>

        {/* ── Header bar ── */}
        <div
          onClick={() => setExpanded(!expanded)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '11px 16px',
            background: accent.header,
            border: `0.5px solid ${accent.headerBorder}`,
            borderRadius: expanded ? '12px 12px 0 0' : '12px',
            cursor: 'pointer', userSelect: 'none',
            transition: 'border-radius .2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Pulsing dot */}
            <div style={{ position: 'relative', width: 10, height: 10, flexShrink: 0 }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: accent.dot, opacity: 0.3,
                animation: 'pulse-ring 1.4s ease-out infinite',
              }}/>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: accent.dot, position: 'relative' }}/>
            </div>

            <div style={{ color: accent.headerText }}>
              <span style={{
                fontFamily: "'Manrope', sans-serif", fontWeight: 700,
                fontSize: 13, letterSpacing: '0.1px',
              }}>
                {hasOverdue
                  ? `${alertStats.overdue} Overdue Follow-up${alertStats.overdue > 1 ? 's' : ''}`
                  : `${alertStats.total} Follow-up Reminder${alertStats.total > 1 ? 's' : ''}`
                }
              </span>

              {alertStats.upcoming > 0 && hasOverdue && (
                <span style={{
                  marginLeft: 8, fontSize: 11, fontWeight: 500,
                  background: hasOverdue ? '#F7C1C1' : '#FAC775',
                  color: accent.headerText,
                  padding: '2px 8px', borderRadius: 20,
                  fontFamily: "'Jost', sans-serif",
                }}>
                  +{alertStats.upcoming} upcoming
                </span>
              )}
            </div>
          </div>

          <div style={{ color: accent.headerText, display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Total count badge */}
            <span style={{
              fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 12,
              background: hasOverdue ? '#F09595' : '#FAC775',
              color: '#fff', width: 22, height: 22, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {alertStats.total}
            </span>
            <ChevronIcon up={expanded} />
          </div>
        </div>

        {/* ── Expanded list ── */}
        {expanded && (
          <div style={{
            background: '#ffffff', border: `0.5px solid ${accent.headerBorder}`,
            borderTop: 'none', borderRadius: '0 0 12px 12px',
            overflow: 'hidden',
            animation: 'slide-down .18s ease-out',
          }}>
            {alerts.slice(0, 5).map((alert, idx) => {
              const rowBg    = alert.overdue ? '#fdf8f8' : '#fffcf7';
              const isDismissing = dismissing === alert.leadId;

              return (
                <div
                  key={`${alert.type}-${alert.leadId}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 16px',
                    background: rowBg,
                    borderBottom: idx < Math.min(alerts.length, 5) - 1 ? '0.5px solid #ede8e8' : 'none',
                    opacity: isDismissing ? 0.45 : 1,
                    transition: 'opacity .2s',
                  }}
                >
                  {/* Severity indicator strip */}
                  <div style={{
                    width: 3, height: 36, borderRadius: 4, flexShrink: 0,
                    background: alert.overdue ? '#E24B4A' : '#EF9F27',
                  }}/>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                      <span style={{
                        fontFamily: "'Manrope', sans-serif", fontWeight: 600,
                        fontSize: 13, color: '#1a1a1a',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {alert.name}
                      </span>
                      {alert.overdue && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20,
                          background: '#FCEBEB', color: '#A32D2D',
                          fontFamily: "'Manrope', sans-serif", letterSpacing: '0.2px',
                          flexShrink: 0,
                        }}>
                          <WarningIcon /> Overdue
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#9e9a9a' }}>
                        <PhoneIcon /> {alert.phone}
                      </span>
                      <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#d4cfcf' }}/>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#9e9a9a' }}>
                        <CalendarIcon />
                        {new Date(alert.followUpDate).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                  <button
  onClick={() => navigate(`/leads/${alert.leadId}`)}
  style={{
    display: 'flex', alignItems: 'center', gap: 5,
    fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 8,
    background: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer',
    fontFamily: "'Manrope', sans-serif", letterSpacing: '0.2px',
    transition: 'background .15s',
  }}
  onMouseEnter={e => e.currentTarget.style.background = '#15803d'}
  onMouseLeave={e => e.currentTarget.style.background = '#16a34a'}
>
  <PhoneIcon /> Call
</button> 
                    <button
                      onClick={() => handleDismiss(alert.leadId)}
                      disabled={isDismissing}
                      title="Dismiss"
                      style={{
                        width: 30, height: 30, borderRadius: 8, border: '0.5px solid #e0dcdc',
                        background: '#fefafa', color: '#9e9a9a', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all .15s', flexShrink: 0,
                        opacity: isDismissing ? 0.5 : 1,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FCEBEB'; e.currentTarget.style.color = '#A32D2D'; e.currentTarget.style.borderColor = '#F7C1C1'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fefafa'; e.currentTarget.style.color = '#9e9a9a'; e.currentTarget.style.borderColor = '#e0dcdc'; }}
                    >
                      {isDismissing ? '…' : <CloseIcon />}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Overflow count */}
            {alerts.length > 5 && (
              <div style={{
                padding: '9px 16px', textAlign: 'center',
                fontSize: 12, color: '#9e9a9a', fontFamily: "'Jost', sans-serif",
                background: '#fefafa', borderTop: '0.5px solid #ede8e8',
              }}>
                +{alerts.length - 5} more follow-up{alerts.length - 5 > 1 ? 's' : ''} pending
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}