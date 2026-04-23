import { useState } from 'react';
import API from '../api/axios';
import { useToast } from '../context/ToastContext';

const DISPOSITIONS = [
  'Answered',
  'No Answer',
  'Busy',
  'Voicemail',
  'Wrong Number',
  'Callback Requested',
];

export default function CallModal({ lead, onClose, onSaved }) {
  const { addToast } = useToast();

  // ✅ useState FIRST — always before functions
  const [form, setForm] = useState({
    disposition: '',
    notes: '',
    followUpDate: '',
    alertEnabled: false,
    callDuration: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ Fixed: backticks + PUT method
  const handleToggleAlert = async () => {
    const newStatus = !form.alertEnabled;
    try {
      await API.put(`/leads/${lead.id}/status`, {
        alertEnabled: newStatus,
      });
      setForm({ ...form, alertEnabled: newStatus });
      addToast({
        message: newStatus
          ? '🔔 Follow-up alert enabled'
          : '🔕 Follow-up alert disabled',
        type: 'success',
      });
    } catch (err) {
      addToast({
        message: '❌ Failed to update alert',
        type: 'error',
      });
    }
  };

  const handleSave = async () => {
    if (!form.disposition) {
      setError('❌ Necessary to select Disposition.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await API.post('/call-logs', {
        leadId: lead.id,
        ...form,
        callDuration: Number(form.callDuration) || 0,
      });

      if(form.followUpDate){
        await API.put(`leads/${lead.id}/status`,{
          status : 'Follow-Up',
          followUpDate : form.followUpDate,
          alertEnabled : form.alertEnabled

        })
      }

      addToast({
        message: form.followUpDate
          ? '✅ Call log saved! Follow-up set.'
          : '✅ Call log saved!',
        type: 'success',
      });

      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || '❌ Save failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">

        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-800">📋 Call Log</h2>
            <p className="text-sm text-gray-500">{lead.name} — {lead.phone}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Disposition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Call Result (Disposition) *
            </label>
            <select
              value={form.disposition}
              onChange={(e) => setForm({ ...form, disposition: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select --</option>
              {DISPOSITIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Call Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Call Duration (seconds)
            </label>
            <input
              type="number"
              placeholder="e.g. 120"
              value={form.callDuration}
              onChange={(e) => setForm({ ...form, callDuration: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              placeholder="Remark or notes ..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Follow-up Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Follow-up Date
            </label>
            <input
              type="datetime-local"
              value={form.followUpDate}
              onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Alert Toggle */}
          <div className="flex items-center justify-between bg-blue-50 rounded-lg px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-800">🔔 Follow-up Alert</p>
              <p className="text-xs text-gray-500">On Follow Up date We'll provide you the reminder</p>
            </div>
            {/* ✅ Now calls handleToggleAlert which hits the API */}
            <button
              onClick={handleToggleAlert}
              className={`w-12 h-6 rounded-full transition-colors ${
                form.alertEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${
                form.alertEnabled ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : '💾 Save Call Log'}
          </button>
        </div>

      </div>
    </div>
  );
}