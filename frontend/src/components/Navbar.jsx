import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAlerts } from '../context/AlertContext';
import {
  LayoutDashboard, ClipboardList, BarChart2, Phone,
  Users, Upload, Bell, LogOut, AlertTriangle,
  CalendarClock, CheckCircle2, ChevronRight, ChevronLeft,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';

/* ─── Design tokens ─────────────────────────────────────────────────── */
const purple     = '#7c4dff';
const purpleDark = '#5722cc';
const ink        = '#0b0715';
const font       = "'Manrope', sans-serif";

export default function Navbar() {
  const { user, logout }       = useAuth();
  const { alertStats, alerts } = useAlerts();
  const navigate               = useNavigate();
  const [collapsed, setCollapsed]       = useState(false);
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
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

        .sidebar {
          font-family: ${font};
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #ffffff;
          border-right: 1px solid rgba(11,7,21,0.07);
          position: sticky;
          top: 0;
          z-index: 100;
          transition: width 0.22s cubic-bezier(.4,0,.2,1);
          overflow: hidden;
          flex-shrink: 0;
        }

        .sidebar.expanded { width: 220px; }
        .sidebar.collapsed { width: 64px; }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px;
          height: 60px;
          border-bottom: 1px solid rgba(11,7,21,0.07);
          flex-shrink: 0;
        }

        .sidebar.collapsed .sidebar-header {
          justify-content: center;
          padding: 0;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 9px;
          text-decoration: none;
          overflow: hidden;
          white-space: nowrap;
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
          font-size: 0.92rem;
          font-weight: 800;
          color: ${ink};
          letter-spacing: -0.02em;
          transition: opacity 0.15s, width 0.22s;
          overflow: hidden;
        }

        .sidebar.collapsed .logo-text { opacity: 0; width: 0; }
        .sidebar.expanded  .logo-text { opacity: 1; width: auto; }

        .collapse-btn {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          border: 1px solid rgba(11,7,21,0.09);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: rgba(11,7,21,0.35);
          flex-shrink: 0;
          transition: background 0.15s, color 0.15s;
        }

        .collapse-btn:hover {
          background: rgba(11,7,21,0.05);
          color: ${ink};
        }

        .sidebar.collapsed .collapse-btn { display: none; }

        .expand-btn {
          display: none;
          width: 34px;
          height: 34px;
          border-radius: 9px;
          border: 1px solid rgba(11,7,21,0.09);
          background: transparent;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: rgba(11,7,21,0.35);
          transition: background 0.15s, color 0.15s;
        }

        .sidebar.collapsed .expand-btn { display: flex; }

        .expand-btn:hover {
          background: rgba(124,77,255,0.08);
          color: ${purple};
          border-color: rgba(124,77,255,0.2);
        }

        .sidebar-nav {
          flex: 1;
          padding: 10px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
          scrollbar-width: none;
        }

        .sidebar-nav::-webkit-scrollbar { display: none; }

        .nav-section-label {
          font-size: 0.6rem;
          font-weight: 700;
          color: rgba(11,7,21,0.25);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 8px 8px 4px;
          white-space: nowrap;
          overflow: hidden;
          transition: opacity 0.15s;
        }

        .sidebar.collapsed .nav-section-label { opacity: 0; height: 0; padding: 0; }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 9px;
          font-size: 0.8rem;
          font-weight: 600;
          color: rgba(11,7,21,0.45);
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
          overflow: hidden;
          position: relative;
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
        .nav-link svg { flex-shrink: 0; }

        .nav-link-label {
          overflow: hidden;
          white-space: nowrap;
          transition: opacity 0.15s, width 0.22s, max-width 0.22s;
        }

        .sidebar.expanded  .nav-link-label { opacity: 1; max-width: 200px; }
        .sidebar.collapsed .nav-link-label { opacity: 0; max-width: 0; width: 0; }

        .nav-link.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: ${purple};
          border-radius: 0 3px 3px 0;
        }

        .sidebar.collapsed .nav-link {
          justify-content: center;
          padding: 9px 0;
        }

        .sidebar-footer {
          padding: 10px;
          border-top: 1px solid rgba(11,7,21,0.07);
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-shrink: 0;
        }

        .bell-row { position: relative; }

        .bell-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 9px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: rgba(11,7,21,0.45);
          font-family: ${font};
          font-size: 0.8rem;
          font-weight: 600;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
          overflow: hidden;
          position: relative;
        }

        .bell-btn:hover {
          background: rgba(11,7,21,0.04);
          color: ${ink};
        }

        .bell-btn.has-alert {
          color: ${purple};
          background: rgba(124,77,255,0.06);
        }

        .sidebar.collapsed .bell-btn {
          justify-content: center;
          padding: 9px 0;
        }

        .bell-icon-wrap { position: relative; flex-shrink: 0; }

        .bell-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          font-size: 0.5rem;
          font-weight: 800;
          font-family: ${font};
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #fff;
        }

        .bell-badge.overdue  { background: #dc2626; }
        .bell-badge.upcoming { background: #ea580c; }

        .bell-btn-label {
          overflow: hidden;
          transition: opacity 0.15s, max-width 0.22s;
        }

        .sidebar.expanded  .bell-btn-label { opacity: 1; max-width: 200px; }
        .sidebar.collapsed .bell-btn-label { opacity: 0; max-width: 0; width: 0; }

        .bell-dropdown {
          position: absolute;
          left: calc(100% + 12px);
          bottom: 0;
          width: 300px;
          background: #fff;
          border: 1px solid rgba(11,7,21,0.09);
          border-radius: 14px;
          box-shadow: 0 16px 48px rgba(11,7,21,0.13);
          z-index: 200;
          overflow: hidden;
        }

        .sidebar.expanded .bell-dropdown {
          left: 0;
          bottom: calc(100% + 8px);
          width: 100%;
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
          font-family: ${font};
        }

        .dropdown-count {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
          font-family: ${font};
        }

        .dropdown-count.overdue  { background: #fee2e2; color: #dc2626; }
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
          width: 36px; height: 36px;
          background: rgba(22,163,74,0.1);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #16a34a;
        }

        .dropdown-empty-text {
          font-size: 0.78rem; font-weight: 500;
          color: rgba(11,7,21,0.4); font-family: ${font};
        }

        .alert-list { max-height: 240px; overflow-y: auto; }

        .alert-item {
          padding: 0.7rem 1rem;
          border-bottom: 1px solid rgba(11,7,21,0.05);
          display: flex;
          align-items: flex-start;
          gap: 10px;
          cursor: pointer;           /* ← NEW */
          transition: background 0.15s; /* ← NEW */
        }

        .alert-item:last-child { border-bottom: none; }
        .alert-item.overdue  { background: rgba(220,38,38,0.03); }
        .alert-item.upcoming { background: rgba(234,88,12,0.02); }

        /* ← NEW: Hover effect on alert items */
        .alert-item:hover {
          background: rgba(124,77,255,0.05) !important;
        }

        .alert-dot {
          width: 7px; height: 7px; border-radius: 50%;
          margin-top: 5px; flex-shrink: 0;
        }

        .alert-dot.overdue  { background: #dc2626; }
        .alert-dot.upcoming { background: #ea580c; }

        .alert-info { flex: 1; min-width: 0; }

        .alert-name {
          font-size: 0.78rem; font-weight: 600; color: ${ink};
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          font-family: ${font};
        }

        .alert-meta {
          font-size: 0.68rem; font-weight: 400;
          color: rgba(11,7,21,0.4); margin-top: 2px; font-family: ${font};
        }

        .alert-tag {
          font-size: 0.62rem; font-weight: 700;
          padding: 2px 7px; border-radius: 20px;
          white-space: nowrap; flex-shrink: 0; font-family: ${font};
        }

        .alert-tag.overdue  { background: #fee2e2; color: #dc2626; }
        .alert-tag.upcoming { background: #ffedd5; color: #ea580c; }

        .dropdown-footer {
          padding: 0.7rem 1rem;
          border-top: 1px solid rgba(11,7,21,0.07);
          display: flex; align-items: center; justify-content: center; gap: 5px;
          font-size: 0.72rem; font-weight: 600; color: ${purple};
          cursor: pointer; transition: background 0.15s; font-family: ${font};
        }

        .dropdown-footer:hover { background: rgba(124,77,255,0.05); }

        .user-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 10px;
          border: 1px solid rgba(11,7,21,0.08);
          border-radius: 11px;
          background: rgba(11,7,21,0.02);
          overflow: hidden;
        }

        .sidebar.collapsed .user-pill {
          padding: 7px 0;
          justify-content: center;
          border-color: transparent;
          background: transparent;
        }

        .user-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, ${purple}, ${purpleDark});
          display: flex; align-items: center; justify-content: center;
          font-size: 0.6rem; font-weight: 800; color: #fff; flex-shrink: 0;
        }

        .user-info {
          display: flex; flex-direction: column; line-height: 1.2;
          overflow: hidden;
          transition: opacity 0.15s, max-width 0.22s;
        }

        .sidebar.expanded  .user-info { opacity: 1; max-width: 160px; }
        .sidebar.collapsed .user-info { opacity: 0; max-width: 0; width: 0; }

        .user-name {
          font-size: 0.75rem; font-weight: 700; color: ${ink};
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .user-role {
          font-size: 0.62rem; font-weight: 500;
          color: rgba(11,7,21,0.38); text-transform: capitalize;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 10px;
          border-radius: 9px;
          border: 1px solid rgba(220,38,38,0.15);
          background: rgba(220,38,38,0.04);
          color: #dc2626;
          font-family: ${font};
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          white-space: nowrap;
          overflow: hidden;
        }

        .logout-btn:hover {
          background: rgba(220,38,38,0.09);
          border-color: rgba(220,38,38,0.3);
        }

        .sidebar.collapsed .logout-btn {
          justify-content: center;
          padding: 9px 0;
          border-color: transparent;
          background: transparent;
        }

        .logout-btn-label {
          overflow: hidden;
          transition: opacity 0.15s, max-width 0.22s;
        }

        .sidebar.expanded  .logout-btn-label { opacity: 1; max-width: 200px; }
        .sidebar.collapsed .logout-btn-label { opacity: 0; max-width: 0; width: 0; }

 /* MOBILE TOP BAR */
      .mobile-topbar {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 56px;
        background: #fff;
        border-bottom: 1px solid rgba(0,0,0,0.05);
        z-index: 1000;
        padding: 0 12px;
        align-items: center;
        justify-content: space-between;
      }

      .mobile-user {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .mobile-user-name {
        font-size: 12px;
        font-weight: 600;
      }

      .mobile-logout {
        border: none;
        background: #fee2e2;
        padding: 6px;
        border-radius: 6px;
        color: red;
      }


        /* ── Mobile bottom bar (≤ 640px) ── */
        .mobile-bar {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          height: 58px;
          background: #fff;
          border-top: 1px solid rgba(11,7,21,0.07);
          z-index: 110;
          padding: 0 6px;
          align-items: center;
          justify-content: space-around;
          gap: 2px;
        }

        .mobile-link {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          padding: 6px 4px;
          border-radius: 9px;
          text-decoration: none;
          font-size: 0.6rem;
          font-weight: 600;
          color: rgba(11,7,21,0.4);
          transition: color 0.15s, background 0.15s;
        }

        .mobile-link:hover  { color: ${ink}; }
        .mobile-link.active { color: ${purple}; background: rgba(124,77,255,0.08); }

        @media (max-width: 640px) {
          .sidebar     { display: none; }
          .mobile-bar  { display: flex; }
          .mobile-topbar { display: flex; }
        body { padding-top: 56px; padding-bottom: 60px; }

        }
      `}</style>

      {/* ── Sidebar ── */}
      <nav className={`sidebar ${collapsed ? 'collapsed' : 'expanded'}`}>

        {/* Header */}
        <div className="sidebar-header">
          {!collapsed && (
            <>
              <NavLink to="/" className="nav-logo">
                <div className="logo-icon">
                  <Phone size={16} color="#fff" strokeWidth={2.2} />
                </div>
                <span className="logo-text">CRM Portal</span>
              </NavLink>
              <button
                className="collapse-btn"
                onClick={() => setCollapsed(true)}
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose size={14} strokeWidth={2.2} />
              </button>
            </>
          )}
          {collapsed && (
            <button
              className="expand-btn"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen size={16} strokeWidth={2.2} />
            </button>
          )}
        </div>

        {/* Nav links */}
        <div className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {navLinks.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={16} strokeWidth={2.2} />
              <span className="nav-link-label">{label}</span>
            </NavLink>
          ))}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">

          {/* Bell — agent only */}
          {user?.role === 'agent' && (
            <div className="bell-row">
              <button
                className={`bell-btn${alertStats.total > 0 ? ' has-alert' : ''}`}
                onClick={() => setShowDropdown(!showDropdown)}
                aria-label="Notifications"
                title={collapsed ? 'Notifications' : undefined}
              >
                <span className="bell-icon-wrap">
                  <Bell size={16} strokeWidth={2.2} />
                  {alertStats.total > 0 && (
                    <span className={`bell-badge ${alertStats.overdue > 0 ? 'overdue' : 'upcoming'}`}>
                      {alertStats.total > 9 ? '9+' : alertStats.total}
                    </span>
                  )}
                </span>
                <span className="bell-btn-label">Alerts</span>
                {!collapsed && alertStats.total > 0 && (
                  <span
                    className={`dropdown-count ${alertStats.overdue > 0 ? 'overdue' : 'upcoming'}`}
                    style={{ marginLeft: 'auto' }}
                  >
                    {alertStats.total}
                  </span>
                )}
              </button>

              {showDropdown && (
                <>
                  {/* Backdrop */}
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                    onClick={() => setShowDropdown(false)}
                  />

                  <div className="bell-dropdown">
                    {/* Dropdown Header */}
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

                    {/* Empty state */}
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
                          <div
                            key={alert.leadId}
                            className={`alert-item ${alert.overdue ? 'overdue' : 'upcoming'}`}
                            onClick={() => {
                              // ✅ FIX: Specific lead pe navigate karo
                              setShowDropdown(false);
                              navigate(`/leads/${alert.leadId}`);
                            }}
                          >
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

                    {/* Footer — See all */}
                    <div
                      className="dropdown-footer"
                      onClick={() => {
                        setShowDropdown(false);
                        navigate('/agent/my-leads');
                      }}
                    >
                      See all leads <ChevronRight size={13} />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* User pill */}
          <div className="user-pill" title={collapsed ? user?.name : undefined}>
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>

          {/* Logout */}
          <button
            className="logout-btn"
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut size={15} strokeWidth={2.2} style={{ flexShrink: 0 }} />
            <span className="logout-btn-label">Logout</span>
          </button>
        </div>
      </nav>


 {/* MOBILE TOP */}
      <div className="mobile-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* <Phone size={16} /> */}
          <b>CRM</b>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="mobile-user">
            <div className="user-avatar">{initials}</div>
            {/* <span className="mobile-user-name">{user?.name}</span> */}
          </div>

          <button className="mobile-logout" onClick={handleLogout}>
            <LogOut size={16} />
          </button>
        </div>
      </div>


      {/* ── Mobile bottom bar ── */}
      <nav className="mobile-bar">
        {navLinks.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `mobile-link${isActive ? ' active' : ''}`}
          >
            <Icon size={18} strokeWidth={2.2} />
            {label}
          </NavLink>
        ))}
        {user?.role === 'agent' && (
          <button
            className={`mobile-link${alertStats.total > 0 ? ' active' : ''}`}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', position: 'relative' }}
            onClick={() => navigate('/agent/my-leads')}
          >
            <span style={{ position: 'relative', display: 'inline-flex' }}>
              <Bell size={18} strokeWidth={2.2} />
              {alertStats.total > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 14, height: 14, borderRadius: '50%',
                  background: alertStats.overdue > 0 ? '#dc2626' : '#ea580c',
                  fontSize: '0.48rem', fontWeight: 800, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #fff',
                }}>
                  {alertStats.total > 9 ? '9+' : alertStats.total}
                </span>
              )}
            </span>
            Alerts
          </button>
        )}
      </nav>
    </>
  );
}