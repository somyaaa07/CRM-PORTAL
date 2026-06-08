import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Pagination from '../../components/Pagination';

const STATUS_COLORS = {
  'New':           'bg-blue-100 text-blue-700',
  'Contacted':     'bg-yellow-100 text-yellow-700',
  'Interested':    'bg-green-100 text-green-700',
  'Not Interested':'bg-red-100 text-red-700',
  'Follow-Up':     'bg-purple-100 text-purple-700',
  'Converted':     'bg-emerald-100 text-emerald-700',
  'Lost':          'bg-gray-100 text-gray-600',
};

const SOURCE_COLORS = {
  'Meta Ads':     { bg: '#EEF2FF', color: '#4F46E5', border: '#C7D2FE' },
  'Excel Import': { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  'Manual':       { bg: '#F9FAFB', color: '#374151', border: '#E5E7EB' },
  'Website':      { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
  'Referral':     { bg: '#FDF4FF', color: '#9333EA', border: '#E9D5FF' },
};

export default function ManageLeads() {
  const { addToast }   = useToast();
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();

  const urlStatus = searchParams.get('status');
  const urlSource = searchParams.get('source');

  const [leads, setLeads]               = useState([]);
  const [agents, setAgents]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [statusFilter, setStatusFilter] = useState(urlStatus || '');
  const [sourceFilter, setSourceFilter] = useState(urlSource || '');
  const [searchInput, setSearchInput]   = useState('');
  const [search, setSearch]             = useState('');
  const [formLoading, setFormLoading]   = useState(false);

  const [pagination, setPagination]   = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit]             = useState(10);

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    source: 'Manual', priority: 'Medium', assignedTo: '',
  });

  // ── URL params change ──────────────────────────────────
  useEffect(() => {
    if (urlStatus) setStatusFilter(urlStatus);
    if (urlSource) setSourceFilter(urlSource);
  }, [urlStatus, urlSource]);

  // ── Fetch Leads ────────────────────────────────────────
  const fetchLeads = async (
    page      = 1,
    searchVal = search,
    filterVal = statusFilter,
    sourceVal = sourceFilter,
    limitVal  = limit,
  ) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page,
        limit: limitVal,
      });

      if (filterVal && filterVal.trim() !== '') {
        params.append('status', filterVal.trim());
      }
      if (sourceVal && sourceVal.trim() !== '') {
        params.append('source', sourceVal.trim());
      }
      if (searchVal && searchVal.trim() !== '') {
        params.append('search', searchVal.trim());
      }

      const res = await API.get(`/leads?${params}`);
      setLeads(res.data.leads);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await API.get('/admin/agents');
      setAgents(res.data.agents.filter((a) => a.isActive));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAgents();
    fetchLeads(1);
  }, []);

  // Filter change
  useEffect(() => {
    setCurrentPage(1);
    fetchLeads(1, search, statusFilter, sourceFilter);
  }, [statusFilter, sourceFilter]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
      fetchLeads(1, searchInput, statusFilter, sourceFilter);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchLeads(page, search, statusFilter, sourceFilter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddLead = async () => {
    if (!form.name || !form.phone) {
      addToast({ message: '❌ Name aur phone zaroori hain!', type: 'error' });
      return;
    }
    try {
      setFormLoading(true);
      await API.post('/leads', {
        ...form,
        assignedTo: form.assignedTo || null,
      });
      addToast({ message: '✅ Lead add ho gayi!', type: 'success' });
      setForm({
        name: '', phone: '', email: '',
        source: 'Manual', priority: 'Medium', assignedTo: '',
      });
      setShowForm(false);
      fetchLeads(currentPage);
    } catch (err) {
      addToast({ message: '❌ Error aaya!', type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleAssign = async (leadId, agentId) => {
    try {
      await API.put(`/leads/${leadId}/assign`, { agentId });
      addToast({ message: '✅ Lead assign ho gayi!', type: 'success' });
      fetchLeads(currentPage);
    } catch (err) {
      addToast({ message: '❌ Error aaya!', type: 'error' });
    }
  };

  const handleDelete = async (leadId) => {
    if (!window.confirm('Kya aap sure hain? Lead delete ho jayegi!')) return;
    try {
      await API.delete(`/admin/leads/${leadId}`);
      addToast({ message: '✅ Lead delete ho gayi!', type: 'success' });
      if (leads.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchLeads(currentPage);
      }
    } catch (err) {
      addToast({ message: '❌ Error aaya!', type: 'error' });
    }
  };

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            📋 Manage Leads
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Total:{' '}
            <span className="font-medium text-gray-700">
              {pagination?.totalLeads || 0}
            </span>{' '}
            leads
            {sourceFilter === 'Meta Ads' && (
              <span style={{
                marginLeft: 8, fontSize: 11, fontWeight: 600,
                background: '#EEF2FF', color: '#4F46E5',
                padding: '2px 8px', borderRadius: 20,
              }}>
                📱 Meta Ads Filter Active
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition"
        >
          {showForm ? '✕ Cancel' : '+ Add Lead'}
        </button>
      </div>

      {/* Add Lead Form */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">➕ New Lead</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input
              placeholder="Full Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Phone *"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Source"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
            <select
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Assign agent --</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddLead}
            disabled={formLoading}
            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg transition disabled:opacity-50"
          >
            {formLoading ? 'Adding...' : '✅ Add Lead'}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-2">

        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Search name or phone "
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          {['New','Contacted','Interested','Not Interested',
            'Follow-Up','Converted','Lost'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Source Filter */}
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Sources</option>
          <option value="Meta Ads">📱 Meta Ads</option>
          <option value="Excel Import">📊 Excel Import</option>
          <option value="Manual">✋ Manual</option>
          <option value="Website">🌐 Website</option>
          <option value="Referral">👥 Referral</option>
        </select>

        {/* Limit */}
        <select
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setCurrentPage(1);
            fetchLeads(1, search, statusFilter, sourceFilter, Number(e.target.value));
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[10, 25, 50, 100].map((l) => (
            <option key={l} value={l}>{l} per page</option>
          ))}
        </select>
      </div>

      {/* Active Filters Indicators */}
      {(statusFilter || sourceFilter) && (
        <div className="flex gap-2 flex-wrap mb-4 mt-2">
          {statusFilter && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 text-xs text-blue-700">
              <span>⬆️ Status: <strong>{statusFilter}</strong></span>
              <button
                onClick={() => setStatusFilter('')}
                className="text-blue-400 hover:text-blue-700"
              >
                ✕
              </button>
            </div>
          )}
          {sourceFilter && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: SOURCE_COLORS[sourceFilter]?.bg || '#F9FAFB',
              border: `1px solid ${SOURCE_COLORS[sourceFilter]?.border || '#E5E7EB'}`,
              borderRadius: 8, padding: '6px 12px',
              fontSize: 12,
              color: SOURCE_COLORS[sourceFilter]?.color || '#374151',
            }}>
              <span>
                Source: <strong>{sourceFilter}</strong>
              </span>
              <button
                onClick={() => setSourceFilter('')}
                style={{
                  background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 12,
                  color: SOURCE_COLORS[sourceFilter]?.color || '#374151',
                }}
              >
                ✕
              </button>
            </div>
          )}
          <button
            onClick={() => { setStatusFilter(''); setSourceFilter(''); }}
            className="text-xs text-gray-500 underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">
          ⏳ Loading...
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-2">📭</div>
          <p>No leads found</p>
          {(statusFilter || sourceFilter || searchInput) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setSourceFilter('');
                setSearchInput('');
              }}
              className="mt-3 text-blue-600 text-sm underline"
            >
Clear Filter            </button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['#','Name','Phone','Status','Source','Priority','Assigned To','Actions'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead, index) => {
                    const srcColor = SOURCE_COLORS[lead.source];
                    const isMetaLead = lead.source === 'Meta Ads';

                    return (
                      <tr
                        key={lead.id}
                        className={`hover:bg-gray-50 ${
                          isMetaLead ? 'bg-indigo-50/30' : ''
                        }`}
                      >
                        {/* Row Number */}
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {(currentPage - 1) * limit + index + 1}
                        </td>

                        {/* Name */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {isMetaLead && (
                              <span style={{
                                fontSize: 14,
                                flexShrink: 0,
                              }} title="Meta Ads Lead">
                                📱
                              </span>
                            )}
                            <div>
                              <p
                                className="font-medium text-blue-600 hover:underline cursor-pointer"
                                onClick={() => navigate(`/leads/${lead.id}`)}
                              >
                                {lead.name}
                              </p>
                              {lead.email && (
                                <p className="text-xs text-gray-400">
                                  {lead.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-4 py-3 text-gray-600">
                          {lead.phone}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[lead.status]}`}>
                            {lead.status}
                          </span>
                        </td>

                        {/* Source */}
                        <td className="px-4 py-3">
                          <span style={{
                            fontSize: 11, fontWeight: 600,
                            padding: '3px 8px', borderRadius: 20,
                            background: srcColor?.bg    || '#F9FAFB',
                            color:      srcColor?.color || '#374151',
                            border: `1px solid ${srcColor?.border || '#E5E7EB'}`,
                            whiteSpace: 'nowrap',
                          }}>
                            {lead.source === 'Meta Ads'     && '📱 '}
                            {lead.source === 'Excel Import' && '📊 '}
                            {lead.source === 'Manual'       && '✋ '}
                            {lead.source === 'Website'      && '🌐 '}
                            {lead.source === 'Referral'     && '👥 '}
                            {lead.source}
                          </span>
                        </td>

                        {/* Priority */}
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {lead.priority}
                        </td>

                        {/* Assign Agent */}
                        <td className="px-4 py-3">
                          <select
                            value={lead.assignedTo || ''}
                            onChange={(e) => handleAssign(lead.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Unassigned</option>
                            {agents.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition"
                          >
                            🗑 Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

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