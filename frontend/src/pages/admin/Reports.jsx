import { useState, useEffect } from 'react';
import API from '../../api/axios';
import ConversionChart from '../../components/ConversionCharts';

export default function Reports() {
  const [reports, setReports]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentChart, setAgentChart]     = useState([]);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/admin/reports');
        setReports(res.data.reports);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // ── Agent Card Click → Chart fetch karo ───────────────
  const handleAgentClick = async (agent) => {
    // Toggle — same agent click karo toh band ho
    if (selectedAgent?.agentId === agent.agentId) {
      setSelectedAgent(null);
      setAgentChart([]);
      return;
    }

    try {
      setSelectedAgent(agent);
      setChartLoading(true);
      const res = await API.get(`/admin/agent-stats/${agent.agentId}`);
      setAgentChart(res.data.dailyData);
    } catch (err) {
      console.error(err);
    } finally {
      setChartLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📊 Agent Reports</h1>
        <p className="text-gray-500 text-sm mt-1">
          Kisi agent pe click karo — uska chart dekhne ke liye
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">⏳ Loading...</div>
      ) : (
        <div className="space-y-4">
          {reports.map((r, index) => (
            <div key={r.agentId}>
              {/* ── Agent Card — Clickable ── */}
              <div
                onClick={() => handleAgentClick(r)}
                className={`bg-white rounded-xl border p-5 cursor-pointer transition-all ${
                  selectedAgent?.agentId === r.agentId
                    ? 'border-blue-400 shadow-md'
                    : 'border-gray-200 hover:shadow-md hover:border-blue-200'
                }`}
              >
                {/* Agent Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400'   :
                      index === 2 ? 'bg-orange-400'  : 'bg-blue-500'
                    }`}>
                      {index === 0 ? '🥇' :
                       index === 1 ? '🥈' :
                       index === 2 ? '🥉' :
                       r.agentName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{r.agentName}</p>
                      <p className="text-xs text-gray-500">{r.agentEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        {r.conversionRate}%
                      </p>
                      <p className="text-xs text-gray-500">Conversion Rate</p>
                    </div>
                    {/* Toggle icon */}
                    <span className="text-gray-400 text-lg">
                      {selectedAgent?.agentId === r.agentId ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                  {[
                    { label: 'Total Leads', value: r.totalLeads,     color: 'text-gray-800'   },
                    { label: 'Converted',   value: r.convertedLeads, color: 'text-green-600'  },
                    { label: 'Lost',        value: r.lostLeads,      color: 'text-red-500'    },
                    { label: 'Total Calls', value: r.totalCalls,     color: 'text-blue-600'   },
                    { label: 'Aaj Calls',   value: r.todayCalls,     color: 'text-purple-600' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Conversion Progress</span>
                    <span>{r.convertedLeads}/{r.totalLeads}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${r.conversionRate}%` }}
                    />
                  </div>
                </div>

                {/* Click hint */}
                <p className="text-xs text-blue-500 mt-3 text-center">
                  {selectedAgent?.agentId === r.agentId
                    ? '▲ Chart band karo'
                    : '▼ Chart dekhne ke liye click karo'}
                </p>
              </div>

              {/* ── Agent Chart — Expandable ── */}
             {selectedAgent?.agentId === r.agentId && (
  <div className="mt-2 ml-4">
    {chartLoading ? (
      <div className="bg-white rounded-xl border border-blue-200 p-8 text-center text-gray-400">
        ⏳ Chart load ho raha hai...
      </div>
    ) : (
      <div>
        {/* ← Agent name chart ke upar dikhao */}
        <div className="bg-blue-50 border border-blue-200 rounded-t-xl px-4 py-2 flex items-center gap-2">
          <span className="text-blue-600 text-sm font-semibold">
            📊 {r.agentName} ka Performance Chart
          </span>
          <span className="text-xs text-blue-400">
            — Last 14 days
          </span>
        </div>
        <ConversionChart data={agentChart} />
      </div>
    )}
  </div>
)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}