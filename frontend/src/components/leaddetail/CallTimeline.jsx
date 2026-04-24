/* ─── CallTimeline.jsx ──────────────────────────────────────────────────────── */
import { formatFollowUpDate } from "../../utils/dateUtils";
const DISPOSITION_STYLES = {
  'Answered':           { bg: '#EAF3DE', color: '#3B6D11', border: '#C0DD97', dotBg: '#EAF3DE', dotBorder: '#97C459' },
  'No Answer':          { bg: '#FCEBEB', color: '#A32D2D', border: '#F7C1C1', dotBg: '#FCEBEB', dotBorder: '#F09595' },
  'Busy':               { bg: '#FAEEDA', color: '#854F0B', border: '#FAC775', dotBg: '#FAEEDA', dotBorder: '#FAC775' },
  'Voicemail':          { bg: '#E6F1FB', color: '#185FA5', border: '#B5D4F4', dotBg: '#E6F1FB', dotBorder: '#85B7EB' },
  'Wrong Number':       { bg: '#F1EFE8', color: '#5F5E5A', border: '#D3D1C7', dotBg: '#F1EFE8', dotBorder: '#B4B2A9' },
  'Callback Requested': { bg: '#EEEDFE', color: '#534AB7', border: '#AFA9EC', dotBg: '#EEEDFE', dotBorder: '#AFA9EC' },
};

/* ── Icons ──────────────────────────────────────────────────────────────────── */
const PhoneIcon = ({style}
) => (
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
const PhoneOffIcon = () => (
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
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <circle cx="8" cy="8" r="6"/>
    <path d="M8 4.5V8l2.5 1.5"/>
  </svg>
);
const VoicemailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <rect x="1" y="5" width="14" height="8" rx="2"/>
    <circle cx="4.5" cy="9" r="1.5"/>
    <circle cx="11.5" cy="9" r="1.5"/>
    <path d="M4.5 10.5h7"/>
  </svg>
);
const BellIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M8 1.5A4.5 4.5 0 0 0 3.5 6v3l-1 1.5h11L12.5 9V6A4.5 4.5 0 0 0 8 1.5zM6.5 13.5a1.5 1.5 0 0 0 3 0"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <rect x="2" y="2" width="12" height="12" rx="2"/>
    <path d="M5 1v2M11 1v2M2 6h12"/>
  </svg>
);

const ICON_MAP = {
  'Answered':           (c) => <PhoneIcon style={{ color: c }} />,
  'No Answer':          ()  => <PhoneOffIcon />,
  'Busy':               ()  => <ClockIcon />,
  'Voicemail':          ()  => <VoicemailIcon />,
  'Wrong Number':       ()  => <PhoneOffIcon />,
  'Callback Requested': ()  => <BellIcon />,
};

export default function CallTimeline({ callLogs }) {
  const baseFont = "'Jost', sans-serif";
  const titleFont = "'Manrope', sans-serif";

  if (!callLogs || callLogs.length === 0) {
    return (
      <div style={{
        background: '#ffffff', border: '0.5px solid #ede8e8',
        borderRadius: 14, padding: '20px', fontFamily: baseFont,
      }}>
        <h3 style={{ fontFamily: titleFont, fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 20, letterSpacing: '0.3px' }}>
          Call History
        </h3>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', background: '#f5f0f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px',
          }}>
            <PhoneIcon style={{ color: '#c4bfbf' }} />
          </div>
          <p style={{ fontSize: 13, color: '#b0acac' }}>No calls logged yet</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#ffffff', border: '0.5px solid #ede8e8',
      borderRadius: 14, padding: '20px', fontFamily: baseFont,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontFamily: titleFont, fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: 0, letterSpacing: '0.3px' }}>
          Call History
        </h3>
        <span style={{
          fontSize: 11, fontWeight: 500, background: '#E6F1FB', color: '#185FA5',
          padding: '3px 10px', borderRadius: 20, fontFamily: titleFont,
        }}>
          {callLogs.length} calls
        </span>
      </div>

      {/* Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {callLogs.map((log, index) => {
          const st = DISPOSITION_STYLES[log.disposition] || DISPOSITION_STYLES['No Answer'];
          const isOverdue = log.followUpDate && new Date(log.followUpDate) < new Date();
          const duration = log.callDuration > 0
            ? `${Math.floor(log.callDuration / 60)}m ${log.callDuration % 60}s`
            : null;

          return (
            <div key={log.id} style={{ display: 'flex', gap: 12 }}>
              {/* Track */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32, flexShrink: 0 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: st.dotBg, border: `1.5px solid ${st.dotBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: st.color,
                }}>
                  {ICON_MAP[log.disposition]?.(st.color) || <PhoneIcon style={{ color: st.color }} />}
                </div>
                {index < callLogs.length - 1 && (
                  <div style={{ width: 1.5, flex: 1, background: '#ede8e8', margin: '3px 0', minHeight: 12 }} />
                )}
              </div>

              {/* Body */}
              <div style={{ flex: 1, paddingBottom: index < callLogs.length - 1 ? 18 : 0 }}>
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 5 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 20,
                    background: st.bg, color: st.color, border: `0.5px solid ${st.border}`,
                    fontFamily: titleFont, letterSpacing: '0.2px',
                  }}>
                    {log.disposition}
                  </span>
                 <span className="text-xs text-gray-400">
                  🕐 {formatFollowUpDate(log.calledAt)}
                </span>
                </div>

                {/* Agent */}
                <p style={{ fontSize: 12, color: '#6b6868', margin: '0 0 2px' }}>
                  {log.agent?.name || 'Unknown Agent'}
                </p>

                {/* Duration */}
                {duration && (
                  <p style={{ fontSize: 12, color: '#b0acac', margin: '0 0 4px', fontFamily: "'Courier New', monospace" }}>
                    {duration}
                  </p>
                )}

                {/* Notes */}
                {log.notes && (
                  <div style={{
                    background: '#f9f5f5', borderRadius: 7, padding: '7px 10px',
                    marginTop: 6, fontSize: 12, color: '#4a4747', lineHeight: 1.5,
                  }}>
                    {log.notes}
                  </div>
                )}

                {/* Follow-up */}
                {log.followUpDate && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 11, marginTop: 6, padding: '3px 8px', borderRadius: 20,
                    background: isOverdue ? '#FCEBEB' : '#EEEDFE',
                    color:      isOverdue ? '#A32D2D' : '#534AB7',
                    fontFamily: baseFont,
                  }}>
                    <CalendarIcon />
                    {new Date(log.followUpDate).toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                    {isOverdue && <strong style={{ marginLeft: 2 }}>· Overdue</strong>}
                  </span>
                )}

                {/* Alert */}
                {log.alertEnabled && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    fontSize: 11, color: '#854F0B', background: '#FAEEDA',
                    padding: '2px 8px', borderRadius: 20, marginTop: 5,
                    fontFamily: baseFont,
                  }}>
                    <BellIcon /> Alert on
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}