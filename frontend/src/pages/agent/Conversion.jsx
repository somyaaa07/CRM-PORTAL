import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Pagination from '../../components/Pagination';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import ConversionChart from '../../components/ConversionCharts';
const DEAL_STATUS = {
  'Converted': {
    label: 'Deal Done ✅',
    bg: 'bg-green-50',
    border: 'border-green-400',
    badge: 'bg-green-100 text-green-700',
    dot: 'bg-green-500',
  },
  'Lost': {
    label: 'Deal Lost ❌',
    bg: 'bg-red-50',
    border: 'border-red-400',
    badge: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
  },
  'Not Interested': {
    label: 'Not Interested ❌',
    bg: 'bg-red-50',
    border: 'border-red-300',
    badge: 'bg-red-100 text-red-600',
    dot: 'bg-red-400',
  },
  'Interested': {
    label: 'Interested 🔵',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    badge: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
  },
  'Follow-Up': {
    label: 'Follow-Up 🟡',
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    badge: 'bg-yellow-100 text-yellow-700',
    dot: 'bg-yellow-500',
  },
  'Contacted': {
    label: 'Contacted 🔵',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-50 text-blue-600',
    dot: 'bg-blue-400',
  },
  'New': {
    label: 'New 🆕',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-600',
    dot: 'bg-gray-400',
  },
};

const TABS = [
  { key: 'all',            label: 'All Leads',      icon: '📋' },
  { key: 'Converted',      label: 'Converted',      icon: '✅' },
  { key: 'Lost',           label: 'Lost',           icon: '❌' },
  { key: 'Not Interested', label: 'Not Interested', icon: '🚫' },
  { key: 'Interested',     label: 'Interested',     icon: '🔵' },
  { key: 'Follow-Up',      label: 'Follow-Up',      icon: '🔔' },
];

export default function Conversions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [chartData, setChartData] = useState([]);
  
    const urlStatus = searchParams.get('status');

  const [leads, setLeads]           = useState([]);
  const [loading, setLoading]       = useState(true);
