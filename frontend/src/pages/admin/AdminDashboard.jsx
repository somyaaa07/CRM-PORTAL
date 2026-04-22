import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import ConversionChart from '../../components/ConversionCharts';

const StatCard = ({ icon, label, value, bg, text, onClick }) => (
  <div
    onClick={onClick}
    className={`${bg} rounded-xl border p-5 ${
      onClick ? 'cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200' : ''
    }`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className={`text-3xl font-bold ${text}`}>{value}</p>
        <p className={`text-sm mt-1 ${text} opacity-80`}>{label}</p>
      </div>
      <span className="text-2xl">{icon}</span>
    </div>
    {onClick && (
      <p className="text-xs mt-2 text-gray-400">Click to view →</p>
    )}
  </div>
);

export default function AdminDashboard() {
  const navigate        = useNavigate();
  const [stats, setStats]       = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, chartRes] = await Promise.all([
          API.get('/admin/stats'),
          API.get('/admin/overall-stats'),
        ]);
        setStats(statsRes.data);
        setChartData(chartRes.data.dailyData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-400">
      ⏳ Loading...
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🏠 Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">CRM ka overview</p>
      </div>

      {/* ── Clickable Stats Cards ── */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        📊 Lead Summary — Click to view
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon="👥" label="Total Leads"
          value={stats?.totalLeads}
          bg="bg-blue-50 border-blue-200" text="text-blue-700"
          onClick={() => navigate('/admin/leads')}
        />
        <StatCard
          icon="🧑‍💼" label="Total Agents"
          value={stats?.totalAgents}
          bg="bg-purple-50 border-purple-200" text="text-purple-700"
          onClick={() => navigate('/admin/agents')}
        />
        <StatCard
          icon="✅" label="Converted"
          value={stats?.convertedLeads}
          bg="bg-green-50 border-green-200" text="text-green-700"
          onClick={() => navigate('/admin/leads?status=Converted')}
        />
        <StatCard
          icon="📞" label="Total Calls"
          value={stats?.totalCalls}
          bg="bg-orange-50 border-orange-200" text="text-orange-700"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon="🆕" label="New Leads"
          value={stats?.newLeads}
          bg="bg-gray-50 border-gray-200" text="text-gray-700"
          onClick={() => navigate('/admin/leads?status=New')}
        />
        <StatCard
          icon="🔔" label="Follow-Ups"
          value={stats?.followUpLeads}
          bg="bg-yellow-50 border-yellow-200" text="text-yellow-700"
          onClick={() => navigate('/admin/leads?status=Follow-Up')}
        />
        <StatCard
          icon="❌" label="Lost"
          value={stats?.lostLeads}
          bg="bg-red-50 border-red-200" text="text-red-700"
          onClick={() => navigate('/admin/leads?status=Lost')}
        />
        <StatCard
          icon="📅" label="Aaj ke Calls"
          value={stats?.todayCalls}
          bg="bg-teal-50 border-teal-200" text="text-teal-700"
        />
      </div>

      {/* ── Conversion Rate Bar ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex justify-between items-center mb-3">
          <p className="font-semibold text-gray-800">
            🎯 Overall Conversion Rate
          </p>
          <span className="text-2xl font-bold text-green-600">
            {stats?.conversionRate}%
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${stats?.conversionRate}%` }}
          />
        </div>
      </div>

      {/* ── Overall Chart ── */}
      <div className="mb-8">
        <ConversionChart data={chartData} />
      </div>

      {/* ── Quick Links ── */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        🚀 Quick Actions
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/admin/agents',      icon: '🧑‍💼', title: 'Manage Agents', desc: 'Agents add/deactivate karo' },
          { to: '/admin/leads',       icon: '📋', title: 'Manage Leads',  desc: 'Leads add/assign/delete karo' },
          { to: '/admin/reports',     icon: '📊', title: 'Reports',       desc: 'Agent performance dekho' },
          { to: '/admin/bulk-upload', icon: '📤', title: 'Bulk Upload',   desc: '1000+ leads upload karo' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition"
          >
            <div className="text-3xl mb-2">{item.icon}</div>
            <h3 className="font-semibold text-gray-800">{item.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}