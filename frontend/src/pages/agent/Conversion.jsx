import { useState, useEffect } from "react";
import {
  FaUsers, FaCheckCircle, FaTimesCircle, FaBullseye,
} from "react-icons/fa";
import {
  FiList, FiCheckCircle, FiXCircle, FiSlash, FiCircle,
  FiBell, FiInbox, FiBarChart2, FiPhone, FiMail,
  FiFileText, FiCalendar, FiChevronRight, FiSearch, FiX,
} from "react-icons/fi";
import { User } from "lucide-react";
import API from "../../api/axios";
import Pagination from "../../components/Pagination";
import { useNavigate, useSearchParams } from "react-router-dom";
import ConversionChart from "../../components/ConversionCharts";

// ── Constants ─────────────────────────────────────────────────────────────────
const DEAL_STATUS = {
  Converted:        { label: "Deal Done",       bg: "#F0FDF4", border: "#86EFAC", badge: "#DCFCE7", badgeText: "#15803D", dot: "#22C55E", accent: "#16A34A" },
  Lost:             { label: "Deal Lost",        bg: "#FFF5F5", border: "#FCA5A5", badge: "#FEE2E2", badgeText: "#DC2626", dot: "#EF4444", accent: "#DC2626" },
  "Not Interested": { label: "Not Interested",  bg: "#FFF5F5", border: "#FDBA74", badge: "#FEE2E2", badgeText: "#EA580C", dot: "#F97316", accent: "#EA580C" },
  Interested:       { label: "Interested",       bg: "#EFF6FF", border: "#93C5FD", badge: "#DBEAFE", badgeText: "#1D4ED8", dot: "#3B82F6", accent: "#2563EB" },
  "Follow-Up":      { label: "Follow-Up",        bg: "#FEFCE8", border: "#FDE047", badge: "#FEF9C3", badgeText: "#A16207", dot: "#EAB308", accent: "#CA8A04" },
  Contacted:        { label: "Contacted",        bg: "#F0F9FF", border: "#7DD3FC", badge: "#E0F2FE", badgeText: "#0369A1", dot: "#0EA5E9", accent: "#0284C7" },
  New:              { label: "New",              bg: "#F8FAFC", border: "#CBD5E1", badge: "#F1F5F9", badgeText: "#475569", dot: "#94A3B8", accent: "#64748B" },
};

const TABS = [
  { key: "all",           label: "All",           icon: FiList        },
  { key: "Converted",     label: "Converted",     icon: FiCheckCircle },
  { key: "Lost",          label: "Lost",          icon: FiXCircle     },
  { key: "Not Interested",label: "Not Interested",icon: FiSlash       },
  { key: "Interested",    label: "Interested",    icon: FiCircle      },
  { key: "Follow-Up",     label: "Follow-Up",     icon: FiBell        },
];

const TAB_ACCENT = {
  all:              { active: "#6366F1", bg: "#EEF2FF", text: "#4338CA" },
  Converted:        { active: "#22C55E", bg: "#F0FDF4", text: "#15803D" },
  Lost:             { active: "#EF4444", bg: "#FFF5F5", text: "#DC2626" },
  "Not Interested": { active: "#F97316", bg: "#FFF7ED", text: "#C2410C" },
  Interested:       { active: "#3B82F6", bg: "#EFF6FF", text: "#1D4ED8" },
  "Follow-Up":      { active: "#EAB308", bg: "#FEFCE8", text: "#A16207" },
};

