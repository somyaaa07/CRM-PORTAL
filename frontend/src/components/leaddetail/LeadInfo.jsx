import { useState } from 'react';
import API from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const STATUS_COLORS = {
  'New':           'bg-blue-100 text-blue-700 border-blue-200',
  'Contacted':     'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Interested':    'bg-green-100 text-green-700 border-green-200',
  'Not Interested':'bg-red-100 text-red-700 border-red-200',
  'Follow-Up':     'bg-purple-100 text-purple-700 border-purple-200',
  'Converted':     'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Lost':          'bg-gray-100 text-gray-600 border-gray-200',
};

const PRIORITY_COLORS = {
  'High':   'text-red-600 bg-red-50',
  'Medium': 'text-yellow-600 bg-yellow-50',
  'Low':    'text-green-600 bg-green-50',
};

export default function LeadInfo({ lead, agents, onUpdate }) {
  const { addToast } = useToast();
  const { user }     = useAuth();

  const [editing, setEditing]   = useState(false);
  const [updating, setUpdating] = useState(false);
  const [form, setForm]         = useState({
    status:     lead.status,
    priority:   lead.priority,
    assignedTo: lead.assignedTo || '',
    notes:      lead.notes      || '',
  });

  const handleUpdate = async () => {
    try {
      setUpdating(true);

      // Status + notes update
      await API.put(`/leads/${lead.id}/status`, {
        status:   form.status,
        priority: form.priority,
        notes:    form.notes,
      });

      // Agent assign (admin only)
      if (user.role === 'admin' && form.assignedTo !== lead.assignedTo) {
        await API.put(`/leads/${lead.id}/assign`, {
          agentId: form.assignedTo,
        });
      }

      addToast({ message: '✅ Lead updated!', type: 'success' });
      setEditing(false);
      onUpdate(); // Parent ko refresh karo
    } catch (err) {
      addToast({ message: '❌ Update failed!', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{lead.name}</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Lead #{lead.id} • {new Date(lead.createdAt).toLocaleDateString('en-IN')}
          </p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className={`text-sm px-3 py-1.5 rounded-lg transition ${
            editing
              ? 'bg-gray-100 text-gray-600'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
        >
          {editing ? '✕ Cancel' : '✏️ Edit'}
        </button>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400 w-5">📱</span>
          <a
            href={`tel:${lead.phone}`}
            className="text-blue-600 hover:underline font-medium"
          >
            {lead.phone}
          </a>
        </div>
        {lead.email && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400 w-5">✉️</span>
            <a
              href={`mailto:${lead.email}`}
              className="text-blue-600 hover:underline"
            >
              {lead.email}
            </a>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400 w-5">🌐</span>
          <span className="text-gray-600">{lead.source || 'Manual'}</span>
        </div>
        {lead.assignedAgent && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400 w-5">🧑‍💼</span>
            <span className="text-gray-600">{lead.assignedAgent.name}</span>
          </div>
        )}
      </div>

      {/* Status + Priority Badges */}
      {!editing && (
        <div className="flex gap-2 flex-wrap mb-4">
          <span className={`text-xs px-3 py-1 rounded-full border font-medium ${STATUS_COLORS[lead.status]}`}>
            {lead.status}
          </span>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${PRIORITY_COLORS[lead.priority]}`}>
            ● {lead.priority} Priority
          </span>
        </div>
      )}

      {/* Follow-up */}
      {lead.followUpDate && !editing && (
        <div className={`text-sm px-3 py-2 rounded-lg mb-4 ${
          new Date(lead.followUpDate) < new Date()
            ? 'bg-red-50 text-red-600'
            : 'bg-purple-50 text-purple-600'
        }`}>
          📅 Follow-up: {new Date(lead.followUpDate).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
          {new Date(lead.followUpDate) < new Date() && ' ⚠️ Overdue!'}
        </div>
      )}

      {/* Notes Preview */}
      {lead.notes && !editing && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-xs font-medium text-gray-500 mb-1">📝 Notes</p>
          <p className="text-sm text-gray-700">{lead.notes}</p>
        </div>
      )}

      {/* Edit Form */}
      {editing && (
        <div className="space-y-3 border-t border-gray-100 pt-4">

          <div className="grid grid-cols-2 gap-3">
            {/* Status */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {['New','Contacted','Interested','Not Interested','Follow-Up','Converted','Lost'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Assign Agent — Admin Only */}
          {user.role === 'admin' && (
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Assign Agent
              </label>
              <select
                value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Notes
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Lead ke baare mein notes..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <button
            onClick={handleUpdate}
            disabled={updating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
          >
            {updating ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}