import { useState, useEffect } from 'react';
import {
  BarChart2, ChevronDown, ChevronUp, TrendingUp,
  Users, Phone, PhoneCall, CheckCircle2, XCircle,
  Medal, Award, Trophy, Loader2,
} from 'lucide-react';
import API from '../../api/axios';
import ConversionChart from '../../components/ConversionCharts';

const PURPLE = '#7c4dff';
const PURPLE_LIGHT = '#ede7ff';
const PURPLE_MID   = '#c4b5fd';
const BG = '#fefafa';

/* Inject Google Fonts once */
if (typeof document !== 'undefined' && !document.getElementById('rpt-fonts')) {
  const l = document.createElement('link');
  l.id   = 'rpt-fonts';
  l.rel  = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap';
  document.head.appendChild(l);
}

const jost    = { fontFamily: "'Jost', sans-serif" };
const manrope = { fontFamily: "'Manrope', sans-serif" };

const RankIcon = ({ index }) => {
  if (index === 0) return <Trophy size={18} color="#f59e0b" />;
  if (index === 1) return <Medal  size={18} color="#94a3b8" />;
  if (index === 2) return <Award  size={18} color="#fb923c" />;
  return null;
};

const rankStyle = (index) => {
  if (index === 0) return { ring: '2px solid #fcd34d', bg: '#fffbeb', color: '#92400e' };
  if (index === 1) return { ring: '2px solid #cbd5e1', bg: '#f8fafc', color: '#475569' };
  if (index === 2) return { ring: '2px solid #fdba74', bg: '#fff7ed', color: '#9a3412' };
  return { ring: 'none', bg: PURPLE_LIGHT, color: PURPLE };
};

const rankBarStyle = (index) => {
  if (index === 0) return { background: 'linear-gradient(90deg,#fbbf24,#f59e0b)' };
  if (index === 1) return { background: 'linear-gradient(90deg,#cbd5e1,#94a3b8)' };
  if (index === 2) return { background: 'linear-gradient(90deg,#fdba74,#fb923c)' };
  return null;
};