// ── Avatar helpers ─────────────────────────────────────────────────────────────
const AVATAR_PALETTE = ["#6366F1","#22C55E","#F97316","#EAB308","#3B82F6","#EC4899","#14B8A6"];
function initials(name = "") { return name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase(); }
function avatarColor(name = "") {
  return AVATAR_PALETTE[name.split("").reduce((a,c)=>a+c.charCodeAt(0),0) % AVATAR_PALETTE.length];
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 18, border: "1px solid #E8ECF4",
      padding: "20px 22px", display: "flex", alignItems: "center", justifyContent: "space-between",
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)", transition: "box-shadow .2s, transform .2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "none"; }}
    >
      <div>
        <p style={{ margin:0, fontSize:12, color:"#94A3B8", fontFamily:"'Jost',sans-serif", fontWeight:500, letterSpacing:".5px", textTransform:"uppercase" }}>{label}</p>
        <p style={{ margin:"6px 0 0", fontSize:32, fontWeight:700, color:"#1E293B", fontFamily:"'Manrope',sans-serif", lineHeight:1 }}>{value}</p>
      </div>
      <div style={{ width:48, height:48, borderRadius:14, background:bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Icon style={{ color, fontSize:22 }} />
      </div>
    </div>
  );
}

// ── Lead Row Card ──────────────────────────────────────────────────────────────
function LeadRow({ lead, onNavigate, onUpdateStatus, isUpdating }) {
  const st = DEAL_STATUS[lead.status] || DEAL_STATUS["New"];
  const ac = avatarColor(lead.name);
  const [hov, setHov] = useState(true);

  return (
    <div
      onMouseEnter={() => setHov(false)}
      onMouseLeave={() => setHov(true)}
      style={{
        background: hov ? st.bg : "#fff",
        border: `1px solid ${hov ? st.border : "#E8ECF4"}`,
        borderLeft: `4px solid ${hov ? st.dot : "null"}`,
        borderRadius: 16, padding: "18px 20px",
        display: "flex", alignItems: "center", gap: 16,
        transition: "all 0.2s ease",
        boxShadow: hov ? "0 4px 20px rgba(0,0,0,0.07)" : "0 1px 4px rgba(0,0,0,0.04)",
        cursor: "default",
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
        background: ac + "18", border: `2px solid ${ac}33`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: 14, color: ac,
      }}>
        {initials(lead.name)}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          onClick={() => onNavigate(lead.id)}
          style={{
            display: "flex", alignItems: "center", gap: 4, cursor: "pointer",
            fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 15, color: "#1E293B",
            marginBottom: 4,
          }}
        >
          <span style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:200 }}>{lead.name}</span>
          <FiChevronRight style={{ color: "#94A3B8", flexShrink: 0 }} />
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"10px 18px" }}>
          <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:12.5, color:"#64748B", fontFamily:"'Jost',sans-serif" }}>
            <FiPhone style={{ color:"#94A3B8" }} /> {lead.phone}
          </span>
          {lead.email && (
            <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#94A3B8", fontFamily:"'Jost',sans-serif" }}>
              <FiMail /> {lead.email}
            </span>
          )}
          {lead.notes && (
            <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#94A3B8", fontFamily:"'Jost',sans-serif", maxWidth:220, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
              <FiFileText /> {lead.notes}
            </span>
          )}
          {lead.followUpDate && (
            <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#7C3AED", fontFamily:"'Jost',sans-serif" }}>
              <FiCalendar />
              {new Date(lead.followUpDate).toLocaleString("en-IN",{ day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" })}
            </span>
          )}
        </div>
      </div>

      {/* Badge + Select */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8, flexShrink:0 }}>
        <span style={{
          background: st.badge, color: st.badgeText,
          borderRadius: 20, padding: "4px 12px", fontSize: 11,
          fontFamily: "'Manrope',sans-serif", fontWeight: 700, letterSpacing: ".3px",
          display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap",
        }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:st.dot, display:"inline-block" }} />
          {st.label}
        </span>
        <select
          value={lead.status}
          disabled={isUpdating}
          onChange={e => onUpdateStatus(lead.id, e.target.value)}
          style={{
            fontSize: 12, fontFamily:"'Jost',sans-serif", fontWeight:500,
            border: "1px solid #E2E8F0", borderRadius: 9, padding: "5px 10px",
            background: "#F8FAFC", color: "#475569", outline:"none",
            cursor: isUpdating ? "not-allowed" : "pointer",
            opacity: isUpdating ? 0.5 : 1, transition:"border-color .15s",
          }}
          onFocus={e => e.target.style.borderColor = "#6366F1"}
          onBlur={e  => e.target.style.borderColor = "#E2E8F0"}
        >
          {["New","Contacted","Interested","Not Interested","Follow-Up","Converted","Lost"].map(s =>
            <option key={s} value={s}>{s}</option>
          )}
        </select>
        {isUpdating && <span style={{ fontSize:11, color:"#94A3B8", fontFamily:"'Jost',sans-serif" }}>Saving…</span>}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Conversions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [chartData, setChartData]   = useState([]);
  const urlStatus = searchParams.get("status");

  const [leads, setLeads]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState(urlStatus || "all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]         = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [stats, setStats] = useState({ total:0, converted:0, lost:0, inProgress:0, tabCounts:{} });

  const fetchStats = async () => {
    try {
      const res = await API.get("/leads/my-leads?page=1&limit=1000");
      const all = res.data.leads;
      const converted  = all.filter(l => l.status === "Converted").length;
      const lost       = all.filter(l => ["Lost","Not Interested"].includes(l.status)).length;
      const inProgress = all.filter(l => ["New","Contacted","Interested","Follow-Up"].includes(l.status)).length;
      const tabCounts  = {};
      TABS.forEach(t => { tabCounts[t.key] = t.key === "all" ? all.length : all.filter(l=>l.status===t.key).length; });
      setStats({ total: all.length, converted, lost, inProgress, tabCounts });
    } catch (err) { console.error(err); }
  };

  const fetchLeads = async (page=1, searchVal=search, filterVal=activeTab) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page, limit,
        ...(filterVal !== "all" && filterVal !== "All" && { status: filterVal }),
        ...(searchVal && { search: searchVal }),
      });
      const res = await API.get(`/leads/my-leads?${params}`);
      setLeads(res.data.leads);
      setPagination(res.data.pagination);
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchChartData = async () => {
    try {
      const res = await API.get("/admin/my-stats");
      setChartData(res.data.dailyData);
    } catch(err) { console.error(err); }
  };

  useEffect(() => { fetchStats(); fetchLeads(1); fetchChartData(); }, []);
  useEffect(() => { setCurrentPage(1); fetchLeads(1, search, activeTab); }, [activeTab]);
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setCurrentPage(1); fetchLeads(1, searchInput, activeTab); }, 500);
    return () => clearTimeout(t);
  }, [searchInput]);
  useEffect(() => { if (urlStatus) setActiveTab(urlStatus); }, [urlStatus]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchLeads(page, search, activeTab);
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  const updateStatus = async (leadId, status) => {
    try {
      setUpdatingId(leadId);
      await API.put(`/leads/${leadId}/status`, { status });
      setLeads(prev => prev.map(l => l.id===leadId ? { ...l, status } : l));
      fetchStats();
    } catch(err) { console.error(err); }
    finally { setUpdatingId(null); }
  };

  const conversionRate = stats.total ? Math.round((stats.converted / stats.total) * 100) : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Jost:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #CBD5E1; font-family: 'Jost', sans-serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:none } }
        @keyframes spin   { to { transform: rotate(360deg) } }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>

      <div style={{ minHeight:"100vh", background:"#F8FAFC", padding:"28px 24px 48px", fontFamily:"'Jost',sans-serif" }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={{
          background:"#fff", borderRadius:20, border:"1px solid #E8ECF4",
          padding:"22px 26px", marginBottom:24,
          boxShadow:"0 2px 12px rgba(0,0,0,0.04)",
          display:"flex", alignItems:"center", gap:14,
        }}>
          <div style={{
            width:46, height:46, borderRadius:13,
            background:"linear-gradient(135deg,#6366F1 0%,#8B5CF6 100%)",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 4px 14px rgba(99,102,241,.3)",
          }}>
            <FiBarChart2 style={{ color:"#fff", fontSize:22 }} />
          </div>
          <div>
            <h1 style={{ margin:0, fontFamily:"'Manrope',sans-serif", fontWeight:800, fontSize:22, color:"#1E293B" }}>
              Conversion Tracker
            </h1>
            <p style={{ margin:"3px 0 0", fontSize:13, color:"#94A3B8", fontFamily:"'Jost',sans-serif" }}>
              Track and manage the status of all your deals
            </p>
          </div>
        </div>

        {/* ── Stat Cards ─────────────────────────────────────────── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))", gap:14, marginBottom:24 }}>
          <StatCard label="Total Leads"      value={stats.total}      icon={FaUsers}        color="#6366F1" bg="#EEF2FF" />
          <StatCard label="Converted"        value={stats.converted}  icon={FaCheckCircle}  color="#22C55E" bg="#F0FDF4" />
          <StatCard label="Lost / Not Int."  value={stats.lost}       icon={FaTimesCircle}  color="#EF4444" bg="#FFF5F5" />
          <StatCard label="Conversion Rate"  value={`${conversionRate}%`} icon={FaBullseye} color="#3B82F6" bg="#EFF6FF" />
        </div>

        {/* ── Pipeline Bar ───────────────────────────────────────── */}
        <div style={{
          background:"#fff", borderRadius:18, border:"1px solid #E8ECF4",
          padding:"18px 22px", marginBottom:24,
          boxShadow:"0 2px 12px rgba(0,0,0,0.04)",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
            <span style={{ fontSize:12, color:"#64748B", fontFamily:"'Manrope',sans-serif", fontWeight:600, letterSpacing:".5px", textTransform:"uppercase" }}>Deal Pipeline</span>
            <span style={{ fontSize:12, color:"#94A3B8", fontFamily:"'Jost',sans-serif" }}>{stats.total} total leads</span>
          </div>
          <div style={{ height:10, borderRadius:99, overflow:"hidden", background:"#F1F5F9", display:"flex" }}>
            {stats.converted  > 0 && <div style={{ width:`${(stats.converted /stats.total)*100}%`,  background:"#22C55E", transition:"width .5s ease" }} />}
            {stats.inProgress > 0 && <div style={{ width:`${(stats.inProgress/stats.total)*100}%`, background:"#6366F1", transition:"width .5s ease" }} />}
            {stats.lost       > 0 && <div style={{ width:`${(stats.lost      /stats.total)*100}%`, background:"#EF4444", transition:"width .5s ease" }} />}
          </div>
          <div style={{ display:"flex", gap:18, marginTop:10, flexWrap:"wrap" }}>
            {[
              { color:"#22C55E", label:`Converted`, count:stats.converted  },
              { color:"#6366F1", label:`In Progress`,count:stats.inProgress },
              { color:"#EF4444", label:`Lost`,       count:stats.lost       },
            ].map(item => (
              <span key={item.label} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#64748B", fontFamily:"'Jost',sans-serif" }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:item.color, display:"inline-block" }} />
                {item.label} <strong style={{ color:"#1E293B", fontFamily:"'Manrope',sans-serif" }}>({item.count})</strong>
              </span>
            ))}
          </div>
        </div>

        {/* ── Chart ──────────────────────────────────────────────── */}
        <div style={{ background:"#fff", borderRadius:18, border:"1px solid #E8ECF4", marginBottom:24, overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
          <ConversionChart data={chartData} />
        </div>

        {/* ── Search ─────────────────────────────────────────────── */}
        <div style={{ position:"relative", marginBottom:16 }}>
          <FiSearch style={{ position:"absolute", left:15, top:"50%", transform:"translateY(-50%)", color:"#CBD5E1", fontSize:15 }} />
          <input
            type="text"
            placeholder="Search by name or phone…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            style={{
              width:"100%", background:"#fff", border:"1.5px solid #E2E8F0",
              borderRadius:12, padding:"11px 40px 11px 42px",
              fontSize:14, color:"#1E293B", outline:"none",
              fontFamily:"'Jost',sans-serif", fontWeight:500,
              boxShadow:"0 1px 4px rgba(0,0,0,0.04)", transition:"border-color .15s, box-shadow .15s",
            }}
            onFocus={e => { e.target.style.borderColor="#6366F1"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,.12)"; }}
            onBlur={e  => { e.target.style.borderColor="#E2E8F0"; e.target.style.boxShadow="0 1px 4px rgba(0,0,0,0.04)"; }}
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              style={{
                position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                background:"#F1F5F9", border:"none", borderRadius:"50%",
                width:22, height:22, cursor:"pointer", color:"#94A3B8",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}
            ><FiX style={{ fontSize:12 }} /></button>
          )}
        </div>

        {/* ── Tabs ───────────────────────────────────────────────── */}
        <div style={{ overflowX:"auto", marginBottom:20, paddingBottom:4 }}>
          <div style={{ display:"flex", gap:8, minWidth:"max-content" }}>
            {TABS.map(tab => {
              const isA = activeTab === tab.key;
              const acl = TAB_ACCENT[tab.key] || TAB_ACCENT.all;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display:"flex", alignItems:"center", gap:7,
                    padding:"8px 16px", borderRadius:11, fontSize:13,
                    fontFamily:"'Manrope',sans-serif", fontWeight: isA ? 700 : 500,
                    background: isA ? acl.bg : "#fff",
                    color:      isA ? acl.text : "#64748B",
                    border: `1.5px solid ${isA ? acl.active+"55" : "#E2E8F0"}`,
                    boxShadow: isA ? `0 2px 10px ${acl.active}22` : "none",
                    cursor:"pointer", transition:"all .18s ease", whiteSpace:"nowrap",
                  }}
                >
                  <Icon style={{ fontSize:14 }} />
                  {tab.label}
                  <span style={{
                    background: isA ? acl.active : "#F1F5F9",
                    color:      isA ? "#fff" : "#94A3B8",
                    borderRadius:99, padding:"1px 8px", fontSize:11,
                    fontFamily:"'Jost',sans-serif", fontWeight:600,
                  }}>
                    {stats.tabCounts[tab.key] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Leads List ─────────────────────────────────────────── */}
        {loading ? (
          <div style={{ textAlign:"center", paddingTop:80 }}>
            <div style={{
              width:38, height:38, border:"3px solid #EEF2FF", borderTopColor:"#6366F1",
              borderRadius:"50%", margin:"0 auto 14px", animation:"spin .75s linear infinite",
            }} />
            <p style={{ color:"#94A3B8", fontSize:14, fontFamily:"'Jost',sans-serif" }}>Loading leads…</p>
          </div>
        ) : leads.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{
              width:60, height:60, borderRadius:16, background:"#F1F5F9",
              border:"1px solid #E2E8F0", display:"flex", alignItems:"center",
              justifyContent:"center", margin:"0 auto 14px",
            }}>
              <FiInbox style={{ fontSize:26, color:"#94A3B8" }} />
            </div>
            <p style={{ color:"#64748B", fontSize:15, fontFamily:"'Manrope',sans-serif", fontWeight:600, marginBottom:6 }}>No leads found</p>
            <p style={{ color:"#94A3B8", fontSize:13, fontFamily:"'Jost',sans-serif", marginBottom:16 }}>Try clearing your filters</p>
            {(searchInput || activeTab !== "all") && (
              <button
                onClick={() => { setSearchInput(""); setSearch(""); setActiveTab("all"); }}
                style={{
                  background:"linear-gradient(135deg,#6366F1,#8B5CF6)", color:"#fff",
                  border:"none", borderRadius:10, padding:"9px 22px",
                  fontSize:13, fontFamily:"'Manrope',sans-serif", fontWeight:700,
                  cursor:"pointer", boxShadow:"0 4px 14px rgba(99,102,241,.3)",
                }}
              >Clear Filters</button>
            )}
          </div>
        ) : (
          <>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {leads.map((lead, i) => (
                <div key={lead.id} style={{ animation:"fadeUp .25s ease both", animationDelay:`${i*30}ms` }}>
                  <LeadRow
                    lead={lead}
                    onNavigate={id => navigate(`/leads/${id}`)}
                    onUpdateStatus={updateStatus}
                    isUpdating={updatingId === lead.id}
                  />
                </div>
              ))}
            </div>
            <div style={{ marginTop:24 }}>
              <Pagination pagination={pagination} onPageChange={handlePageChange} />
            </div>
          </>
        )}
      </div>
    </>
  );
}