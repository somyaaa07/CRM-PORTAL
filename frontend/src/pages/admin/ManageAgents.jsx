import { useState, useEffect } from 'react';
import {
  Users, UserPlus, Key, Ban, CheckCircle2, Phone,
  TrendingUp, Target, X, Eye, EyeOff,
  Shield, AlertCircle, Loader2, UserCheck, UserX, Sparkles
} from 'lucide-react';
import API from '../../api/axios';
import { useToast } from '../../context/ToastContext';

/* ── Google Fonts injection ── */
const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Jost:wght@300;400;500;600&display=swap');
`;

/* ── Avatar gradient pool ── */
const GRADIENTS = [
  ['#7c3aed', '#a855f7'],
  ['#2563eb', '#7c3aed'],
  ['#059669', '#10b981'],
  ['#dc2626', '#f97316'],
  ['#0891b2', '#6366f1'],
];
const avatarGrad = (name) => GRADIENTS[name.charCodeAt(0) % GRADIENTS.length];

/* ── Stat box ── */
function StatBox({ icon: Icon, value, label, color }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-4">
      <span style={{ color, fontFamily: 'Manrope, sans-serif' }}
        className="text-base font-bold flex items-center gap-1">
        <Icon size={12} strokeWidth={2.5} />
        {value ?? '—'}
      </span>
      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-medium"
        style={{ fontFamily: 'Jost, sans-serif' }}>{label}</span>
    </div>
  );
}

/* ── Field label ── */
function Label({ children }) {
  return (
    <label className="text-[11px] font-semibold uppercase tracking-widest text-violet-500"
      style={{ fontFamily: 'Jost, sans-serif' }}>
      {children}
    </label>
  );
}

/* ── Input ── */
function StyledInput({ className = '', ...props }) {
  return (
    <input
      {...props}
      style={{ fontFamily: 'Jost, sans-serif' }}
      className={`w-full bg-white/80 border border-violet-100 rounded-xl px-4 py-2.5 text-sm text-gray-700
        placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400
        transition-all duration-200 ${className}`}
    />
  );
}

/* ── Password input ── */
function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <StyledInput
        type={show ? 'text' : 'password'}
        value={value} onChange={onChange} placeholder={placeholder}
        className="pr-10"
      />
      <button type="button" onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-300 hover:text-violet-500 transition">
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

/* ── Summary card ── */
function SummaryCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-white/70 backdrop-blur-sm border border-white rounded-2xl p-4
      flex items-center gap-3 shadow-sm shadow-violet-100/40">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${accent}18` }}>
        <Icon size={18} style={{ color: accent }} strokeWidth={2} />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium" style={{ fontFamily: 'Jost, sans-serif' }}>{label}</p>
        <p className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Manrope, sans-serif' }}>{value}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
