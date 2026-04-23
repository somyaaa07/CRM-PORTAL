import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LeadInfo from '../components/leaddetail/LeadInfo';
import CallTimeline from '../components/leaddetail/CallTimeline';
import CallModal from '../components/CallModal';
import { LuLogs } from "react-icons/lu";

/* ── Google Fonts injection (idempotent) ──────────────────────────────────── */
if (!document.getElementById('crm-fonts')) {
  const link = document.createElement('link');
  link.id   = 'crm-fonts';
  link.rel  = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700&family=Jost:wght@300;400;500&display=swap';
  document.head.appendChild(link);
}

/* ── Shared tokens ─────────────────────────────────────────────────────────── */
const PAGE_BG    = '#fefafa';
const TITLE_FONT = "'Manrope', sans-serif";
const BODY_FONT  = "'Jost', sans-serif";

/* ── Tiny icon components ──────────────────────────────────────────────────── */
const ArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 3L5 8l5 5"/>
  </svg>
);
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
/* ── StatCell ──────────────────────────────────────────────────────────────── */
function StatCell({ value, label, numColor }) {
  return (
    <div style={{
      background: '#f5f0f0', borderRadius: 10, padding: '14px 10px',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: 24, fontWeight: 700, color: numColor || '#1a1a1a',
        fontFamily: TITLE_FONT, lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: '#9e9a9a', marginTop: 5, fontFamily: BODY_FONT }}>
        {label}
      </div>
    </div>
  );
}

/* ── Skeleton loader ───────────────────────────────────────────────────────── */
function SkeletonBlock({ h = 20, w = '100%', radius = 8, mb = 0 }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: radius,
      background: 'linear-gradient(90deg, #f5f0f0 25%, #ede8e8 50%, #f5f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      marginBottom: mb,
    }}/>
  );
}

export default function LeadDetail() {
  const { leadId }   = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();

  const [lead, setLead]                   = useState(null);
  const [callLogs, setCallLogs]           = useState([]);
  const [agents, setAgents]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showCallModal, setShowCallModal] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/leads/${leadId}/detail`);
      setLead(res.data.lead);
      setCallLogs(res.data.callLogs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    if (user.role !== 'admin') return;
    try {
      const res = await API.get('/admin/agents');
      setAgents(res.data.agents.filter(a => a.isActive));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDetail();
    fetchAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  /* ── Page wrapper style ── */
  const pageStyle = {
    minHeight: '100vh',
    background: PAGE_BG,
    padding: '24px 20px',
    fontFamily: BODY_FONT,
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div style={pageStyle}>
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <SkeletonBlock h={28} w={80} />
            <SkeletonBlock h={36} w={120} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #ede8e8', padding: 20 }}>
                {[80, 60, 50, 50, 40].map((w, i) => <SkeletonBlock key={i} h={16} w={`${w}%`} mb={12} radius={6} />)}
              </div>
              <div style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #ede8e8', padding: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[0,1,2,3].map(i => <SkeletonBlock key={i} h={68} radius={10} />)}
                </div>
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #ede8e8', padding: 20 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                  <SkeletonBlock h={32} w={32} radius={16} />
                  <div style={{ flex: 1 }}>
                    <SkeletonBlock h={14} w="60%" mb={8} radius={6} />
                    <SkeletonBlock h={12} w="40%" radius={6} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (!lead) {
    return (
      <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: '#FCEBEB',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', fontSize: 22,
          }}>
            ✕
          </div>
          <h2 style={{ fontFamily: TITLE_FONT, fontWeight: 700, fontSize: 18, color: '#1a1a1a', margin: '0 0 6px' }}>
            Lead not found
          </h2>
          <p style={{ fontSize: 13, color: '#9e9a9a', margin: '0 0 16px' }}>
            This lead may have been removed or does not exist.
          </p>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none', border: '0.5px solid #e0dcdc', borderRadius: 8,
              padding: '8px 18px', fontSize: 13, color: '#185FA5', cursor: 'pointer',
              fontFamily: TITLE_FONT, fontWeight: 500,
            }}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  /* ── Quick stats derived values ── */
  const totalCalls    = callLogs.length;
  const answeredCalls = callLogs.filter(l => l.disposition === 'Answered').length;
  const totalSeconds  = callLogs.reduce((s, l) => s + (l.callDuration || 0), 0);
  const totalDuration = totalSeconds > 0 ? `${Math.floor(totalSeconds / 60)}m` : '0m';
  const callbacks     = callLogs.filter(l => l.disposition === 'Callback Requested').length;

  return (
    <div style={pageStyle}>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @media(max-width:680px){.ld-grid{grid-template-columns:1fr !important}}
      `}</style>

      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* ── Top bar ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22,
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, color: '#6b6868', background: 'none',
              border: '0.5px solid #e0dcdc', borderRadius: 8,
              padding: '6px 12px', cursor: 'pointer',
              fontFamily: BODY_FONT, transition: 'all .15s',
            }}
          >
            <ArrowLeft /> Back
          </button>

          {(user.role === 'agent' || user.role === 'admin') && (
        <div style={{ display: 'flex', gap: 8 }}>
  {/* Direct phone call */}
  <a href={`tel:${lead.phone}`} style={{ textDecoration: 'none' }}>
    <button
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        fontSize: 13, fontWeight: 600, color: '#fff',
        background: '#16a34a', border: 'none',
        padding: '9px 18px', borderRadius: 9, cursor: 'pointer',
        fontFamily: TITLE_FONT, letterSpacing: '0.2px',
      }}
    >
      <PhoneIcon /> Call
    </button>
  </a>

  {/* Log call result */}
  <button
    onClick={() => setShowCallModal(true)}
    style={{
      display: 'flex', alignItems: 'center', gap: 7,
      fontSize: 13, fontWeight: 600, color: '#185FA5',
      background: '#EBF3FC', border: '1px solid #B5D4F4',
      padding: '9px 18px', borderRadius: 9, cursor: 'pointer',
      fontFamily: TITLE_FONT, letterSpacing: '0.2px',
    }}
  >
    <LuLogs /> Log Call
  </button>
</div>
          )}
        </div>

        {/* ── Main grid ── */}
        <div
          className="ld-grid"
          style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 16, alignItems: 'start' }}
        >
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <LeadInfo lead={lead} agents={agents} onUpdate={fetchDetail} />

            {/* Quick Stats */}
            <div style={{
              background: '#ffffff', border: '0.5px solid #ede8e8',
              borderRadius: 14, padding: '20px',
            }}>
              <h3 style={{
                fontFamily: TITLE_FONT, fontSize: 12, fontWeight: 700, color: '#1a1a1a',
                marginBottom: 14, letterSpacing: '0.5px', textTransform: 'uppercase',
              }}>
                Quick Stats
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <StatCell value={totalCalls}    label="Total Calls"  numColor="#185FA5" />
                <StatCell value={answeredCalls} label="Answered"     numColor="#3B6D11" />
                <StatCell value={totalDuration} label="Duration"     numColor="#534AB7" />
                <StatCell value={callbacks}     label="Callbacks"    numColor="#854F0B" />
              </div>
            </div>
          </div>

          {/* Right column */}
          <CallTimeline callLogs={callLogs} />
        </div>
      </div>

      {/* Call Modal */}
      {showCallModal && (
        <CallModal
          lead={lead}
          onClose={() => setShowCallModal(false)}
          onSaved={fetchDetail}
        />
      )}
    </div>
  );
}