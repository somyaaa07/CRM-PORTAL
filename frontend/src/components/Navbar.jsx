import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAlerts } from '../context/AlertContext';
import {
  LayoutDashboard, ClipboardList, BarChart2, Phone,
  Users, Upload, Bell, LogOut, AlertTriangle,
  CalendarClock, CheckCircle2, ChevronRight,
} from 'lucide-react';

/* ─── Design tokens (shared with Login & AgentDashboard) ─────────────── */
const purple      = '#7c4dff';
const purpleDark  = '#5722cc';
const ink         = '#0b0715';
const font        = "'Manrope', sans-serif";

export default function Navbar() {
  const { user, logout }           = useAuth();
  const { alertStats, alerts }     = useAlerts();
  const navigate                   = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const agentLinks = [
    { to: '/agent/dashboard',    label: 'Dashboard',    Icon: LayoutDashboard },
    { to: '/agent/my-leads',     label: 'My Leads',     Icon: ClipboardList   },
    { to: '/agent/conversions',  label: 'Conversions',  Icon: BarChart2       },
    { to: '/agent/call-history', label: 'Call History', Icon: Phone           },
  ];

  const adminLinks = [
    { to: '/admin/dashboard',   label: 'Dashboard',   Icon: LayoutDashboard },
    { to: '/admin/agents',      label: 'Agents',      Icon: Users           },
    { to: '/admin/leads',       label: 'Leads',       Icon: ClipboardList   },
    { to: '/admin/bulk-upload', label: 'Bulk Upload', Icon: Upload          },
    { to: '/admin/reports',     label: 'Reports',     Icon: BarChart2       },
  ];

  const navLinks = user?.role === 'admin' ? adminLinks : agentLinks;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

        .nav-root {
          font-family: ${font};
          background: #ffffff;
          border-bottom: 1px solid rgba(11,7,21,0.07);
          padding: 0 1.75rem;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px;
          gap: 1.5rem;
        }

        /* ── Logo ── */
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 9px;
          text-decoration: none;
          flex-shrink: 0;
        }

        .logo-icon {
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, ${purple}, ${purpleDark});
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(124,77,255,0.35);
          flex-shrink: 0;
        }

        .logo-text {
          font-size: 0.95rem;
          font-weight: 800;
          color: ${ink};
          letter-spacing: -0.02em;
        }

        /* ── Nav links ── */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 2px;
          flex: 1;
          justify-content: center;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 600;
          color: rgba(11,7,21,0.45);
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
        }

        .nav-link:hover {
          background: rgba(11,7,21,0.04);
          color: ${ink};
        }

        .nav-link.active {
          background: rgba(124,77,255,0.1);
          color: ${purple};
        }

        .nav-link.active svg { color: ${purple}; }

        /* ── Right side ── */
        .nav-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        /* Bell button */
        .bell-wrap { position: relative; }

        .bell-btn {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          border: 1px solid rgba(11,7,21,0.09);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: rgba(11,7,21,0.45);
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          position: relative;
        }

        .bell-btn:hover {
          background: rgba(11,7,21,0.04);
          color: ${ink};
          border-color: rgba(11,7,21,0.15);
        }

        .bell-btn.has-alert {
          border-color: rgba(124,77,255,0.25);
          color: ${purple};
          background: rgba(124,77,255,0.06);
        }

        .bell-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          font-size: 0.55rem;
          font-weight: 800;
          font-family: ${font};
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #fff;
        }

        .bell-badge.overdue { background: #dc2626; }
        .bell-badge.upcoming { background: #ea580c; }

        /* Dropdown */
        .bell-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 10px);
          width: 300px;
          background: #fff;
          border: 1px solid rgba(11,7,21,0.09);
          border-radius: 14px;
          box-shadow: 0 16px 48px rgba(11,7,21,0.12);
          z-index: 200;
          overflow: hidden;
        }

        .dropdown-header {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid rgba(11,7,21,0.07);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .dropdown-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: ${ink};
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .dropdown-count {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
        }

        .dropdown-count.overdue { background: #fee2e2; color: #dc2626; }
        .dropdown-count.upcoming { background: #ffedd5; color: #ea580c; }

        .dropdown-empty {
          padding: 2rem 1rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .dropdown-empty-icon {
          width: 36px;
          height: 36px;
          background: rgba(22,163,74,0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #16a34a;
        }

        .dropdown-empty-text {
          font-size: 0.78rem;
          font-weight: 500;
          color: rgba(11,7,21,0.4);
        }

        .alert-list { max-height: 260px; overflow-y: auto; }

        .alert-item {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid rgba(11,7,21,0.05);
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .alert-item:last-child { border-bottom: none; }
        .alert-item.overdue { background: rgba(220,38,38,0.03); }
        .alert-item.upcoming { background: rgba(234,88,12,0.02); }

        .alert-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          margin-top: 5px;
          flex-shrink: 0;
        }

        .alert-dot.overdue { background: #dc2626; }
        .alert-dot.upcoming { background: #ea580c; }

        .alert-info { flex: 1; min-width: 0; }

        .alert-name {
          font-size: 0.78rem;
          font-weight: 600;
          color: ${ink};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .alert-meta {
          font-size: 0.68rem;
          font-weight: 400;
          color: rgba(11,7,21,0.4);
          margin-top: 2px;
        }

        .alert-tag {
          font-size: 0.62rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 20px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .alert-tag.overdue { background: #fee2e2; color: #dc2626; }
        .alert-tag.upcoming { background: #ffedd5; color: #ea580c; }

        .dropdown-footer {
          padding: 0.7rem 1rem;
          border-top: 1px solid rgba(11,7,21,0.07);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 0.72rem;
          font-weight: 600;
          color: ${purple};
          cursor: pointer;
          transition: background 0.15s;
        }

        .dropdown-footer:hover { background: rgba(124,77,255,0.05); }

        /* User pill */
        .user-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px 4px 4px;
          border: 1px solid rgba(11,7,21,0.09);
          border-radius: 20px;
          background: transparent;
        }

        .user-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${purple}, ${purpleDark});
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
          font-weight: 800;
          color: #fff;
          flex-shrink: 0;
        }

        .user-info { display: flex; flex-direction: column; line-height: 1.2; }

        .user-name {
          font-size: 0.75rem;
          font-weight: 700;
          color: ${ink};
        }

        .user-role {
          font-size: 0.62rem;
          font-weight: 500;
          color: rgba(11,7,21,0.38);
          text-transform: capitalize;
        }

        /* Logout button */
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid rgba(220,38,38,0.2);
          background: rgba(220,38,38,0.05);
          color: #dc2626;
          font-family: ${font};
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }

        .logout-btn:hover {
          background: rgba(220,38,38,0.1);
          border-color: rgba(220,38,38,0.35);
        }

        /* ── Mobile nav ── */
        .mobile-nav {
          display: none;
          gap: 4px;
          padding: 0.5rem 0;
          overflow-x: auto;
          border-top: 1px solid rgba(11,7,21,0.06);
          scrollbar-width: none;
        }

        .mobile-nav::-webkit-scrollbar { display: none; }

        .mobile-link {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 11px;
          border-radius: 7px;
          font-size: 0.72rem;
          font-weight: 600;
          color: rgba(11,7,21,0.45);
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
          transition: background 0.15s, color 0.15s;
        }

        .mobile-link:hover { background: rgba(11,7,21,0.04); color: ${ink}; }
        .mobile-link.active { background: rgba(124,77,255,0.1); color: ${purple}; }

        @media (max-width: 768px) {
          .nav-links    { display: none; }
          .mobile-nav   { display: flex; }
          .user-info    { display: none; }
          .logout-btn span { display: none; }
          .logout-btn   { padding: 6px 8px; }
        }
      `}</style>

      <nav className="nav-root">
        <div className="nav-inner">

          {/* Logo */}
          <NavLink to="/" className="nav-logo">
            <div className="logo-icon">
              <Phone size={16} color="#fff" strokeWidth={2.2} />
            </div>
            <span className="logo-text">CRM Portal</span>
          </NavLink>

          {/* Desktop links */}
          <div className="nav-links">
            {navLinks.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <Icon size={14} strokeWidth={2.2} />
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="nav-right">

            {/* Bell — agent only */}
            {user?.role === 'agent' && (
              <div className="bell-wrap">
                <button
                  className={`bell-btn${alertStats.total > 0 ? ' has-alert' : ''}`}
                  onClick={() => setShowDropdown(!showDropdown)}
                  aria-label="Notifications"
                >
                  <Bell size={16} strokeWidth={2.2} />
                  {alertStats.total > 0 && (
                    <span className={`bell-badge ${alertStats.overdue > 0 ? 'overdue' : 'upcoming'}`}>
                      {alertStats.total > 9 ? '9+' : alertStats.total}
                    </span>
                  )}
                </button>

                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                    <div className="bell-dropdown">

                      <div className="dropdown-header">
                        <div className="dropdown-title">
                          <Bell size={13} strokeWidth={2.2} />
                          Follow-up Alerts
                        </div>
                        {alertStats.total > 0 && (
                          <span className={`dropdown-count ${alertStats.overdue > 0 ? 'overdue' : 'upcoming'}`}>
                            {alertStats.total} pending
                          </span>
                        )}
                      </div>

                      {alerts.length === 0 ? (
                        <div className="dropdown-empty">
                          <div className="dropdown-empty-icon">
                            <CheckCircle2 size={18} strokeWidth={2} />
                          </div>
                          <span className="dropdown-empty-text">No pending follow-ups</span>
                        </div>
                      ) : (
                        <div className="alert-list">
                          {alerts.slice(0, 6).map((alert) => (
                            <div key={alert.leadId} className={`alert-item ${alert.overdue ? 'overdue' : 'upcoming'}`}>
                              <div className={`alert-dot ${alert.overdue ? 'overdue' : 'upcoming'}`} />
                              <div className="alert-info">
                                <div className="alert-name">{alert.name}</div>
                                <div className="alert-meta">
                                  {alert.phone} · {new Date(alert.followUpDate).toLocaleString('en-IN', {
                                    day: '2-digit', month: 'short',
                                    hour: '2-digit', minute: '2-digit',
                                  })}
                                </div>
                              </div>
                              <span className={`alert-tag ${alert.overdue ? 'overdue' : 'upcoming'}`}>
                                {alert.overdue ? 'Overdue' : 'Today'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="dropdown-footer" onClick={() => { setShowDropdown(false); navigate('/agent/my-leads'); }}>
                        See all leads <ChevronRight size={13} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* User pill */}
            <div className="user-pill">
              <div className="user-avatar">
                {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">{user?.role}</span>
              </div>
            </div>

            {/* Logout */}
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={14} strokeWidth={2.2} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="mobile-nav">
          {navLinks.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `mobile-link${isActive ? ' active' : ''}`}
            >
              <Icon size={13} strokeWidth={2.2} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}