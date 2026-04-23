import { useState, useEffect } from 'react';
import API from '../../api/axios';
import LeadCard from '../../components/LeadCard';
import CallModal from '../../components/CallModal';
import Pagination from '../../components/Pagination';

const STATUS_FILTERS = [
  'All',
  'New',
  'Contacted',
  'Follow-Up',
  'Interested',
  'Not Interested',
];

export default function MyLeads() {
  const [leads, setLeads]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchInput, setSearchInput]   = useState('');
  const [search, setSearch]             = useState('');

  const [pagination, setPagination]   = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(12);

  // ── Fetch Leads ────────────────────────────────────────
  const fetchLeads = async (
    page      = 1,
    searchVal = search,
    filterVal = activeFilter,
  ) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page,
        limit,
        ...(filterVal !== 'All' && { status: filterVal }),
        ...(searchVal           && { search: searchVal }),
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

  useEffect(() => {
    fetchLeads(1);
  }, []);

  // ── Filter Change ──────────────────────────────────────
  useEffect(() => {
    setCurrentPage(1);
    fetchLeads(1, search, activeFilter);
  }, [activeFilter]);

  // ── Search Debounce ────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
      fetchLeads(1, searchInput, activeFilter);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ── Page Change ────────────────────────────────────────
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchLeads(page, search, activeFilter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="p-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📋 My Leads</h1>
        <p className="text-gray-500 text-sm mt-1">
          Total:{' '}
          <span className="font-medium text-gray-700">
            {pagination?.totalLeads || 0}
          </span>{' '}
          leads assigned
        </p>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Search from Name or Phone..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Status Filters */}
      <div className="flex gap-2 flex-wrap mb-3">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
              activeFilter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f}
            {activeFilter === f && pagination && (
              <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                {pagination.totalLeads}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sort Indicator */}
      {activeFilter !== 'All' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-4 flex items-center gap-2 text-xs text-blue-700">
          <span>⬆️</span>
          <span>
            <strong>"{activeFilter}"</strong> leads top pe sort ho rahe hain
          </span>
          <button
            onClick={() => setActiveFilter('All')}
            className="ml-auto text-blue-500 hover:text-blue-700 underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* Leads Grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-2">⏳</div>
          <p>Loading leads...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-2">📭</div>
          <p>Koi lead nahi mili</p>
          {(searchInput || activeFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchInput('');
                setSearch('');
                setActiveFilter('All');
              }}
              className="mt-3 text-blue-600 text-sm underline"
            >
              Filters clear karo
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onCallClick={setSelectedLead}
                isHighlighted={
                  activeFilter !== 'All' &&
                  lead.status === activeFilter
                }
              />
            ))}
          </div>

          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Call Modal */}
      {selectedLead && (
        <CallModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onSaved={() => fetchLeads(currentPage, search, activeFilter)}
        />
      )}
    </div>
  );
}