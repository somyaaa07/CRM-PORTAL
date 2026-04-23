import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, UserCheck, PhoneCall, PhoneIncoming,
  Sparkles, Bell, XCircle, CalendarCheck,
  UserCog, ClipboardList, BarChart2, Upload,
  TrendingUp, Wifi, ChevronRight,
} from 'lucide-react';
import API from '../../api/axios';
import ConversionChart from '../../components/ConversionCharts';

/* ─────────────────────────────────────────
   FONTS & GLOBAL STYLES  (fully responsive)
───────────────────────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Jost:wght@400;500;600;700&display=swap');

    :root {
      --font-title: 'Manrope', sans-serif;
      --font-body:  'Jost', sans-serif;
    }

    *, *::before, *::after {
      font-family: var(--font-body);
      box-sizing: border-box;
    }

    /* ── Dashboard wrapper ── */
    .dashboard-root {
      min-height: 100vh;
      background: #f5f3ff;
      padding: 32px;
    }

    /* ── Header ── */
    .dashboard-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
      gap: 12px;
    }
    .dashboard-title {
      font-family: var(--font-title);
      font-weight: 700;
      font-size: 1.5rem;
      color: #1e1b4b;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .dashboard-subtitle {
      font-family: var(--font-body);
      font-size: 13px;
      color: #8369cf;
      margin-top: 4px;
      font-weight: 400;
    }
    .live-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fff;
      border: 1.5px solid #ede9fe;
      border-radius: 12px;
      padding: 8px 16px;
      font-size: 13px;
      color: black;
      font-family: var(--font-body);
      font-weight: 500;
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* ── Primary stats grid: 4 → 2 → 1 ── */
    .stats-grid-primary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 12px;
    }
    .stats-grid-secondary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 32px;
    }

    /* ── Bottom layout: chart + actions ── */
    .bottom-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
    }
    .chart-col {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .actions-col {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .actions-links {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* ── Stat Cards ── */
    .stat-card {
      position: relative;
      overflow: hidden;
      border-radius: 20px;
      padding: 22px 20px 20px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .stat-card.clickable { cursor: pointer; }
    .stat-card:hover { transform: translateY(-3px); }
    .stat-card::after {
      content: '';
      position: absolute;
      bottom: -26px; right: -26px;
      width: 96px; height: 96px;
      border-radius: 50%;
      opacity: 0.22;
      pointer-events: none;
    }

    .stat-val {
      font-family: var(--font-title);
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .stat-lbl {
      font-family: var(--font-body);
      font-size: 10.5px;
      font-weight: 600;
      margin-top: 6px;
      letter-spacing: 0.11em;
      text-transform: uppercase;
    }
    .stat-hint {
      font-family: var(--font-body);
      font-size: 10px;
      margin-top: 10px;
      font-weight: 500;
    }

    /* ── Pastel card themes ── */
    .c-lavender { background:#ede9fe;  box-shadow:0 4px 18px -4px rgba(139,92,246,0.18); }
    .c-lavender:hover { box-shadow:0 12px 30px -6px rgba(139,92,246,0.28); }
    .c-lavender::after { background:#a78bfa; }
    .c-lavender .chip { background:#ddd6fe; }
    .c-lavender .chip svg { color:#7c3aed; }
    .c-lavender .stat-val  { color:#3b0764; }
    .c-lavender .stat-lbl  { color:#7c3aed; }
    .c-lavender .stat-hint { color:#a78bfa; }

    .c-sky { background:#e0f2fe;  box-shadow:0 4px 18px -4px rgba(14,165,233,0.16); }
    .c-sky:hover { box-shadow:0 12px 30px -6px rgba(14,165,233,0.26); }
    .c-sky::after { background:#38bdf8; }
    .c-sky .chip { background:#bae6fd; }
    .c-sky .chip svg { color:#0284c7; }
    .c-sky .stat-val  { color:#0c4a6e; }
    .c-sky .stat-lbl  { color:#0284c7; }
    .c-sky .stat-hint { color:#38bdf8; }

    .c-mint { background:#d1fae5;  box-shadow:0 4px 18px -4px rgba(16,185,129,0.16); }
    .c-mint:hover { box-shadow:0 12px 30px -6px rgba(16,185,129,0.26); }
    .c-mint::after { background:#34d399; }
    .c-mint .chip { background:#a7f3d0; }
    .c-mint .chip svg { color:#059669; }
    .c-mint .stat-val  { color:#064e3b; }
    .c-mint .stat-lbl  { color:#059669; }
    .c-mint .stat-hint { color:#34d399; }

    .c-peach { background:#ffedd5; box-shadow:0 4px 18px -4px rgba(249,115,22,0.16); }
    .c-peach:hover { box-shadow:0 12px 30px -6px rgba(249,115,22,0.26); }
    .c-peach::after { background:#fb923c; }
    .c-peach .chip { background:#fed7aa; }
    .c-peach .chip svg { color:#ea580c; }
    .c-peach .stat-val  { color:#431407; }
    .c-peach .stat-lbl  { color:#ea580c; }
    .c-peach .stat-hint { color:#fb923c; }

    .c-rose { background:#fff1f2; box-shadow:0 4px 18px -4px rgba(244,63,94,0.12); }
    .c-rose:hover { box-shadow:0 12px 30px -6px rgba(244,63,94,0.22); }
    .c-rose::after { background:#fb7185; }
    .c-rose .chip { background:#fecdd3; }
    .c-rose .chip svg { color:#e11d48; }
    .c-rose .stat-val  { color:#4c0519; }
    .c-rose .stat-lbl  { color:#e11d48; }
    .c-rose .stat-hint { color:#fb7185; }

    .c-amber { background:#fefce8;  box-shadow:0 4px 18px -4px rgba(234,179,8,0.14); }
    .c-amber:hover { box-shadow:0 12px 30px -6px rgba(234,179,8,0.24); }
    .c-amber::after { background:#facc15; }
    .c-amber .chip { background:#fef08a; }
    .c-amber .chip svg { color:#ca8a04; }
    .c-amber .stat-val  { color:#422006; }
    .c-amber .stat-lbl  { color:#ca8a04; }
    .c-amber .stat-hint { color:#facc15; }

    .c-lilac { background:#fdf4ff;  box-shadow:0 4px 18px -4px rgba(192,38,211,0.12); }
    .c-lilac:hover { box-shadow:0 12px 30px -6px rgba(192,38,211,0.22); }
    .c-lilac::after { background:#e879f9; }
    .c-lilac .chip { background:#f0abfc; }
    .c-lilac .chip svg { color:#a21caf; }
    .c-lilac .stat-val  { color:#3b0764; }
    .c-lilac .stat-lbl  { color:#a21caf; }
    .c-lilac .stat-hint { color:#e879f9; }

    .c-teal { background:#f0fdfa;  box-shadow:0 4px 18px -4px rgba(20,184,166,0.12); }
    .c-teal:hover { box-shadow:0 12px 30px -6px rgba(20,184,166,0.22); }
    .c-teal::after { background:#2dd4bf; }
    .c-teal .chip { background:#99f6e4; }
    .c-teal .chip svg { color:#0d9488; }
    .c-teal .stat-val  { color:#042f2e; }
    .c-teal .stat-lbl  { color:#0d9488; }
    .c-teal .stat-hint { color:#2dd4bf; }

    /* ── Section label ── */
    .section-label {
      display: block;
      font-family: var(--font-body);
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.13em;
      text-transform: uppercase;
      color: #000;
      margin-bottom: 12px;
    }

    /* ── Progress bar ── */
    .progress-fill {
      background: linear-gradient(90deg, #a78bfa, #6d28d9);
      transition: width 1.2s cubic-bezier(.4,0,.2,1);
      border-radius: 9999px;
    }

    /* ── Quick links ── */
    .quick-link { transition: all 0.18s ease; }
    .quick-link:hover { transform: translateX(3px); box-shadow: 0 4px 20px rgba(109,40,217,0.10); }
    .quick-link:hover .arrow-icon { opacity: 1; transform: translateX(2px); }
    .arrow-icon { opacity: 0; transition: all 0.18s ease; }

    /* ── Stat chip icon ── */
    .stat-chip {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    /* ── Conversion card ── */
    .conversion-card {
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(8px);
      border: 1.5px solid #ede9fe;
      border-radius: 20px;
      padding: 24px;
    }
    .conversion-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 20px;
      gap: 12px;
    }
    .conversion-rate {
      font-family: var(--font-title);
      font-size: 2rem;
      font-weight: 700;
      color: #7c3aed;
      letter-spacing: -1px;
      line-height: 1;
      white-space: nowrap;
    }
    .legend-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 16px;
    }

    /* ── Chart card ── */
    .chart-card {
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(8px);
      border: 1.5px solid #ede9fe;
      border-radius: 20px;
      padding: 24px;
      flex: 1;
    }

    /* ────────────────────────────────────────────
       BREAKPOINT: Tablet  ≤ 1024px
    ──────────────────────────────────────────── */
    @media (max-width: 1024px) {
      .dashboard-root {
        padding: 24px 20px;
      }

      .stats-grid-primary,
      .stats-grid-secondary {
        grid-template-columns: repeat(2, 1fr);
      }

      .bottom-grid {
        grid-template-columns: 1fr;
      }

      .actions-col {
        flex-direction: column;
      }
      .actions-links {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
    }

    /* ────────────────────────────────────────────
       BREAKPOINT: Mobile  ≤ 640px
    ──────────────────────────────────────────── */
    @media (max-width: 640px) {
      .dashboard-root {
        padding: 16px 14px 100px;
      }

      .dashboard-header {
        margin-bottom: 20px;
      }
      .dashboard-title {
        font-size: 1.2rem;
      }
      .dashboard-subtitle {
        font-size: 11px;
      }
      .live-badge {
        padding: 6px 12px;
        font-size: 12px;
        border-radius: 10px;
      }

      .stats-grid-primary,
      .stats-grid-secondary {
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      .stats-grid-secondary {
        margin-bottom: 20px;
      }

      .stat-card {
        padding: 16px 14px 14px;
        border-radius: 16px;
      }
      .stat-val { font-size: 1.5rem; }
      .stat-lbl { font-size: 9.5px; }
      .stat-hint { font-size: 9px; }
      .stat-chip {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        margin-bottom: 12px;
      }

      .bottom-grid {
        grid-template-columns: 1fr;
        gap: 14px;
      }
      .chart-col { gap: 12px; }

      .conversion-card,
      .chart-card {
        padding: 18px 16px;
      }
      .conversion-header {
        flex-direction: column;
        gap: 6px;
      }
      .conversion-rate {
        font-size: 1.6rem;
      }

      .actions-links {
        grid-template-columns: 1fr;
      }

      .quick-link {
        padding: 14px;
        border-radius: 14px;
      }
    }

    /* ────────────────────────────────────────────
       BREAKPOINT: Very small  ≤ 380px
    ──────────────────────────────────────────── */
    @media (max-width: 380px) {
      .dashboard-root {
        padding: 12px 10px 100px;
      }
      .stats-grid-primary,
      .stats-grid-secondary {
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }
      .stat-card {
        padding: 14px 12px 12px;
      }
      .stat-val { font-size: 1.35rem; }
    }

    /* ────────────────────────────────────────────
       BREAKPOINT: Large screens  ≥ 1440px
    ──────────────────────────────────────────── */
    @media (min-width: 1440px) {
      .dashboard-root {
        padding: 40px 48px;
      }
      .stats-grid-primary,
      .stats-grid-secondary {
        gap: 16px;
      }
      .bottom-grid {
        gap: 24px;
      }
      .stat-val { font-size: 2.25rem; }
    }
  `}</style>
);

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────── */
const StatCard = ({ Icon, label, value, theme, onClick }) => (
  <div
    onClick={onClick}
    className={`stat-card ${theme} ${onClick ? 'clickable' : ''}`}
  >
    <div className={`chip stat-chip`}>
      <Icon size={18} strokeWidth={2.1} />
    </div>
    <p className="stat-val">{value ?? '—'}</p>
    <p className="stat-lbl">{label}</p>
    {onClick && <p className="stat-hint">View details →</p>}
  </div>
);

/* ─────────────────────────────────────────
   QUICK LINK
───────────────────────────────────────── */
const QuickLink = ({ to, Icon, title, desc, iconBg, iconColor }) => (
  <Link
    to={to}
    className="quick-link flex items-center gap-4 bg-white/70 backdrop-blur-sm border border-purple-100 rounded-2xl px-5 py-4 hover:bg-white"
    style={{ textDecoration: 'none' }}
  >
    <div
      style={{
        width: 40, height: 40, borderRadius: 12,
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={17} color={iconColor} strokeWidth={2.1} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>{title}</p>
      <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>{desc}</p>
    </div>
    <ChevronRight size={15} className="arrow-icon" style={{ color: '#c4b5fd', flexShrink: 0 }} />
  </Link>
);

/* ─────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats]         = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [sRes, cRes] = await Promise.all([
          API.get('/admin/stats'),
          API.get('/admin/overall-stats'),
        ]);
        setStats(sRes.data);
        setChartData(cRes.data.dailyData);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <>
      <FontStyle />
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '8rem 0', color: '#c4b5fd', fontSize: 14,
      }}>
        Loading dashboard…
      </div>
    </>
  );

  const convRate = stats?.conversionRate ?? 0;

  return (
    <>
      <FontStyle />
      <div className="dashboard-root">

        {/* ── Header ── */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <p className="dashboard-subtitle">CRM overview · Live data</p>
          </div>
          <div className="live-badge">
            <Wifi size={12} style={{ color: '#34d399' }} />
            Live
          </div>
        </div>

        {/* ── Primary Stats ── */}
        <span className="section-label">Lead Overview</span>
        <div className="stats-grid-primary">
          <StatCard Icon={Users}     label="Total Leads"  value={stats?.totalLeads}     theme="c-lavender" onClick={() => navigate('/admin/leads')} />
          <StatCard Icon={UserCheck} label="Total Agents" value={stats?.totalAgents}    theme="c-sky"      onClick={() => navigate('/admin/agents')} />
          <StatCard Icon={Sparkles}  label="Converted"    value={stats?.convertedLeads} theme="c-mint"     onClick={() => navigate('/admin/leads?status=Converted')} />
          <StatCard Icon={PhoneCall} label="Total Calls"  value={stats?.totalCalls}     theme="c-peach" />
        </div>

        {/* ── Secondary Stats ── */}
        <div className="stats-grid-secondary">
          <StatCard Icon={PhoneIncoming} label="New Leads"     value={stats?.newLeads}      theme="c-rose"   onClick={() => navigate('/admin/leads?status=New')} />
          <StatCard Icon={Bell}          label="Follow-Ups"    value={stats?.followUpLeads} theme="c-amber"  onClick={() => navigate('/admin/leads?status=Follow-Up')} />
          <StatCard Icon={XCircle}       label="Lost"          value={stats?.lostLeads}     theme="c-lilac"  onClick={() => navigate('/admin/leads?status=Lost')} />
          <StatCard Icon={CalendarCheck} label="Today's Calls" value={stats?.todayCalls}    theme="c-teal" />
        </div>

        {/* ── Bottom: Chart + Quick Actions ── */}
        <div className="bottom-grid">

          {/* Left — Chart area */}
          <div className="chart-col">

            {/* Conversion Rate */}
            <div className="conversion-card">
              <div className="conversion-header">
                <div>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontWeight: 600,
                    fontSize: '0.95rem', color: '#111827', margin: 0,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <TrendingUp size={15} style={{ color: '#7c3aed' }} />
                    Overall Conversion Rate
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#9ca3af', marginTop: 3, margin: '3px 0 0' }}>
                    Converted ÷ Total leads
                  </p>
                </div>
                <span className="conversion-rate">{convRate}%</span>
              </div>

              <div style={{ height: 10, background: '#ede9fe', borderRadius: 9999, overflow: 'hidden', border: '1px solid #ddd6fe' }}>
                <div className="progress-fill" style={{ height: '100%', width: `${convRate}%` }} />
              </div>

              <div className="legend-row">
                {[
                  { color: '#7c3aed', label: 'Total',     val: stats?.totalLeads },
                  { color: '#059669', label: 'Converted', val: stats?.convertedLeads },
                  { color: '#e11d48', label: 'Lost',      val: stats?.lostLeads },
                ].map(({ color, label, val }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#9ca3af' }}>{label}</span>
                    <span style={{ fontFamily: 'var(--font-title)', fontSize: 12, fontWeight: 600, color: '#374151' }}>{val ?? '—'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="chart-card">
              <p style={{
                fontFamily: 'var(--font-body)', fontWeight: 600,
                fontSize: '0.95rem', color: '#111827', marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <BarChart2 size={15} style={{ color: '#7c3aed' }} />
                Conversion Trend
              </p>
              <ConversionChart data={chartData} />
            </div>
          </div>

          {/* Right — Quick Actions */}
          <div className="actions-col">
            <span className="section-label">Quick Actions</span>
            <div className="actions-links">
              {[
                { to: '/admin/agents',      Icon: UserCog,       title: 'Manage Agents',  desc: 'Add or deactivate agents',     iconBg: '#ede9fe', iconColor: '#7c3aed' },
                { to: '/admin/leads',       Icon: ClipboardList, title: 'Manage Leads',   desc: 'Add, assign, or delete leads', iconBg: '#dbeafe', iconColor: '#2563eb' },
                { to: '/admin/reports',     Icon: BarChart2,     title: 'Reports',        desc: 'View agent performance',       iconBg: '#d1fae5', iconColor: '#059669' },
                { to: '/admin/bulk-upload', Icon: Upload,        title: 'Bulk Upload',    desc: 'Upload 1000+ leads at once',   iconBg: '#ffedd5', iconColor: '#ea580c' },
              ].map((item) => <QuickLink key={item.to} {...item} />)}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}