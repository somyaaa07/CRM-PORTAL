import { useState, useEffect } from "react";
import {
  FiPhone,
  FiFileText,
  FiCalendar,
  FiClock,
  FiSearch,
  FiX,
  FiInbox,
  FiChevronRight,
} from "react-icons/fi";
import { FaPhoneAlt } from "react-icons/fa";
import API from "../../api/axios";

// ── Disposition config ────────────────────────────────────────────────────────
const DISPOSITION = {
  Answered: {
    label: "Answered",
    bg: "#F0FDF4",
    border: "#86EFAC",
    badge: "#DCFCE7",
    badgeText: "#15803D",
    dot: "#22C55E",
    accent: "#16A34A",
  },
  "No Answer": {
    label: "No Answer",
    bg: "#FFF5F5",
    border: "#FCA5A5",
    badge: "#FEE2E2",
    badgeText: "#DC2626",
    dot: "#EF4444",
    accent: "#DC2626",
  },
  Busy: {
    label: "Busy",
    bg: "#FFFBEB",
    border: "#FCD34D",
    badge: "#FEF3C7",
    badgeText: "#92400E",
    dot: "#F59E0B",
    accent: "#D97706",
  },
  Voicemail: {
    label: "Voicemail",
    bg: "#EFF6FF",
    border: "#93C5FD",
    badge: "#DBEAFE",
    badgeText: "#1D4ED8",
    dot: "#3B82F6",
    accent: "#2563EB",
  },
  "Wrong Number": {
    label: "Wrong Number",
    bg: "#F8FAFC",
    border: "#CBD5E1",
    badge: "#F1F5F9",
    badgeText: "#475569",
    dot: "#94A3B8",
    accent: "#64748B",
  },
  "Callback Requested": {
    label: "Callback",
    bg: "#F5F3FF",
    border: "#C4B5FD",
    badge: "#EDE9FE",
    badgeText: "#6D28D9",
    dot: "#7C4DFF",
    accent: "#7C4DFF",
  },
};

const DEFAULT_DISP = {
  bg: "#F8FAFC",
  border: "#CBD5E1",
  badge: "#F1F5F9",
  badgeText: "#475569",
  dot: "#94A3B8",
  accent: "#64748B",
  label: "Unknown",
};

// ── Avatar helpers ────────────────────────────────────────────────────────────
const PALETTE = [
  "#7C4DFF",
  "#22C55E",
  "#F97316",
  "#3B82F6",
  "#EC4899",
  "#14B8A6",
  "#EAB308",
];

