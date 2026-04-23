import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ClipboardList, Plus, X, Search, Filter, Trash2,
  ChevronDown, AlertCircle, SlidersHorizontal,
  CheckCircle2, PhoneOff, RefreshCw, Loader2,
} from 'lucide-react';
import API from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Pagination from '../../components/Pagination';

const PURPLE      = '#7c4dff';
const PURPLE_LIGHT = '#ede7ff';
const PURPLE_MID   = '#c4b5fd';
const BG           = '#fefafa';

/* Inject Google Fonts once */
if (typeof document !== 'undefined' && !document.getElementById('ml-fonts')) {
  const l = document.createElement('link');
  l.id   = 'ml-fonts';
  l.rel  = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap';
  document.head.appendChild(l);
}

const jost    = { fontFamily: "'Jost', sans-serif" };
const manrope = { fontFamily: "'Manrope', sans-serif" };

/* ── Status config ──────────────────────────────────────── */
const STATUS_CFG = {
  'New':            { dot: '#3b82f6', bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  'Contacted':      { dot: '#f59e0b', bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
  'Interested':     { dot: '#10b981', bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
  'Not Interested': { dot: '#ef4444', bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
  'Follow-Up':      { dot: PURPLE,    bg: PURPLE_LIGHT, text: '#5b21b6', border: PURPLE_MID },
  'Converted':      { dot: '#0d9488', bg: '#f0fdfa', text: '#134e4a', border: '#99f6e4' },
  'Lost':           { dot: '#94a3b8', bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
};

const PRIORITY_CFG = {
  'High':   { dot: '#ef4444', color: '#dc2626' },
  'Medium': { dot: '#f59e0b', color: '#d97706' },
  'Low':    { dot: '#94a3b8', color: '#64748b' },
};

const StatusBadge = ({ status }) => {
  const c = STATUS_CFG[status] || STATUS_CFG['New'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 99,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      ...manrope,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
};

const PriorityLabel = ({ priority }) => {
  const c = PRIORITY_CFG[priority] || PRIORITY_CFG['Medium'];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500, color: c.color, ...manrope }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot }} />
      {priority}
    </span>
  );
};

/* ── Shared input style ─────────────────────────────────── */
const inputStyle = {
  ...manrope,
  width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0',
  borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#1e293b',
  outline: 'none', transition: 'border-color .15s, box-shadow .15s',
  boxSizing: 'border-box',
};

export default function ManageLeads() {
  const { addToast }   = useToast();
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const urlStatus      = searchParams.get('status');

  const [leads, setLeads]               = useState([]);
  const [agents, setAgents]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [statusFilter, setStatusFilter] = useState(urlStatus || '');
  const [searchInput, setSearchInput]   = useState('');
  const [search, setSearch]             = useState('');
  const [formLoading, setFormLoading]   = useState(false);
  const [pagination, setPagination]     = useState(null);
  const [currentPage, setCurrentPage]   = useState(1);
  const [limit, setLimit]               = useState(10);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', source: 'Manual', priority: 'Medium', assignedTo: '',
  });

  useEffect(() => { if (urlStatus) setStatusFilter(urlStatus); }, [urlStatus]);

  const fetchLeads = async (page = 1, searchVal = search, filterVal = statusFilter, limitVal = limit) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page, limit: limitVal,
        ...(filterVal && { status: filterVal }),
        ...(searchVal  && { search: searchVal }),
      });
      const res = await API.get(`/leads?${params}`);
      setLeads(res.data.leads);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchAgents = async () => {
    try {
      const res = await API.get('/admin/agents');
      setAgents(res.data.agents.filter(a => a.isActive));
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchAgents(); fetchLeads(1); }, []);
  useEffect(() => { setCurrentPage(1); fetchLeads(1, search, statusFilter); }, [statusFilter]);
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput); setCurrentPage(1); fetchLeads(1, searchInput, statusFilter);
    }, 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handlePageChange = (page) => {
    setCurrentPage(page); fetchLeads(page, search, statusFilter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddLead = async () => {
    if (!form.name || !form.phone) {
      addToast({ message: 'Name and phone are required!', type: 'error' }); return;
    }
    try {
      setFormLoading(true);
      await API.post('/leads', { ...form, assignedTo: form.assignedTo || null });
      addToast({ message: 'Lead added!', type: 'success' });
      setForm({ name: '', phone: '', email: '', source: 'Manual', priority: 'Medium', assignedTo: '' });
      setShowForm(false); fetchLeads(currentPage);
    } catch { addToast({ message: 'Something went wrong!', type: 'error' }); }
    finally { setFormLoading(false); }
  };

  const handleAssign = async (leadId, agentId) => {
    try {
      await API.put(`/leads/${leadId}/assign`, { agentId });
      addToast({ message: 'Lead assigned!', type: 'success' }); fetchLeads(currentPage);
    } catch { addToast({ message: 'Error!', type: 'error' }); }
  };

  const handleDelete = async (leadId) => {
    if (!window.confirm('Delete this lead permanently?')) return;
    try {
      await API.delete(`/admin/leads/${leadId}`);
      addToast({ message: 'Lead deleted.', type: 'success' });
      if (leads.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
      else fetchLeads(currentPage);
    } catch { addToast({ message: 'Error!', type: 'error' }); }
  };

  const TH_COLS = ['#', 'Lead', 'Phone', 'Status', 'Priority', 'Assigned To', 'Actions'];

  return (
    <div style={{ ...manrope, minHeight: '100vh', background: BG, padding: 24 }}>
      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .ml-input:focus { border-color:${PURPLE} !important; box-shadow:0 0 0 3px ${PURPLE}22 !important; }
        .ml-row:hover   { background:#faf8ff !important; }
        .ml-del:hover   { background:#fef2f2 !important; color:#dc2626 !important; border-color:#fecaca !important; }
        .ml-card-btn:hover { background:${PURPLE_LIGHT} !important; border-color:${PURPLE_MID} !important; }
      `}</style>

      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <div style={{ background: PURPLE, borderRadius: 12, padding: 10, display: 'flex' }}>
              <ClipboardList size={20} color="#fff" />
            </div>
            <h1 style={{ ...jost, fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Manage Leads
            </h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: 13, margin: 0, paddingLeft: 4 }}>
            {pagination?.totalLeads ?? 0} total leads in the system
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            ...manrope,
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '10px 18px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
            ...(showForm
              ? { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }
              : { background: PURPLE, color: '#fff', border: `1px solid ${PURPLE}`, boxShadow: `0 4px 14px ${PURPLE}40` }
            ),
          }}
        >
          {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add Lead</>}
        </button>
      </div>

      {/* ── Add Lead Form ────────────────────────────────────── */}
      {showForm && (
        <div style={{
          background: '#fff', border: `1px solid ${PURPLE_MID}`, borderRadius: 20, padding: 20, marginBottom: 20,
          boxShadow: `0 4px 20px ${PURPLE}0d`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Plus size={15} color={PURPLE} />
            <span style={{ ...jost, fontSize: 14, fontWeight: 600, color: '#1e293b' }}>New Lead</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
            {[
              { ph: 'Full Name *',  key: 'name'  },
              { ph: 'Phone *',      key: 'phone' },
              { ph: 'Email',        key: 'email' },
              { ph: 'Source',       key: 'source'},
            ].map(({ ph, key }) => (
              <input key={key} placeholder={ph} value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="ml-input" style={inputStyle} />
            ))}

            {/* Priority */}
            <div style={{ position: 'relative' }}>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                className="ml-input" style={{ ...inputStyle, paddingRight: 36, appearance: 'none' }}>
                {['Low','Medium','High'].map(p => <option key={p} value={p}>{p} Priority</option>)}
              </select>
              <ChevronDown size={13} color="#94a3b8" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>

            {/* Agent */}
            <div style={{ position: 'relative' }}>
              <select value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                className="ml-input" style={{ ...inputStyle, paddingRight: 36, appearance: 'none' }}>
                <option value="">Assign to Agent</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <ChevronDown size={13} color="#94a3b8" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={handleAddLead} disabled={formLoading} style={{
              ...manrope, display: 'inline-flex', alignItems: 'center', gap: 7,
              background: formLoading ? '#a78bfa' : PURPLE, color: '#fff',
              border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: formLoading ? 'not-allowed' : 'pointer',
              boxShadow: `0 3px 10px ${PURPLE}33`, transition: 'background .15s',
            }}>
              {formLoading
                ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Adding…</>
                : <><CheckCircle2 size={13} /> Add Lead</>
              }
            </button>
            <button onClick={() => setShowForm(false)} style={{ ...manrope, background: 'none', border: 'none', fontSize: 13, color: '#94a3b8', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Filters Card ─────────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: 16, marginBottom: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>

          {/* Search */}
          <div style={{ flex: '1 1 200px', position: 'relative' }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input type="text" placeholder="Search by name or phone…" value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="ml-input" style={{ ...inputStyle, paddingLeft: 36 }} />
          </div>

          {/* Status */}
          <div style={{ position: 'relative', minWidth: 160 }}>
            <Filter size={13} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="ml-input" style={{ ...inputStyle, paddingLeft: 34, paddingRight: 32, appearance: 'none' }}>
              <option value="">All Status</option>
              {Object.keys(STATUS_CFG).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={13} color="#94a3b8" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>

          {/* Per page */}
          <div style={{ position: 'relative', minWidth: 130 }}>
            <SlidersHorizontal size={13} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <select value={limit} onChange={e => { const v = Number(e.target.value); setLimit(v); setCurrentPage(1); fetchLeads(1, search, statusFilter, v); }}
              className="ml-input" style={{ ...inputStyle, paddingLeft: 34, paddingRight: 32, appearance: 'none' }}>
              {[10,25,50,100].map(l => <option key={l} value={l}>{l} per page</option>)}
            </select>
            <ChevronDown size={13} color="#94a3b8" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Active filter pill */}
        {statusFilter && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
            <AlertCircle size={13} color={PURPLE} />
            <span style={{ fontSize: 12, color: '#64748b', ...manrope }}>
              Showing <strong style={{ color: PURPLE }}>"{statusFilter}"</strong> leads
            </span>
            <button onClick={() => setStatusFilter('')} style={{
              marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 12, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', ...manrope,
            }}>
              <X size={12} /> Clear
            </button>
          </div>
        )}
      </div>

      {/* ── Table ────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12, color: '#94a3b8' }}>
          <Loader2 size={28} color={PURPLE} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: 13, ...manrope }}>Loading leads…</span>
        </div>
      ) : leads.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12, color: '#cbd5e1' }}>
          <PhoneOff size={36} color="#e2e8f0" />
          <span style={{ fontSize: 13, color: '#94a3b8', ...manrope }}>No leads found</span>
          {statusFilter && (
            <button onClick={() => setStatusFilter('')} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: PURPLE,
              background: 'none', border: 'none', cursor: 'pointer', ...manrope,
            }}>
              <RefreshCw size={12} /> Clear filter
            </button>
          )}
        </div>
      ) : (
        <>
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', ...manrope }}>
                <thead>
                  <tr style={{ background: '#faf8ff', borderBottom: `2px solid ${PURPLE_LIGHT}` }}>
                    {TH_COLS.map(h => (
                      <th key={h} style={{
                        ...jost, padding: '13px 16px', textAlign: 'left',
                        fontSize: 11, fontWeight: 600, color: '#7c3aed',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, index) => (
                    <tr key={lead.id} className="ml-row"
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: statusFilter && lead.status === statusFilter ? '#faf8ff' : '#fff',
                        transition: 'background .12s',
                      }}>
                      {/* # */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                          {(currentPage - 1) * limit + index + 1}
                        </span>
                      </td>

                      {/* Lead */}
                      <td style={{ padding: '14px 16px' }}>
                        <p onClick={() => navigate(`/leads/${lead.id}`)}
                          style={{ ...jost, fontWeight: 600, color: PURPLE, fontSize: 13, margin: 0, cursor: 'pointer', textDecoration: 'underline', textDecorationColor: `${PURPLE}44`, textUnderlineOffset: 3 }}>
                          {lead.name}
                        </p>
                        {lead.email && <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{lead.email}</p>}
                      </td>

                      {/* Phone */}
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#475569', fontWeight: 500 }}>
                        {lead.phone}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge status={lead.status} />
                      </td>

                      {/* Priority */}
                      <td style={{ padding: '14px 16px' }}>
                        <PriorityLabel priority={lead.priority} />
                      </td>

                      {/* Assign */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <select value={lead.assignedTo || ''} onChange={e => handleAssign(lead.id, e.target.value)}
                            className="ml-input" style={{
                              ...manrope, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8,
                              padding: '5px 28px 5px 10px', fontSize: 12, color: '#475569', appearance: 'none', cursor: 'pointer',
                            }}>
                            <option value="">Unassigned</option>
                            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                          </select>
                          <ChevronDown size={11} color="#94a3b8" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        </div>
                      </td>

                      {/* Delete */}
                      <td style={{ padding: '14px 16px' }}>
                        <button onClick={() => handleDelete(lead.id)} className="ml-del"
                          style={{
                            ...manrope, display: 'inline-flex', alignItems: 'center', gap: 5,
                            fontSize: 12, color: '#94a3b8', background: '#f8fafc', border: '1px solid #e2e8f0',
                            borderRadius: 8, padding: '5px 12px', cursor: 'pointer', transition: 'all .15s',
                          }}>
                          <Trash2 size={12} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
}