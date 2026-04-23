import { useState, useEffect } from "react";
import {
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaBullseye,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import {
  FiList,
  FiCheckCircle,
  FiXCircle,
  FiSlash,
  FiCircle,
  FiBell,
  FiInbox,
  FiBarChart2,
  FiPhone,
  FiMail,
  FiFileText,
  FiCalendar,
  FiChevronRight,
} from "react-icons/fi";
import { User } from "lucide-react";

// import {
//   FiPhone,
//   FiMail,
//   FiFileText,
//   FiCalendar,
//   FiChevronRight,
// } from "react-icons/fi";

// import { FaSearch, FaTimes } from "react-icons/fa";

import API from "../../api/axios";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import ConversionChart from "../../components/ConversionCharts";
const DEAL_STATUS = {
  Converted: {
    label: "Deal Done ",
    bg: "bg-green-50",
    border: "border-green-400",
    badge: "bg-green-100 text-green-700",
    dot: "bg-green-500",
  },
  Lost: {
    label: "Deal Lost ",
    bg: "bg-red-50",
    border: "border-red-400",
    badge: "bg-red-100 text-red-700",
    dot: "bg-red-500",
  },
  "Not Interested": {
    label: "Not Interested ",
    bg: "bg-red-50",
    border: "border-red-300",
    badge: "bg-red-100 text-red-600",
    dot: "bg-red-400",
  },
  Interested: {
    label: "Interested ",
    bg: "bg-blue-50",
    border: "border-blue-300",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  "Follow-Up": {
    label: "Follow-Up ",
    bg: "bg-yellow-50",
    border: "border-yellow-300",
    badge: "bg-yellow-100 text-yellow-700",
    dot: "bg-yellow-500",
  },
  Contacted: {
    label: "Contacted ",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-50 text-blue-600",
    dot: "bg-blue-400",
  },
  New: {
    label: "New ",
    bg: "bg-gray-50",
    border: "border-gray-200",
    badge: "bg-gray-100 text-gray-600",
    dot: "bg-gray-400",
  },
};

const TABS = [
  { key: "all", label: "All Leads", icon: FiList },
  { key: "Converted", label: "Converted", icon: FiCheckCircle },
  { key: "Lost", label: "Lost", icon: FiXCircle },
  { key: "Not Interested", label: "Not Interested", icon: FiSlash },
  { key: "Interested", label: "Interested", icon: FiCircle },
  { key: "Follow-Up", label: "Follow-Up", icon: FiBell },
];

export default function Conversions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [chartData, setChartData] = useState([]);

  const urlStatus = searchParams.get("status");

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(urlStatus || "all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // ── Pagination ─────────────────────────────────────────
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  // ── Global Stats — Poore data se ──────────────────────
  // Yeh pagination se alag hai — saare leads ki counts
  const [stats, setStats] = useState({
    total: 0,
    converted: 0,
    lost: 0,
    inProgress: 0,
    tabCounts: {},
  });

  // ── Stats Fetch — Ek baar sab counts lo ───────────────
  // Yeh function sirf stats ke liye hai — display ke liye nahi
  // Isliye limit=1000 diya taaki saare leads mil jayein
  const fetchStats = async () => {
    try {
      const res = await API.get("/leads/my-leads?page=1&limit=1000");
      const allLeads = res.data.leads;

      const converted = allLeads.filter((l) => l.status === "Converted").length;
      const lost = allLeads.filter(
        (l) => l.status === "Lost" || l.status === "Not Interested",
      ).length;
      const inProgress = allLeads.filter((l) =>
        ["New", "Contacted", "Interested", "Follow-Up"].includes(l.status),
      ).length;

      // Har tab ki count
      const tabCounts = {};
      TABS.forEach((tab) => {
        tabCounts[tab.key] =
          tab.key === "all"
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
      console.error("Stats fetch error:", err);
    }
  };

  // ── Paginated Leads Fetch ──────────────────────────────
  const fetchLeads = async (
    page = 1,
    searchVal = search,
    filterVal = activeTab,
  ) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page,
        limit,
        ...(filterVal !== "all" &&
          filterVal !== "All" && { status: filterVal }),
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Quick Status Update ────────────────────────────────
  const updateStatus = async (leadId, status) => {
    try {
      setUpdatingId(leadId);
      await API.put(`/leads/${leadId}/status`, { status });

      // Local state update — turant dikhao
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status } : l)),
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
      const res = await API.get("/admin/my-stats");
      setChartData(res.data.dailyData);
    } catch (err) {
      console.error("Chart data error:", err);
    }
  };

  // First load mein:
  useEffect(() => {
    fetchStats();
    fetchLeads(1);
    fetchChartData();
  }, []);
  return (
    <div className="p-6">
      {/* Header */}
      {/* <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          📊 Conversion Tracker
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Apne deals ka status track karo
        </p>
      </div> */}
      <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex items-start sm:items-center gap-3">
          {/* Icon */}
          <div className="p-2 sm:p-3 bg-blue-50 rounded-lg text-blue-600">
            <FiBarChart2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          {/* Text */}
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
              Conversion Tracker
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Track the status of your deals
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards — Poore data se  */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {/* Total Leads */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Leads</p>
              <p className="text-3xl font-semibold text-[#7c4dff] mt-1">
                {stats.total}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FaUsers className="text-[#7c4dff] text-base lg:text-lg md:text-base" />
            </div>
          </div>
        </div>

        {/* Converted */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Converted</p>
              <p className="text-3xl font-semibold text-green-600 mt-1">
                {stats.converted}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaCheckCircle className="text-green-600 text-lg" />
            </div>
          </div>
        </div>

        {/* Lost */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Lost / Not Interested</p>
              <p className="text-3xl font-semibold text-red-500 mt-1">
                {stats.lost}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <FaTimesCircle className="text-red-500 text-lg" />
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Conversion Rate</p>
              <p className="text-3xl font-semibold text-blue-600 mt-1">
                {conversionRate}%
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaBullseye className="text-blue-600 text-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar — Poore data se  */}
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
            { color: "bg-green-500", label: `Converted (${stats.converted})` },
            {
              color: "bg-blue-400",
              label: `In Progress (${stats.inProgress})`,
            },
            { color: "bg-red-400", label: `Lost (${stats.lost})` },
          ].map((item) => (
            <span key={item.label} className="text-xs flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${item.color} inline-block`}
              />
              {item.label}
            </span>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <ConversionChart data={chartData} />
      </div>

     

      <div className="relative w-full mb-5">
        {/* Search Icon */}
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />

        {/* Input */}
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full pl-10 pr-10 py-3 text-sm rounded-xl bg-gray-50 border border-gray-200 
               focus:bg-white focus:border-[#7c4dff] focus:ring-2 focus:ring-blue-100 
               outline-none transition-all duration-200 shadow-sm"
        />

        {/* Clear Button */}
        {searchInput && (
          <button
            onClick={() => setSearchInput("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        )}
      </div>

    

      <div className="w-full overflow-x-auto">
        <div className="flex gap-2 sm:gap-3 mb-4 min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium transition-all duration-200 border ${
                  activeTab === tab.key
                    ? "bg-[#E9E2FF] text-[#7c4dff] border-[#d6ccff] shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <Icon className="text-sm sm:text-base" />

                <span>{tab.label}</span>

                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
                    activeTab === tab.key
                      ? "bg-white text-[#7c4dff]"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {stats.tabCounts[tab.key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400"> Loading...</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-16 text-gray-400">

          <div className="flex flex-col items-center justify-center py-3 text-center text-gray-500">
            <FiInbox className="text-4xl mb-2 text-gray-400" />
            <p className="text-sm sm:text-base font-medium">
              No leads found in this category
            </p>
          </div>
          {(searchInput || activeTab !== "all") && (
            <button
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setActiveTab("all");
              }}
              className=" text-[#7c4dff] text-base underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {leads.map((lead) => {
              const style = DEAL_STATUS[lead.status] || DEAL_STATUS["New"];

              return (
                <div
                  key={lead.id}
                  className={`rounded-2xl border p-4 sm:p-5 ${style.bg} ${style.border} shadow-sm hover:shadow-md transition`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    {/* LEFT SECTION */}
                    <div className="flex gap-3 flex-1">
                      {/* USER ICON (DYNAMIC COLOR) */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center ${style.dot}`}
                      >
                        <User className="w-5 h-5 text-white" />
                      </div>

                      <div className="space-y-1 w-full">
                        {/* NAME */}
                        <div
                          onClick={() => navigate(`/leads/${lead.id}`)}
                          className="flex items-center gap-1 font-semibold text-gray-900 cursor-pointer text-sm sm:text-lg"
                        >
                          {lead.name}
                          <FiChevronRight className="text-sm opacity-60" />
                        </div>

                        {/* PHONE */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiPhone className="text-gray-400" />
                          {lead.phone}
                        </div>

                        {/* EMAIL */}
                        {lead.email && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <FiMail className="text-gray-400" />
                            {lead.email}
                          </div>
                        )}

                        {/* NOTES */}
                        {lead.notes && (
                          <div className="flex items-start gap-2 text-xs text-gray-500">
                            <FiFileText className="mt-0.5 text-gray-400" />
                            <p className="line-clamp-1">{lead.notes}</p>
                          </div>
                        )}

                        {/* FOLLOW-UP */}
                        {lead.followUpDate && (
                          <div className="flex items-center gap-2 text-xs text-purple-600">
                            <FiCalendar className="text-purple-500" />
                            {new Date(lead.followUpDate).toLocaleString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT SECTION */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-3">
                      {/* STATUS BADGE */}
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${style.badge}`}
                      >
                        {style.label}
                      </span>

                      {/* STATUS SELECT */}
                      <select
                        value={lead.status}
                        disabled={updatingId === lead.id}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className="text-xs sm:text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Interested">Interested</option>
                        <option value="Not Interested">Not Interested</option>
                        <option value="Follow-Up">Follow-Up</option>
                        <option value="Converted">Converted</option>
                        <option value="Lost">Lost</option>
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
          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
}
