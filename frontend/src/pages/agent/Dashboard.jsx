import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import API from '../../api/axios';
import AlertBanner from '../../components/AlertBanner';
import ConversionChart from '../../components/ConversionCharts';
import {
  Users, CheckCircle2, Flame, Bell, XCircle, TrendingDown,
  ClipboardList, BarChart2, Phone, AlertTriangle, CalendarClock,
  ChevronRight, Sparkles,
} from 'lucide-react';

/* ─── Design tokens (mirrors Login.jsx) ──────────────────────────────── */
const T = {
  purple:     '#7c4dff',
  purpleDark: '#5722cc',
  purpleLight:'rgba(124,77,255,0.1)',
  ink:        '#0b0715',
  bg:         '#f5f4fa',
  white:      '#ffffff',
  font:       "'Manrope', sans-serif",
};

/* ─── Card color configs ──────────────────────────────────────────────── */
const CARD_COLORS = {
  all:            { bg: '#ede9fe', text: '#5b21b6', icon: '#7c4dff',  iconBg: 'rgba(124,77,255,0.12)' },
  Converted:      { bg: '#dcfce7', text: '#166534', icon: '#16a34a',  iconBg: 'rgba(22,163,74,0.12)'  },
  Interested:     { bg: '#cffafe', text: '#155e75', icon: '#0891b2',  iconBg: 'rgba(8,145,178,0.12)'  },
  'Follow-Up':    { bg: '#fef9c3', text: '#854d0e', icon: '#ca8a04',  iconBg: 'rgba(202,138,4,0.12)'  },
  'Not Interested':{ bg:'#ffedd5', text: '#9a3412', icon: '#ea580c',  iconBg: 'rgba(234,88,12,0.12)'  },
  Lost:           { bg: '#fee2e2', text: '#991b1b', icon: '#dc2626',  iconBg: 'rgba(220,38,38,0.12)'  },
};