export default function ManageAgents() {
  const { addToast } = useToast();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [resetModal, setResetModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/agents');
      setAgents(res.data.agents);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAgents(); }, []);

  const handleAddAgent = async () => {
    if (!form.name || !form.email || !form.password) {
      addToast({ message: 'All fields are required.', type: 'error' }); return;
    }
    try {
      setFormLoading(true);
      await API.post('/admin/agents', form);
      addToast({ message: 'Agent created successfully!', type: 'success' });
      setForm({ name: '', email: '', password: '' });
      setShowForm(false);
      fetchAgents();
    } catch (err) {
      addToast({ message: err.response?.data?.message || 'Something went wrong.', type: 'error' });
    } finally { setFormLoading(false); }
  };

  const handleToggle = async (agentId, currentStatus) => {
    setTogglingId(agentId);
    try {
      await API.put(`/admin/agents/${agentId}/toggle`);
      addToast({ message: `Agent ${currentStatus ? 'deactivated' : 'activated'}.`, type: 'success' });
      fetchAgents();
    } catch { addToast({ message: 'Failed to update status.', type: 'error' }); }
    finally { setTogglingId(null); }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      addToast({ message: 'Password must be at least 6 characters.', type: 'error' }); return;
    }
    try {
      await API.put(`/admin/agents/${resetModal.agentId}/password`, { newPassword });
      addToast({ message: 'Password reset successfully.', type: 'success' });
      setResetModal(null); setNewPassword('');
    } catch { addToast({ message: 'Failed to reset password.', type: 'error' }); }
  };

  const activeCount   = agents.filter(a => a.isActive).length;
  const inactiveCount = agents.length - activeCount;

  return (
    <>
      <style>{`
        ${FONTS}
        .page-bg { background-color: #f5f3ff; }
        @keyframes slideDown { from { opacity:0; transform:translateY(-14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeUp    { from { opacity:0; transform:translateY(12px);  } to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn   { from { opacity:0; transform:scale(.93);        } to { opacity:1; transform:scale(1);    } }
        .anim-slide { animation: slideDown .28s cubic-bezier(.16,1,.3,1) both; }
        .anim-fade  { animation: fadeUp   .32s cubic-bezier(.16,1,.3,1) both; }
        .anim-scale { animation: scaleIn  .22s cubic-bezier(.16,1,.3,1) both; }
        .card-hover { transition: box-shadow .2s, border-color .2s, transform .18s; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(124,58,237,.10); }
        .btn-violet {
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          box-shadow: 0 4px 14px rgba(124,58,237,.30);
          transition: all .2s;
        }
        .btn-violet:hover { box-shadow: 0 6px 22px rgba(124,58,237,.42); filter: brightness(1.06); }
        .divider-v { width:1px; background: linear-gradient(to bottom,transparent,#ddd6fe,transparent); align-self:stretch; }
        .scrollbar-hide::-webkit-scrollbar { display:none; }
      `}</style>

      <div className="page-bg min-h-screen p-5 sm:p-8" style={{ fontFamily: 'Jost, sans-serif' }}>
        <div className=" mx-auto">

          {/* ── Page Header ── */}
          <div className="mb-8 anim-fade">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={13} className="text-violet-400" />
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest"
                style={{ fontFamily: 'Jost, sans-serif' }}>Admin Panel</span>
            </div>
            <h1 className="text-[2rem] font-extrabold text-gray-900 tracking-tight leading-tight"
              style={{ fontFamily: 'Manrope, sans-serif' }}>
              Agent Management
            </h1>
            <p className="text-sm text-gray-400 mt-1 font-normal">
              Create, manage and monitor your sales team.
            </p>
          </div>

          {/* ── Summary Strip ── */}
          <div className="grid grid-cols-3 gap-3 mb-7 anim-fade" style={{ animationDelay: '60ms' }}>
            <SummaryCard icon={Users}     label="Total Agents" value={agents.length} accent="#7c3aed" />
            <SummaryCard icon={UserCheck} label="Active"       value={activeCount}   accent="#059669" />
            <SummaryCard icon={UserX}     label="Inactive"     value={inactiveCount} accent="#dc2626" />
          </div>

          {/* ── Toolbar ── */}
          <div className="flex justify-end mb-4 anim-fade" style={{ animationDelay: '100ms' }}>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-violet flex items-center gap-2 text-sm font-semibold px-5 py-2.5
                rounded-xl text-white"
              style={{ fontFamily: 'Jost, sans-serif' }}
            >
              {showForm ? <><X size={15} /> Cancel</> : <><UserPlus size={15} /> Add Agent</>}
            </button>
          </div>

          {/* ── Add Agent Form ── */}
          {showForm && (
            <div className="anim-slide bg-white/80 backdrop-blur-md border border-violet-100
              rounded-2xl shadow-lg shadow-violet-100/50 p-6 mb-5">

              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center shadow-sm">
                  <UserPlus size={14} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-base"
                  style={{ fontFamily: 'Manrope, sans-serif' }}>New Agent</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div className="flex flex-col gap-1.5">
                  <Label>Full Name</Label>
                  <StyledInput
                    placeholder="e.g. Sarah Johnson"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Email Address</Label>
                  <StyledInput
                    type="email" placeholder="agent@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Password</Label>
                  <PasswordInput
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 6 characters"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-violet-50">
                <button
                  onClick={handleAddAgent}
                  disabled={formLoading}
                  className="btn-violet flex items-center gap-2 text-white text-sm font-semibold
                    px-5 py-2.5 rounded-xl disabled:opacity-50"
                  style={{ fontFamily: 'Jost, sans-serif' }}
                >
                  {formLoading
                    ? <><Loader2 size={14} className="animate-spin" /> Creating…</>
                    : <><CheckCircle2 size={14} /> Create Agent</>}
                </button>
                <p className="text-xs text-gray-400">All fields are required.</p>
              </div>
            </div>
          )}

          {/* ── Agents List ── */}
          {loading ? (
            <div className="flex flex-col items-center py-28 gap-3 text-violet-300">
              <Loader2 size={32} className="animate-spin" />
              <p className="text-sm font-medium text-gray-400" style={{ fontFamily: 'Jost, sans-serif' }}>Loading agents…</p>
            </div>
          ) : agents.length === 0 ? (
            <div className="flex flex-col items-center py-28 gap-3 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-1">
                <Users size={28} className="text-violet-300" />
              </div>
              <p className="font-bold text-gray-700 text-base" style={{ fontFamily: 'Manrope, sans-serif' }}>No agents yet</p>
              <p className="text-sm text-gray-400">Add your first agent to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {agents.map((agent, i) => {
                const [g1, g2] = avatarGrad(agent.name);
                return (
                  <div
                    key={agent.id}
                    className={`card-hover bg-white/75 backdrop-blur-sm rounded-2xl border
                      ${agent.isActive ? 'border-white' : 'border-red-100 bg-red-50/20'}`}
                    style={{ animationDelay: `${i * 45}ms` }}
                  >
                    <div className="flex items-center gap-4 p-4">

                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white
                          text-base font-extrabold"
                          style={{
                            background: `linear-gradient(135deg, ${g1}, ${g2})`,
                            fontFamily: 'Manrope, sans-serif',
                            boxShadow: `0 4px 14px ${g1}50`
                          }}>
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full
                          border-2 border-white
                          ${agent.isActive ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                      </div>

                      {/* Name / Email */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-900 text-sm truncate"
                            style={{ fontFamily: 'Manrope, sans-serif' }}>
                            {agent.name}
                          </p>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold
                            px-2 py-0.5 rounded-full border
                            ${agent.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-red-50 text-red-500 border-red-100'}`}>
                            {agent.isActive
                              ? <><UserCheck size={9} /> Active</>
                              : <><UserX size={9} /> Inactive</>}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{agent.email}</p>
                      </div>

                      {/* Stats — desktop */}
                      <div className="hidden md:flex items-center">
                        <div className="divider-v mx-3" />
                        <StatBox icon={Target}     value={agent.totalLeads}     label="Leads"     color="#6d28d9" />
                        <div className="divider-v mx-1" />
                        <StatBox icon={TrendingUp} value={agent.convertedLeads} label="Converted" color="#059669" />
                        <div className="divider-v mx-1" />
                        <StatBox icon={Phone}      value={agent.totalCalls}     label="Calls"     color="#2563eb" />
                        <div className="divider-v mx-3" />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setResetModal({ agentId: agent.id, name: agent.name })}
                          className="flex items-center gap-1.5 text-xs font-semibold bg-violet-50
                            hover:bg-violet-100 text-violet-700 border border-violet-100
                            hover:border-violet-200 px-3 py-2 rounded-xl transition-all"
                          style={{ fontFamily: 'Jost, sans-serif' }}
                        >
                          <Key size={12} />
                          <span className="hidden sm:inline">Reset</span>
                        </button>

                        <button
                          onClick={() => handleToggle(agent.id, agent.isActive)}
                          disabled={togglingId === agent.id}
                          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2
                            rounded-xl border transition-all disabled:opacity-50
                            ${agent.isActive
                              ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-100 hover:border-red-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-100 hover:border-emerald-200'}`}
                          style={{ fontFamily: 'Jost, sans-serif' }}
                        >
                          {togglingId === agent.id
                            ? <Loader2 size={12} className="animate-spin" />
                            : agent.isActive
                              ? <><Ban size={12} /><span className="hidden sm:inline">Deactivate</span></>
                              : <><CheckCircle2 size={12} /><span className="hidden sm:inline">Activate</span></>}
                        </button>
                      </div>
                    </div>

                    {/* Stats — mobile */}
                    <div className="flex md:hidden items-center justify-around border-t border-gray-50 py-3 px-4">
                      <StatBox icon={Target}     value={agent.totalLeads}     label="Leads"     color="#6d28d9" />
                      <div className="divider-v" />
                      <StatBox icon={TrendingUp} value={agent.convertedLeads} label="Converted" color="#059669" />
                      <div className="divider-v" />
                      <StatBox icon={Phone}      value={agent.totalCalls}     label="Calls"     color="#2563eb" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ══ Reset Password Modal ══ */}
      {resetModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="anim-scale bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            style={{ fontFamily: 'Jost, sans-serif' }}>

            {/* Header */}
            <div className="relative px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <Key size={17} className="text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base leading-tight"
                    style={{ fontFamily: 'Manrope, sans-serif' }}>Reset Password</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{resetModal.name}</p>
                </div>
              </div>
              <button
                onClick={() => { setResetModal(null); setNewPassword(''); }}
                className="absolute top-5 right-5 w-7 h-7 rounded-lg hover:bg-gray-100
                  flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
              >
                <X size={14} />
              </button>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-amber-100 to-transparent mx-6" />

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-3.5">
                <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  The agent will need to use this new password on their next login session.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>New Password</Label>
                <PasswordInput
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                />
                {newPassword.length > 0 && newPassword.length < 6 && (
                  <p className="text-xs text-red-400 flex items-center gap-1 mt-0.5">
                    <AlertCircle size={11} /> At least 6 characters required
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => { setResetModal(null); setNewPassword(''); }}
                className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5
                  rounded-xl text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                className="btn-violet flex-1 flex items-center justify-center gap-2
                  text-white py-2.5 rounded-xl text-sm font-semibold"
              >
                <Shield size={14} />
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}