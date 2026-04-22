import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { useToast } from '../../context/ToastContext';

export default function ManageAgents() {
  const { addToast } = useToast();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [resetModal, setResetModal] = useState(null); // { agentId, name }
  const [newPassword, setNewPassword] = useState('');

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/agents');
      setAgents(res.data.agents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAgents(); }, []);

  const handleAddAgent = async () => {
    if (!form.name || !form.email || !form.password) {
      addToast({ message: '❌ All fields are necessary!', type: 'error' });
      return;
    }
    try {
      setFormLoading(true);
      await API.post('/admin/agents', form);
      addToast({ message: '✅ Agent added!', type: 'success' });
      setForm({ name: '', email: '', password: '' });
      setShowForm(false);
      fetchAgents();
    } catch (err) {
      addToast({
        message: err.response?.data?.message || '❌ Error !',
        type: 'error',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggle = async (agentId, currentStatus) => {
    try {
      await API.put(`/admin/agents/${agentId}/toggle`);
      addToast({
        message: `✅ Agent ${currentStatus ? 'deactivate' : 'activate'} `,
        type: 'success',
      });
      fetchAgents();
    } catch (err) {
      addToast({ message: '❌ Error !', type: 'error' });
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      addToast({ message: '❌ Password must be of 6+ characters ', type: 'error' });
      return;
    }
    try {
      await API.put(`/admin/agents/${resetModal.agentId}/password`, { newPassword });
      addToast({ message: '✅ Password is reset!', type: 'success' });
      setResetModal(null);
      setNewPassword('');
    } catch (err) {
      addToast({ message: '❌ Error !', type: 'error' });
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🧑‍💼 Manage Agents</h1>
          <p className="text-gray-500 text-sm mt-1">
            Total: {agents.length} agents
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition"
        >
          {showForm ? '✕ Cancel' : '+ Add Agent'}
        </button>
      </div>

      {/* Add Agent Form */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">➕ New Agent</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleAddAgent}
            disabled={formLoading}
            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg transition disabled:opacity-50"
          >
            {formLoading ? 'Adding...' : '✅ Add Agent'}
          </button>
        </div>
      )}

      {/* Agents List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">⏳ Loading...</div>
      ) : agents.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-2">👤</div>
          <p>No Agent is there</p>
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className={`bg-white rounded-xl border p-4 ${
                agent.isActive ? 'border-gray-200' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    agent.isActive ? 'bg-blue-500' : 'bg-gray-400'
                  }`}>
                    {agent.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800">{agent.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        agent.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {agent.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{agent.email}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-gray-800">{agent.totalLeads}</p>
                    <p className="text-xs text-gray-500">Leads</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{agent.convertedLeads}</p>
                    <p className="text-xs text-gray-500">Converted</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-600">{agent.totalCalls}</p>
                    <p className="text-xs text-gray-500">Calls</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setResetModal({ agentId: agent.id, name: agent.name })}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition"
                  >
                    🔑 Reset
                  </button>
                  <button
                    onClick={() => handleToggle(agent.id, agent.isActive)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition ${
                      agent.isActive
                        ? 'bg-red-50 hover:bg-red-100 text-red-600'
                        : 'bg-green-50 hover:bg-green-100 text-green-600'
                    }`}
                  >
                    {agent.isActive ? '🚫 Deactivate' : '✅ Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-800 mb-1">🔑 Reset Password</h3>
            <p className="text-sm text-gray-500 mb-4">{resetModal.name}</p>
            <input
              type="password"
              placeholder="New Password (6+ characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setResetModal(null); setNewPassword(''); }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}