export default function AgentDashboard() {
  const { user }       = useAuth();
  const { alertStats } = useAlerts();
  const navigate       = useNavigate();

  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/leads/my-leads?page=1&limit=1000');
        const all = res.data.leads;
        setStats({
          total:          all.length,
          converted:      all.filter((l) => l.status === 'Converted').length,
          lost:           all.filter((l) => l.status === 'Lost').length,
          notInterested:  all.filter((l) => l.status === 'Not Interested').length,
          followUp:       all.filter((l) => l.status === 'Follow-Up').length,
          interested:     all.filter((l) => l.status === 'Interested').length,
          new:            all.filter((l) => l.status === 'New').length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleCardClick = (status) => {
    if (status === 'all') navigate('/agent/my-leads');
    else navigate(`/agent/my-leads?status=${encodeURIComponent(status)}`);
  };

  const cards = [
    { label: 'Total Leads',    value: stats?.total          ?? '—', Icon: Users,        status: 'all'           },
    { label: 'Converted',      value: stats?.converted      ?? '—', Icon: CheckCircle2, status: 'Converted'     },
    { label: 'Interested',     value: stats?.interested     ?? '—', Icon: Flame,        status: 'Interested'    },
    { label: 'Follow-Up',      value: stats?.followUp       ?? '—', Icon: Bell,         status: 'Follow-Up'     },
    { label: 'Not Interested', value: stats?.notInterested  ?? '—', Icon: XCircle,      status: 'Not Interested'},
    { label: 'Lost',           value: stats?.lost           ?? '—', Icon: TrendingDown, status: 'Lost'          },
  ];

  const quickActions = [
    { to: '/agent/my-leads',     Icon: ClipboardList, title: 'My Leads',    desc: 'View your assigned leads'  },
    { to: '/agent/conversions',  Icon: BarChart2,     title: 'Conversions', desc: 'Track deal status'         },
    { to: '/agent/call-history', Icon: Phone,         title: 'Call History',desc: 'Review your call logs'     },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');

        .dash-root {
          font-family: ${T.font};
          background: ${T.bg};
          min-height: 100vh;
          color: ${T.ink};
        }

        /* ── Header bar ── */
        .dash-header {
          background: ${T.white};
          border-bottom: 1px solid rgba(11,7,21,0.07);
          padding: 1.5rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          opacity: ${mounted ? 1 : 0};
          transform: ${mounted ? 'translateY(0)' : 'translateY(-8px)'};
          transition: opacity 0.4s ease, transform 0.4s ease;
        }

        .header-left { display: flex; flex-direction: column; gap: 3px; }

        .header-eyebrow {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: ${T.purple};
        }

        .header-title {
          font-size: 1.45rem;
          font-weight: 800;
          color: ${T.ink};
          letter-spacing: -0.03em;
        }

        .header-title span { color: ${T.purple}; }

        .header-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: ${T.purpleLight};
          border: 1px solid rgba(124,77,255,0.2);
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 0.72rem;
          font-weight: 700;
          color: ${T.purple};
          letter-spacing: 0.02em;
        }

        /* ── Body ── */
        .dash-body {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          opacity: ${mounted ? 1 : 0};
          transform: ${mounted ? 'translateY(0)' : 'translateY(12px)'};
          transition: opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s;
        }

        /* ── Alert strip ── */
        .alert-strip {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .alert-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0.85rem 1.25rem;
          border-radius: 12px;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
        }

        .alert-chip:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }

        .alert-chip.overdue {
          background: #fee2e2;
          border: 1px solid rgba(220,38,38,0.2);
        }

        .alert-chip.upcoming {
          background: #ffedd5;
          border: 1px solid rgba(234,88,12,0.18);
        }

        .alert-num {
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
        }

        .overdue .alert-num  { color: #dc2626; }
        .upcoming .alert-num { color: #ea580c; }

        .alert-label {
          font-size: 0.72rem;
          font-weight: 600;
        }

        .overdue .alert-label  { color: #991b1b; }
        .upcoming .alert-label { color: #9a3412; }

        /* ── Section label ── */
        .section-label {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(11,7,21,0.35);
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* ── Stats grid ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }

        .stat-card {
          border-radius: 14px;
          padding: 1.25rem;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          border: 1px solid transparent;
          transition: transform 0.18s, box-shadow 0.18s;
        }

        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 28px rgba(0,0,0,0.1);
        }

        .stat-card:hover .stat-hint { opacity: 1; }

        .stat-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 0.85rem;
        }

        .stat-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-arrow {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(0,0,0,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }

        .stat-card:hover .stat-arrow { background: rgba(0,0,0,0.12); }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.05em;
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.72rem;
          font-weight: 600;
          opacity: 0.7;
        }

        .stat-hint {
          font-size: 0.65rem;
          font-weight: 600;
          opacity: 0;
          margin-top: 8px;
          transition: opacity 0.15s;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* skeleton */
        .skel {
          border-radius: 14px;
          height: 110px;
          background: linear-gradient(90deg, #e8e6f0 25%, #f0eef8 50%, #e8e6f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }

        @keyframes shimmer { to { background-position: -200% 0; } }

        /* ── Quick actions ── */
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        @media (max-width: 640px) {
          .actions-grid { grid-template-columns: 1fr; }
        }

        .action-card {
          background: ${T.white};
          border: 1px solid rgba(11,7,21,0.07);
          border-radius: 14px;
          padding: 1.4rem 1.25rem;
          cursor: pointer;
          transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .action-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 28px rgba(124,77,255,0.1);
          border-color: rgba(124,77,255,0.25);
        }

        .action-icon {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          background: ${T.purpleLight};
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${T.purple};
          transition: background 0.15s;
        }

        .action-card:hover .action-icon {
          background: ${T.purple};
          color: #fff;
        }

        .action-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: ${T.ink};
          letter-spacing: -0.01em;
        }

        .action-desc {
          font-size: 0.75rem;
          font-weight: 400;
          color: rgba(11,7,21,0.4);
          line-height: 1.5;
        }

        .action-footer {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          font-weight: 600;
          color: ${T.purple};
          opacity: 0;
          transition: opacity 0.15s;
        }

        .action-card:hover .action-footer { opacity: 1; }
      `}</style>

      <div className="dash-root">
        <AlertBanner />

        {/* ── Header ── */}
        <div className="dash-header">
          <div className="header-left">
            <span className="header-eyebrow">Agent Portal</span>
            <h1 className="header-title">
              Good day, <span>{user?.name?.split(' ')[0]}</span>
            </h1>
          </div>
          <div className="header-badge">
            <Sparkles size={13} />
            Dashboard
          </div>
        </div>


        {/* ── Body ── */}
        <div className="dash-body">

          {/* Alert strip */}
          {alertStats.total > 0 && (
            <div className="alert-strip">
              {alertStats.overdue > 0 && (
                <div className="alert-chip overdue" onClick={() => navigate('/agent/my-leads')}>
                  <AlertTriangle size={18} color="#dc2626" />
                  <div>
                    <div className="alert-num">{alertStats.overdue}</div>
                    <div className="alert-label">Overdue Follow-ups</div>
                  </div>
                </div>
              )}
              {alertStats.upcoming > 0 && (
                <div className="alert-chip upcoming" onClick={() => navigate('/agent/my-leads')}>
                  <CalendarClock size={18} color="#ea580c" />
                  <div>
                    <div className="alert-num">{alertStats.upcoming}</div>
                    <div className="alert-label">Today's Follow-ups</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div>
            <div className="section-label">
              <BarChart2 size={11} />
              Lead Summary — Click to filter
            </div>

            {loading ? (
              <div className="stats-grid">
                {[...Array(6)].map((_, i) => <div key={i} className="skel" />)}
              </div>
            ) : (
              <div className="stats-grid">
                {cards.map(({ label, value, Icon, status }, idx) => {
                  const c = CARD_COLORS[status];
                  return (
                    <div
                      key={label}
                      className="stat-card"
                      style={{
                        background: c.bg,
                        animationDelay: `${idx * 60}ms`,
                      }}
                      onClick={() => handleCardClick(status)}
                    >
                      <div className="stat-top">
                        <div className="stat-icon-box" style={{ background: c.iconBg }}>
                          <Icon size={17} color={c.icon} strokeWidth={2.2} />
                        </div>
                        <div className="stat-arrow">
                          <ChevronRight size={12} color={c.text} />
                        </div>
                      </div>
                      <div className="stat-value" style={{ color: c.text }}>{value}</div>
                      <div className="stat-label" style={{ color: c.text }}>{label}</div>
                      <div className="stat-hint" style={{ color: c.text }}>
                        <ChevronRight size={11} /> View leads
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div>
            <div className="section-label">
              <Sparkles size={11} />
              Quick Actions
            </div>
            <div className="actions-grid">
              {quickActions.map(({ to, Icon, title, desc }) => (
                <div key={to} className="action-card" onClick={() => navigate(to)}>
                  <div className="action-icon">
                    <Icon size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="action-title">{title}</div>
                    <div className="action-desc">{desc}</div>
                  </div>
                  <div className="action-footer">
                    Open <ChevronRight size={12} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}