const [activeTab, setActiveTab] = useState(urlStatus || 'all'); 
 const [searchInput, setSearchInput] = useState('');
  const [search, setSearch]         = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // ── Pagination ─────────────────────────────────────────
  const [pagination, setPagination]   = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);


  // ── Global Stats — Poore data se ──────────────────────
  // Yeh pagination se alag hai — saare leads ki counts
  const [stats, setStats] = useState({
    total:      0,
    converted:  0,
    lost:       0,
    inProgress: 0,
    tabCounts:  {},
  });

  // ── Stats Fetch — Ek baar sab counts lo ───────────────
  // Yeh function sirf stats ke liye hai — display ke liye nahi
  // Isliye limit=1000 diya taaki saare leads mil jayein
  const fetchStats = async () => {
    try {
      const res = await API.get('/leads/my-leads?page=1&limit=1000');
      const allLeads = res.data.leads;

      const converted  = allLeads.filter((l) => l.status === 'Converted').length;
      const lost       = allLeads.filter((l) =>
        l.status === 'Lost' || l.status === 'Not Interested'
      ).length;
      const inProgress = allLeads.filter((l) =>
        ['New', 'Contacted', 'Interested', 'Follow-Up'].includes(l.status)
      ).length;

      // Har tab ki count
      const tabCounts = {};
      TABS.forEach((tab) => {
        tabCounts[tab.key] = tab.key === 'all'
          ? allLeads.length
          : allLeads.filter((l) => l.status === tab.key).length;
      });

      setStats({
        total: allLeads.length,
        converted,
        lost,
        inProgress,
        tabCounts,
      });
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  // ── Paginated Leads Fetch ──────────────────────────────
  const fetchLeads = async (
    page      = 1,
    searchVal = search,
    filterVal = activeTab,
  ) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page,
        limit,
        ...(filterVal !== 'all' && filterVal !== 'All' && { status: filterVal }),
        ...(searchVal && { search: searchVal }),
      });

      const res = await API.get(`/leads/my-leads?${params}`);
      setLeads(res.data.leads);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── First Load ─────────────────────────────────────────
  useEffect(() => {
    fetchStats();
    fetchLeads(1);
  }, []);

  // ── Tab Change ─────────────────────────────────────────
  useEffect(() => {
    setCurrentPage(1);
    fetchLeads(1, search, activeTab);
  }, [activeTab]);

  // ── Search Debounce ────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
      fetchLeads(1, searchInput, activeTab);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ── Page Change ────────────────────────────────────────
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchLeads(page, search, activeTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Quick Status Update ────────────────────────────────
  const updateStatus = async (leadId, status) => {
    try {
      setUpdatingId(leadId);
      await API.put(`/leads/${leadId}/status`, { status });

      // Local state update — turant dikhao
      setLeads((prev) =>
        prev.map((l) => l.id === leadId ? { ...l, status } : l)
      );

      // Stats bhi refresh karo
      fetchStats();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

    useEffect(() => {
    if (urlStatus) {
      setActiveTab(urlStatus);
    }
  }, [urlStatus]);
  

  // ── Conversion Rate ────────────────────────────────────
  const conversionRate = stats.total
    ? Math.round((stats.converted / stats.total) * 100)
    : 0;

    // ── Chart Data Fetch ───────────────────────────────────
const fetchChartData = async () => {
  try {
    const res = await API.get('/admin/my-stats');
    setChartData(res.data.dailyData);
  } catch (err) {
    console.error('Chart data error:', err);
  }
};

// First load mein:
useEffect(() => {
  fetchStats();
  fetchLeads(1);
  fetchChartData(); // ← Add karo
}, []);
  return (
    <div className="p-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📊 Conversion Tracker</h1>
        <p className="text-gray-500 text-sm mt-1">Apne deals ka status track karo</p>
      </div>

      {/* Stats Cards — Poore data se ✅ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">Total Leads</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <p className="text-3xl font-bold text-green-600">{stats.converted}</p>
          <p className="text-xs text-green-600 mt-1">✅ Converted</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <p className="text-3xl font-bold text-red-500">{stats.lost}</p>
          <p className="text-xs text-red-500 mt-1">❌ Lost / Not Interested</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-3xl font-bold text-blue-600">{conversionRate}%</p>
          <p className="text-xs text-blue-500 mt-1">🎯 Conversion Rate</p>
        </div>
      </div>

      {/* Progress Bar — Poore data se ✅ */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Deal Pipeline</span>
          <span>{stats.total} total leads</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
          {stats.converted > 0 && (
            <div
              className="bg-green-500 transition-all"
              style={{ width: `${(stats.converted / stats.total) * 100}%` }}
              title={`Converted: ${stats.converted}`}
            />
          )}
          {stats.inProgress > 0 && (
            <div
              className="bg-blue-400 transition-all"
              style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
              title={`In Progress: ${stats.inProgress}`}
            />
          )}
          {stats.lost > 0 && (
            <div
              className="bg-red-400 transition-all"
              style={{ width: `${(stats.lost / stats.total) * 100}%` }}
              title={`Lost: ${stats.lost}`}
            />
          )}
        </div>
        <div className="flex gap-4 mt-2">
          {[
            { color: 'bg-green-500', label: `Converted (${stats.converted})` },
            { color: 'bg-blue-400',  label: `In Progress (${stats.inProgress})` },
            { color: 'bg-red-400',   label: `Lost (${stats.lost})` },
          ].map((item) => (
            <span key={item.label} className="text-xs flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${item.color} inline-block`} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
      <div className="mb-6">
  <ConversionChart data={chartData} />
</div>

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Name ya phone search karo..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Tabs — Sahi counts ✅ */}
      <div className="flex gap-2 flex-wrap mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition flex items-center gap-1 ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.icon} {tab.label}
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
              activeTab === tab.key
                ? 'bg-white/20 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {stats.tabCounts[tab.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">⏳ Loading...</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-2">📭</div>
          <p>Is category mein koi lead nahi</p>
          {(searchInput || activeTab !== 'all') && (
            <button
              onClick={() => {
                setSearchInput('');
                setSearch('');
                setActiveTab('all');
              }}
              className="mt-3 text-blue-600 text-sm underline"
            >
              Filters clear karo
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {leads.map((lead) => {
              const style = DEAL_STATUS[lead.status] || DEAL_STATUS['New'];
              return (
                <div
                  key={lead.id}
                  className={`rounded-xl border-2 p-4 ${style.bg} ${style.border} transition`}
                     onClick={() => navigate(`/leads/${lead.id}`)}
                >
                  <div className="flex items-start justify-between gap-3">

                    {/* Left: Lead Info */}
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${style.dot}`} />
                      <div>
                        {/* Name — Clickable → Lead Detail */}
                        <p
                          className="font-semibold text-blue-600 hover:underline cursor-pointer"
                       
                        >
                          {lead.name}
                        </p>
                        <p className="text-sm text-gray-500">📱 {lead.phone}</p>
                        {lead.email && (
                          <p className="text-xs text-gray-400">✉️ {lead.email}</p>
                        )}
                        {lead.notes && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            📝 {lead.notes}
                          </p>
                        )}
                        {lead.followUpDate && (
                          <p className="text-xs text-purple-600 mt-1">
                            📅 {new Date(lead.followUpDate).toLocaleString('en-IN', {
                              day: '2-digit', month: 'short',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Status Badge + Quick Update */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${style.badge}`}>
                        {style.label}
                      </span>
                      <select
                        value={lead.status}
                        disabled={updatingId === lead.id}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Interested">Interested</option>
                        <option value="Not Interested">Not Interested</option>
                        <option value="Follow-Up">Follow-Up</option>
                        <option value="Converted">Converted ✅</option>
                        <option value="Lost">Lost ❌</option>
                      </select>
                      {updatingId === lead.id && (
                        <span className="text-xs text-gray-400">Saving...</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Progress Bar */}


{/* ── Chart ── */}


          {/* Pagination */}
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}