function initials(name = "") {
  return (
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

function avatarColor(name = "") {
  return PALETTE[
    name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length
  ];
}

function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, bg }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff",
        borderRadius: 18,
        border: "1px solid #E8ECF4",
        padding: "18px 20px",
        textAlign: "center",
        boxShadow: hov
          ? "0 6px 24px rgba(0,0,0,0.08)"
          : "0 2px 12px rgba(0,0,0,0.04)",
        transform: hov ? "translateY(-2px)" : "none",
        transition: "all 0.2s ease",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 10px",
        }}
      >
        <FaPhoneAlt style={{ color, fontSize: 16 }} />
      </div>
      <span
        style={{
          display: "block",
          fontSize: 26,
          fontWeight: 800,
          fontFamily: "'Manrope',sans-serif",
          color: "#1E293B",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          display: "block",
          fontSize: 11,
          color: "#94A3B8",
          fontFamily: "'Jost',sans-serif",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginTop: 5,
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Call Card ────────────────────────────────────────────────────────────────
function CallCard({ log, index }) {
  const disp = DISPOSITION[log.disposition] || DEFAULT_DISP;
  const ac = avatarColor(log.lead?.name || "");
  const [hov, setHov] = useState(true);

  return (
    <>
      <style>{`
      @media (max-width:374px){
      .card{
      padding:10px 12px !important;
          gap:0 !important;
        }
      }
   `}</style>
      <div
        onMouseEnter={() => setHov(false)}
        onMouseLeave={() => setHov(true)}
        className="card"
        style={{
          background: hov ? disp.bg : "#fff",
          border: `1px solid ${hov ? disp.border : "#E8ECF4"}`,
          borderLeft: `4px solid ${hov ? disp.dot : "null"}`,
          borderRadius: 16,
          padding: "18px 20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          transition: "all 0.2s ease",
          boxShadow: hov
            ? `0 6px 24px rgba(0,0,0,0.08)`
            : "0 2px 10px rgba(0,0,0,0.04)",
          animation: `fadeUp 0.3s ease both`,
          animationDelay: `${index * 50}ms`,
          cursor: "default",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            flexShrink: 0,
            background: ac + "18",
            border: `2px solid ${ac}33`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Manrope',sans-serif",
            fontWeight: 800,
            fontSize: 14,
            color: ac,
          }}
        >
          {initials(log.lead?.name)}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontFamily: "'Manrope',sans-serif",
              fontWeight: 700,
              fontSize: 15,
              color: "#1E293B",
              marginBottom: 5,
            }}
          >
            <span
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 180,
              }}
            >
              {log.lead?.name || "Unknown"}
            </span>
          </div>

          {/* Meta row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px" }}>
            {/* Phone */}
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12.5,
                color: "#64748B",
                fontFamily: "'Jost',sans-serif",
              }}
            >
              <FiPhone style={{ color: "#94A3B8", fontSize: 12 }} />
              {log.lead?.phone}
            </span>

            {/* Duration pill */}
            {log.callDuration > 0 && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  fontFamily: "'Jost',sans-serif",
                  fontWeight: 600,
                  color: disp.accent,
                  background: disp.badge,
                  borderRadius: 20,
                  padding: "2px 9px",
                }}
              >
                <FiClock style={{ fontSize: 11 }} />
                {formatDuration(log.callDuration)}
              </span>
            )}

            {/* Notes */}
            {log.notes && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  color: "#94A3B8",
                  fontFamily: "'Jost',sans-serif",
                  maxWidth: 220,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                <FiFileText style={{ fontSize: 12, flexShrink: 0 }} />
                {log.notes}
              </span>
            )}

            {/* Follow-up */}
            {log.followUpDate && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  color: "#7C4DFF",
                  fontFamily: "'Jost',sans-serif",
                  fontWeight: 500,
                }}
              >
                <FiCalendar style={{ fontSize: 12 }} />
                {new Date(log.followUpDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Right: badge + time */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 7,
            flexShrink: 0,
          }}
        >
          {/* Disposition badge */}
          <span
            style={{
              background: disp.badge,
              color: disp.badgeText,
              borderRadius: 20,
              padding: "4px 12px",
              fontSize: 11,
              fontFamily: "'Manrope',sans-serif",
              fontWeight: 700,
              letterSpacing: "0.3px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: disp.dot,
                display: "inline-block",
              }}
            />
            {disp.label}
          </span>

          {/* Timestamp */}
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11.5,
              color: "#94A3B8",
              fontFamily: "'Jost',sans-serif",
            }}
          >
            <FiClock style={{ fontSize: 11 }} />
            {new Date(log.calledAt).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function CallHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await API.get("/call-logs/my-logs");
        setLogs(res.data.logs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const filtered = logs.filter((log) => {
    const q = search.toLowerCase();
    return (
      (log.lead?.name || "").toLowerCase().includes(q) ||
      (log.lead?.phone || "").includes(q) ||
      (log.notes || "").toLowerCase().includes(q) ||
      log.disposition.toLowerCase().includes(q)
    );
  });

  const answered = logs.filter((l) => l.disposition === "Answered").length;
  const missed = logs.filter((l) =>
    ["No Answer", "Busy"].includes(l.disposition),
  ).length;
  const followUps = logs.filter((l) => l.followUpDate).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Jost:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #CBD5E1; font-family: 'Jost', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ch-search:focus {
          border-color: #7C4DFF !important;
          box-shadow: 0 0 0 3px rgba(124,77,255,0.12) !important;
          outline: none;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#fefafa",
          padding: "28px 24px 48px",
          fontFamily: "'Jost', sans-serif",
        }}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            border: "1px solid #E8ECF4",
            padding: "20px 24px",
            marginBottom: 22,
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              background: "linear-gradient(135deg,#7C4DFF 0%,#b47aff 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(124,77,255,.3)",
              flexShrink: 0,
            }}
          >
            <FaPhoneAlt style={{ color: "#fff", fontSize: 18 }} />
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontFamily: "'Manrope',sans-serif",
                fontWeight: 800,
                fontSize: 22,
                color: "#1E293B",
                letterSpacing: "-0.4px",
              }}
            >
              Call History
            </h1>
            <p
              style={{
                margin: "3px 0 0",
                fontSize: 13,
                color: "#94A3B8",
                fontFamily: "'Jost',sans-serif",
              }}
            >
              Review and track all your call activity
            </p>
          </div>
        </div>

        {/* ── Stat Cards ─────────────────────────────────────── */}
        {!loading && logs.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))",
              gap: 12,
              marginBottom: 22,
            }}
          >
            <StatCard
              label="Total Calls"
              value={logs.length}
              color="#7C4DFF"
              bg="#F5F3FF"
            />
            <StatCard
              label="Answered"
              value={answered}
              color="#22C55E"
              bg="#F0FDF4"
            />
            <StatCard
              label="Missed"
              value={missed}
              color="#EF4444"
              bg="#FFF5F5"
            />
            <StatCard
              label="Follow-Ups"
              value={followUps}
              color="#3B82F6"
              bg="#EFF6FF"
            />
          </div>
        )}

        {/* ── Pipeline Bar ───────────────────────────────────── */}
        {!loading && logs.length > 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              border: "1px solid #E8ECF4",
              padding: "16px 20px",
              marginBottom: 20,
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: "#64748B",
                  fontFamily: "'Manrope',sans-serif",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Call Breakdown
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "#94A3B8",
                  fontFamily: "'Jost',sans-serif",
                }}
              >
                {logs.length} total
              </span>
            </div>
            <div
              style={{
                height: 8,
                borderRadius: 99,
                overflow: "hidden",
                background: "#F1F5F9",
                display: "flex",
              }}
            >
              {answered > 0 && (
                <div
                  style={{
                    width: `${(answered / logs.length) * 100}%`,
                    background: "#22C55E",
                    transition: "width .5s",
                  }}
                />
              )}
              {followUps > 0 && (
                <div
                  style={{
                    width: `${(followUps / logs.length) * 100}%`,
                    background: "#7C4DFF",
                    transition: "width .5s",
                  }}
                />
              )}
              {missed > 0 && (
                <div
                  style={{
                    width: `${(missed / logs.length) * 100}%`,
                    background: "#EF4444",
                    transition: "width .5s",
                  }}
                />
              )}
            </div>
            <div
              style={{
                display: "flex",
                gap: 16,
                marginTop: 10,
                flexWrap: "wrap",
              }}
            >
              {[
                { color: "#22C55E", label: "Answered", count: answered },
                { color: "#7C4DFF", label: "Follow-Up", count: followUps },
                { color: "#EF4444", label: "Missed", count: missed },
              ].map((item) => (
                <span
                  key={item.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: "#64748B",
                    fontFamily: "'Jost',sans-serif",
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: item.color,
                      display: "inline-block",
                    }}
                  />
                  {item.label}{" "}
                  <strong
                    style={{
                      color: "#1E293B",
                      fontFamily: "'Manrope',sans-serif",
                    }}
                  >
                    ({item.count})
                  </strong>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Search ─────────────────────────────────────────── */}
        {!loading && logs.length > 0 && (
          <div style={{ position: "relative", marginBottom: 18 }}>
            <FiSearch
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#CBD5E1",
                fontSize: 15,
              }}
            />
            <input
              className="ch-search"
              type="text"
              placeholder="Search by name, phone, or notes…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                width: "100%",
                background: "#fff",
                border: "1.5px solid #E2E8F0",
                borderRadius: 12,
                padding: "11px 40px 11px 42px",
                fontSize: 14,
                color: "#1E293B",
                fontFamily: "'Jost',sans-serif",
                fontWeight: 500,
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                transition: "border-color .15s, box-shadow .15s",
              }}
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "#F1F5F9",
                  border: "none",
                  borderRadius: "50%",
                  width: 22,
                  height: 22,
                  cursor: "pointer",
                  color: "#94A3B8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiX style={{ fontSize: 12 }} />
              </button>
            )}
          </div>
        )}

        {/* ── Content ────────────────────────────────────────── */}
        {loading ? (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div
              style={{
                width: 38,
                height: 38,
                border: "3px solid #EDE9FE",
                borderTopColor: "#7C4DFF",
                borderRadius: "50%",
                margin: "0 auto 14px",
                animation: "spin .75s linear infinite",
              }}
            />
            <p
              style={{
                color: "#94A3B8",
                fontSize: 14,
                fontFamily: "'Jost',sans-serif",
              }}
            >
              Loading calls…
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: "#F5F3FF",
                border: "1px solid #EDE9FE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
              }}
            >
              <FiInbox style={{ fontSize: 26, color: "#7C4DFF" }} />
            </div>
            <p
              style={{
                color: "#64748B",
                fontSize: 15,
                fontFamily: "'Manrope',sans-serif",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              No calls found
            </p>
            <p
              style={{
                color: "#94A3B8",
                fontSize: 13,
                fontFamily: "'Jost',sans-serif",
              }}
            >
              Try a different search
            </p>
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                style={{
                  marginTop: 12,
                  background: "linear-gradient(135deg,#7C4DFF,#b47aff)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "9px 22px",
                  fontSize: 13,
                  fontFamily: "'Manrope',sans-serif",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(124,77,255,.3)",
                }}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((log, i) => (
              <CallCard key={log.id} log={log} index={i} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
