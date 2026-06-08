import { useState, useEffect } from "react";
import API from "../../api/axios";
import CallModal from "../../components/CallModal";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { LuLogs } from "react-icons/lu";
const STATUS_FILTERS = [
  "All",
  "New",
  "Contacted",
  "Follow-Up",
  "Interested",
  "Not Interested",
];

const STATUS_META = {
  New: { bg: "#E6F1FB", border: "#B5D4F4", dot: "#378ADD", text: "#0C447C" },
  Contacted: {
    bg: "#EEEDFE",
    border: "#CECBF6",
    dot: "#7F77DD",
    text: "#3C3489",
  },
  "Follow-Up": {
    bg: "#FAEEDA",
    border: "#FAC775",
    dot: "#BA7517",
    text: "#854F0B",
  },
  Interested: {
    bg: "#E1F5EE",
    border: "#9FE1CB",
    dot: "#1D9E75",
    text: "#085041",
  },
  "Not Interested": {
    bg: "#FAECE7",
    border: "#F5C4B3",
    dot: "#D85A30",
    text: "#993C1D",
  },
};

const AVATAR_COLORS = [
  "#378ADD",
  "#7F77DD",
  "#BA7517",
  "#1D9E75",
  "#D85A30",
  "#D4537E",
];
function initials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
function avatarColor(name = "") {
  return AVATAR_COLORS[
    name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) %
      AVATAR_COLORS.length
  ];
}