export default function Reports() {
  const [reports, setReports]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentChart, setAgentChart]       = useState([]);
  const [chartLoading, setChartLoading]   = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get('/admin/reports');
        setReports(res.data.reports);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleAgentClick = async (agent) => {
    if (selectedAgent?.agentId === agent.agentId) {
      setSelectedAgent(null); setAgentChart([]); return;
    }
    try {
      setSelectedAgent(agent); setChartLoading(true);
      const res = await API.get(`/admin/agent-stats/${agent.agentId}`);
      setAgentChart(res.data.dailyData);
    } catch (err) { console.error(err); }
    finally { setChartLoading(false); }
  };

  const statCfg = (r) => [
    { label: 'Total Leads',   value: r.totalLeads,     Icon: Users,        color: '#475569', bg: '#f8fafc'    },
    { label: 'Converted',     value: r.convertedLeads, Icon: CheckCircle2, color: '#059669', bg: '#ecfdf5'    },
    { label: 'Lost',          value: r.lostLeads,      Icon: XCircle,      color: '#ef4444', bg: '#fef2f2'    },
    { label: 'Total Calls',   value: r.totalCalls,     Icon: Phone,        color: PURPLE,    bg: PURPLE_LIGHT },
    { label: "Today's Calls", value: r.todayCalls,     Icon: PhoneCall,    color: PURPLE,    bg: '#f5f0ff'    },
  ];

  return (
    <div style={{ ...manrope, minHeight: '100vh', background: BG, padding: 24 }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ background: PURPLE, borderRadius: 12, padding: 10, display: 'flex' }}>
            <BarChart2 size={20} color="#fff" />
          </div>
          <h1 style={{ ...jost, fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Agent Reports
          </h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: 13, margin: 0, paddingLeft: 4 }}>
          Click any agent card to expand their performance chart
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12, color: '#94a3b8' }}>
          <Loader2 size={28} color={PURPLE} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: 13 }}>Loading reports…</span>
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reports.map((r, index) => {
            const isOpen = selectedAgent?.agentId === r.agentId;
            const rs     = rankStyle(index);
            const barSt  = rankBarStyle(index);

            return (
              <div key={r.agentId}>
                {/* Agent Card */}
                <div
                  onClick={() => handleAgentClick(r)}
                  style={{
                    background: '#fff',
                    borderRadius: 20,
                    border: `1px solid ${isOpen ? PURPLE_MID : '#e2e8f0'}`,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    boxShadow: isOpen ? `0 8px 30px ${PURPLE}18` : '0 1px 4px rgba(0,0,0,0.04)',
                    transition: 'border-color .2s, box-shadow .2s',
                  }}
                >
                  {/* Top rank stripe */}
                  {barSt && <div style={{ height: 3, ...barSt }} />}

                  <div style={{ padding: 20 }}>
                    {/* Top Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Avatar */}
                        <div style={{
                          position: 'relative', width: 44, height: 44, borderRadius: 12,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 14,
                          background: rs.bg, color: rs.color,
                          outline: rs.ring !== 'none' ? rs.ring : undefined,
                          outlineOffset: 1,
                        }}>
                          {index < 3
                            ? <RankIcon index={index} />
                            : <span style={jost}>{r.agentName.charAt(0).toUpperCase()}</span>
                          }
                          <span style={{
                            position: 'absolute', bottom: -6, right: -6,
                            background: PURPLE, color: '#fff',
                            fontSize: 10, fontWeight: 700, borderRadius: '50%',
                            width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {index + 1}
                          </span>
                        </div>

                        <div>
                          <p style={{ ...manrope, fontWeight: 600, color: '#1e293b', fontSize: 14, margin: 0 }}>{r.agentName}</p>
                          <p style={{ color: '#94a3b8', fontSize: 12, margin: '3px 0 0' }}>{r.agentEmail}</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                            <TrendingUp size={13} color="#059669" />
                            <span style={{ ...jost, fontSize: 24, fontWeight: 700, color: '#059669', lineHeight: 1 }}>
                              {r.conversionRate}%
                            </span>
                          </div>
                          <p style={{ color: '#94a3b8', fontSize: 11, margin: '3px 0 0' }}>Conversion Rate</p>
                        </div>

                        {/* Toggle */}
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: isOpen ? PURPLE_LIGHT : '#f1f5f9',
                          transition: 'background .2s',
                        }}>
                          {isOpen
                            ? <ChevronUp   size={16} color={PURPLE} />
                            : <ChevronDown size={16} color="#94a3b8" />
                          }
                        </div>
                      </div>
                    </div>

                    {/* Stat Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(100px,1fr))', gap: 10, marginBottom: 16 }}>
                      {statCfg(r).map(({ label, value, Icon, color, bg }) => (
                        <div key={label} style={{
                          background: bg, borderRadius: 12, padding: '10px 8px',
                          textAlign: 'center', border: '1px solid transparent',
                          transition: 'background .15s, border-color .15s',
                        }}>
                          <Icon size={13} color={color} style={{ margin: '0 auto 6px' }} />
                          <p style={{ ...jost, fontSize: 18, fontWeight: 700, color, margin: 0, lineHeight: 1 }}>{value}</p>
                          <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0', lineHeight: 1.3 }}>{label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Progress */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Conversion Progress</span>
                        <span style={{ ...jost, fontSize: 12, fontWeight: 600, color: '#475569' }}>
                          {r.convertedLeads} / {r.totalLeads} leads
                        </span>
                      </div>
                      <div style={{ height: 6, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 99,
                          width: `${r.conversionRate}%`,
                          transition: 'width .7s ease',
                          background:
                            r.conversionRate >= 70 ? `linear-gradient(90deg,${PURPLE},#651fff)`
                          : r.conversionRate >= 40 ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                          :                          'linear-gradient(90deg,#ef4444,#dc2626)',
                        }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart Panel */}
                {isOpen && (
                  <div style={{ marginLeft: 8, marginRight: 8, marginTop: 4 }}>
                    {chartLoading ? (
                      <div style={{
                        background: '#fff', border: `1px solid ${PURPLE_MID}`, borderRadius: 20,
                        padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#94a3b8',
                      }}>
                        <Loader2 size={18} color={PURPLE} style={{ animation: 'spin 1s linear infinite' }} />
                        <span style={{ fontSize: 13 }}>Loading chart…</span>
                      </div>
                    ) : (
                      <div style={{ background: '#fff', border: `1px solid ${PURPLE_MID}`, borderRadius: 20, overflow: 'hidden', boxShadow: `0 4px 16px ${PURPLE}0d` }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 20px', background: '#f5f0ff', borderBottom: `1px solid ${PURPLE_LIGHT}`,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BarChart2 size={14} color={PURPLE} />
                            <span style={{ ...jost, fontSize: 14, fontWeight: 600, color: '#5b21b6' }}>
                              {r.agentName}'s Performance
                            </span>
                          </div>
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                            background: PURPLE_LIGHT, color: PURPLE,
                          }}>
                            Last 14 days
                          </span>
                        </div>
                        <div style={{ padding: 8 }}>
                          <ConversionChart data={agentChart} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}