// ── Lead Card ─────────────────────────────────────────────────────────────────
function LeadCard({ lead, onCallClick, onNavigate, isHighlighted }) {
  const meta = STATUS_META[lead.status] || STATUS_META["New"];
  const ac = avatarColor(lead.name);
  const [hov, setHov] = useState(false);

  return (
    <>
      <style>{`
      

/* VERY SMALL (320px - 374px)  */
@media (max-width: 374px) {
        .main{
        padding:10px !important;
        }
  .lead-status{
  font-size: 7px !important;
  margin-left:-25px !important;
  margin-bottom:30px !important ;
  
  }

  .badge-section{
        gap:7px !important;
        
  }

  .name-section{
        font-size:12px !important
  }
}`}</style>

      <div
        className="main"
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: "#ffffff",
          border: `1px solid ${isHighlighted ? meta.border : "#E8E6DF"}`,
          borderLeft: `3px solid ${meta.dot}`,
          borderRadius: 14,
          padding: "18px 18px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          transition: "box-shadow 0.18s ease, border-color 0.18s ease",
          boxSizing: "border-box",
          boxShadow: hov
            ? "0 4px 18px rgba(0,0,0,0.07)"
            : "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        {/* Avatar + name + badge */}
        <div
          className="badge-section"
          style={{ display: "flex", alignItems: "center", gap: 11 }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: ac + "18",
              border: `1.5px solid ${ac}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Sora', sans-serif",
              fontWeight: 700,
              fontSize: 13.5,
              color: ac,
              flexShrink: 0,
            }}
          >
            {initials(lead.name)}
          </div>
          <div
            onClick={() => onNavigate(lead.id)}
            style={{
              margin: 0,
              fontFamily: "'Sora', sans-serif",
              fontWeight: 600,
              fontSize: 14.5,
              color: "#2C2C2A",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span
              className="name-section"
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 140,
              }}
            >
              {lead.name}
            </span>
            <FiChevronRight
              style={{ color: "#94A3B8", flexShrink: 0, fontSize: 14 }}
            />
          </div>
          <p
            style={{ margin: 0, fontSize: 12, color: "#888780", marginTop: 2 }}
          >
            {lead.city}
          </p>

          <span
            className="lead-status"
            style={{
              background: meta.bg,
              color: meta.text,
              border: `1px solid ${meta.border}`,
              borderRadius: 20,
              padding: "3px 10px",
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: meta.dot,
                display: "inline-block",
              }}
            />
            {lead.status}
          </span>
        </div>

        {/* Phone */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#F7F5F0",
            borderRadius: 8,
            padding: "8px 11px",
            border: "1px solid #E8E6DF",
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#888780"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1 19.79 19.79 0 0 1 1.62 4.55 2 2 0 0 1 3.59 2.37h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z" />
          </svg>
          <span
            style={{
              fontSize: 13,
              color: "#444441",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {lead.phone}
          </span>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 11.5,
              color: "#B4B2A9",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Last: {lead.lastContact}
          </span>

          <div style={{ display: "flex", gap: 6 }}>
          
            <a
              href={`tel:${lead.phone}`}
              style={{ textDecoration: "none" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                style={{
                  background: hov ? "#1D9E75" : "#E1F5EE",
                  color: hov ? "#ffffff" : "#085041",
                  border: `1px solid ${hov ? "#1D9E75" : "#9FE1CB"}`,
                  borderRadius: 8,
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "'Sora', sans-serif",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1 19.79 19.79 0 0 1 1.62 4.55 2 2 0 0 1 3.59 2.37h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z" />
                </svg>
                Call
              </button>
            </a>

               <button
              onClick={(e) => {
                e.stopPropagation();
                onCallClick(lead);
              }}
              style={{
                background: "#F7F5F0",
                color: "#444441",
                border: "1px solid #E8E6DF",
                borderRadius: 8,
                padding: "6px 10px",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "'Sora', sans-serif",
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
              title="Log call result"
            >
              <LuLogs /> Log
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Stat Pill ─────────────────────────────────────────────────────────────────
function StatPill({ status, count }) {
  const m = STATUS_META[status];
  return (
    <div
      style={{
        background: m.bg,
        border: `1px solid ${m.border}`,
        borderRadius: 10,
        padding: "10px 16px",
        textAlign: "center",
        minWidth: 190,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 20,
          fontWeight: 700,
          color: m.dot,
          fontFamily: "'Sora', sans-serif",
        }}
      >
        {count}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 10.5,
          color: m.text,
          marginTop: 2,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {status}
      </p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MyLeads() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 12;

  // ── Fetch Leads ────────────────────────────────────────────────────────────
  const fetchLeads = async (
    page = 1,
    searchVal = search,
    filterVal = activeFilter,
  ) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page,
        limit,
        ...(filterVal !== "All" && { status: filterVal }),
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

  // Initial load
  useEffect(() => {
    fetchLeads(1);
  }, []);

  // Filter change
  useEffect(() => {
    setCurrentPage(1);
    fetchLeads(1, search, activeFilter);
  }, [activeFilter]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
      fetchLeads(1, searchInput, activeFilter);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchLeads(page, search, activeFilter);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Stat counts derived from current leads list
  const counts = Object.keys(STATUS_META).reduce((acc, s) => {
    acc[s] = leads.filter((l) => l.status === s).length;
    return acc;
  }, {});

  const totalLeads = pagination?.totalLeads ?? leads.length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #B4B2A9; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        @keyframes spin   { to { transform:rotate(360deg); } }


/* VERY SMALL (320px - 374px)  */
@media (max-width: 374px) {
  .stat-container {
    flex-direction: column !important;
    align-items: stretch !important;
  }

  .stat-container > div {
    width: 100% !important;
  }

  .lead-grid{
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)) !important;
  }
}

/*  SMALL (375px - 425px) */
@media (min-width: 375px) and (max-width: 425px) {
  .stat-container {
    justify-content: space-between !important;
  }

  .stat-container > div {
    width: 100% !important;
  }
  
}

/*  TABLET (426px - 768px)  */
@media (min-width: 425px) and (max-width: 768px) {
  .stat-container {
    justify-content: flex-start !important;
  }

  .stat-container > div {
    width: 100% !important;
  }
}

/*  LARGE (769px+) */
@media (min-width: 769px) {
  .stat-container > div {
    width: auto !important;
  }
}





      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#fefafa",
          padding: "28px 24px",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "#E1F5EE",
              border: "1px solid #9FE1CB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1D9E75"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                fontSize: 21,
                color: "#2C2C2A",
              }}
            >
              My Leads
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: 12.5,
                color: "#888780",
                marginTop: 1,
              }}
            >
              {totalLeads} leads assigned to you
            </p>
          </div>
        </div>

        {/* Stats */}
        <div
          className="stat-container"
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 22,
          }}
        >
          {Object.keys(STATUS_META).map((s) => (
            <StatPill key={s} status={s} count={counts[s] || 0} />
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#B4B2A9"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              position: "absolute",
              left: 13,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              width: "100%",
              background: "#ffffff",
              border: "1px solid #D3D1C7",
              borderRadius: 11,
              padding: "10px 36px 10px 38px",
              fontSize: 13.5,
              color: "#2C2C2A",
              outline: "none",
              fontFamily: "'DM Sans', sans-serif",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#9FE1CB")}
            onBlur={(e) => (e.target.style.borderColor = "#D3D1C7")}
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              style={{
                position: "absolute",
                right: 11,
                top: "50%",
                transform: "translateY(-50%)",
                background: "#F1EFE8",
                border: "1px solid #D3D1C7",
                borderRadius: "50%",
                width: 20,
                height: 20,
                cursor: "pointer",
                color: "#888780",
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: 7,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          {STATUS_FILTERS.map((f) => {
            const isA = activeFilter === f;
            const m = STATUS_META[f];
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  background: isA ? (m ? m.bg : "#F1EFE8") : "#ffffff",
                  color: isA ? (m ? m.text : "#444441") : "#888780",
                  border: `1px solid ${isA ? (m ? m.border : "#D3D1C7") : "#D3D1C7"}`,
                  borderRadius: 8,
                  padding: "6px 13px",
                  fontSize: 12.5,
                  fontWeight: isA ? 600 : 400,
                  fontFamily: "'Sora', sans-serif",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {m && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: isA ? m.dot : "#B4B2A9",
                      display: "inline-block",
                    }}
                  />
                )}
                {f}
                {isA && pagination && (
                  <span
                    style={{
                      background: m ? m.border + "88" : "#D3D1C7",
                      color: m ? m.text : "#444441",
                      borderRadius: 6,
                      padding: "1px 6px",
                      fontSize: 10.5,
                    }}
                  >
                    {pagination.totalLeads}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active filter sort indicator */}
        {activeFilter !== "All" && (
          <div
            style={{
              background: "#E6F1FB",
              border: "1px solid #B5D4F4",
              borderRadius: 10,
              padding: "8px 14px",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12.5,
              color: "#0C447C",
            }}
          >
            <span>⬆️</span>
            <span>
              <strong>"{activeFilter}"</strong> leads are sorted at the top
            </span>
            <button
              onClick={() => setActiveFilter("All")}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: "#378ADD",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                textDecoration: "underline",
              }}
            >
              Clear
            </button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div
              style={{
                width: 36,
                height: 36,
                border: "3px solid #E1F5EE",
                borderTopColor: "#1D9E75",
                borderRadius: "50%",
                margin: "0 auto 14px",
                animation: "spin 0.75s linear infinite",
              }}
            />
            <p style={{ color: "#B4B2A9", fontSize: 14 }}>Loading leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                margin: "0 auto 14px",
                background: "#F1EFE8",
                border: "1px solid #D3D1C7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
              }}
            >
              📭
            </div>
            <p style={{ color: "#888780", fontSize: 14, marginBottom: 12 }}>
              No leads found
            </p>
            {(searchInput || activeFilter !== "All") && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setActiveFilter("All");
                }}
                style={{
                  background: "#E1F5EE",
                  color: "#085041",
                  border: "1px solid #9FE1CB",
                  borderRadius: 8,
                  padding: "8px 18px",
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 600,
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div
              className="lead-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 12,
              }}
            >
              {leads.map((lead, i) => (
                <div
                  key={lead.id}
                  style={{
                    animation: "fadeUp 0.25s ease both",
                    animationDelay: `${i * 35}ms`,
                  }}
                >
                  <LeadCard
                    lead={lead}
                    onCallClick={setSelectedLead}
                    onNavigate={(id) => navigate(`/leads/${id}`)}
                    isHighlighted={
                      activeFilter !== "All" && lead.status === activeFilter
                    }
                  />
                </div>
              ))}
            </div>

            {/* Pagination — uses your existing <Pagination> component */}
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </>
        )}

        {/* Call Modal — uses your existing <CallModal> component */}
        {selectedLead && (
          <CallModal
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
            onSaved={() => fetchLeads(currentPage, search, activeFilter)}
          />
        )}
      </div>
    </>
  );
}
