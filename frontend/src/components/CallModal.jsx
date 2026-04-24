import { useState } from "react";
import API from "../api/axios";
import { useToast } from "../context/ToastContext";
import {
  FiX,
  FiPhone,
  FiClock,
  FiFileText,
  FiCalendar,
  FiBell,
  FiSave,
} from "react-icons/fi";

const DISPOSITIONS = [
  "Answered",
  "No Answer",
  "Busy",
  "Voicemail",
  "Wrong Number",
  "Callback Requested",
];

export default function CallModal({ lead, onClose, onSaved }) {
  const { addToast } = useToast();

  const [form, setForm] = useState({
    disposition: "",
    notes: "",
    followUpDate: "",
    alertEnabled: false,
    callDuration: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleToggleAlert = async () => {
    const newStatus = !form.alertEnabled;
    try {
      await API.put(`/leads/${lead.id}/status`, {
        alertEnabled: newStatus,
      });
      setForm({ ...form, alertEnabled: newStatus });
      addToast({
        message: newStatus
          ? " Follow-up alert enabled"
          : " Follow-up alert disabled",
        type: "success",
      });
    } catch (err) {
      addToast({
        message: " Failed to update alert",
        type: "error",
      });
    }
  };

  const handleSave = async () => {
    if (!form.disposition) {
      setError(" Necessary to select Disposition.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // ✅ Convert datetime-local to UTC ISO string
      const followUpDateUTC = form.followUpDate
        ? new Date(form.followUpDate).toISOString()
        : null;

      await API.post("/call-logs", {
        leadId: lead.id,
        disposition: form.disposition,
        notes: form.notes,
        followUpDate: followUpDateUTC,
        alertEnabled: form.alertEnabled,
        callDuration: Number(form.callDuration) || 0,
      });

      if (form.followUpDate) {
        await API.put(`/leads/${lead.id}/status`, {
          status: "Follow-Up",
          followUpDate: followUpDateUTC, // ✅ UTC here too
          alertEnabled: form.alertEnabled,
        });
      }

      addToast({
        message: form.followUpDate
          ? " Call log saved! Follow-up set."
          : " Call log saved!",
        type: "success",
      });

      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || " Save failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&family=Jost:wght@300;400;500;600&display=swap');

      .font-heading {
        font-family: 'Manrope' ;
      }

      .font-body {
        font-family: 'Jost';
      }
    `}</style>

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-6 font-body">
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between p-4 sm:p-5 border-b">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 font-heading">
                <FiPhone className="text-[#7c4dff]" /> Call Log
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {lead.name} — {lead.phone}
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-500 text-xl"
            >
              <FiX />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
            {/* Error */}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Disposition */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                <FiFileText /> Call Result (Disposition) *
              </label>

              <select
                value={form.disposition}
                onChange={(e) =>
                  setForm({ ...form, disposition: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#7c4dff] outline-none"
              >
                <option value="">-- Select --</option>
                {DISPOSITIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                <FiClock /> Call Duration (seconds)
              </label>

              <input
                type="number"
                placeholder="e.g. 120"
                value={form.callDuration}
                onChange={(e) =>
                  setForm({ ...form, callDuration: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#7c4dff] outline-none"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                <FiFileText /> Notes
              </label>

              <textarea
                rows={3}
                placeholder="Add remarks..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#7c4dff] outline-none resize-none"
              />
            </div>

            {/* Follow-up */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                <FiCalendar /> Follow-up Date
              </label>

              <input
                type="datetime-local"
                value={form.followUpDate}
                onChange={(e) =>
                  setForm({ ...form, followUpDate: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#7c4dff] outline-none"
              />
            </div>

            {/* Alert Toggle */}
            <div className="flex items-center justify-between bg-purple-50 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium flex items-center gap-2">
                  <FiBell /> Follow-up Alert
                </p>

                <p className="text-xs text-gray-500">
                  Reminder will be sent on follow-up date
                </p>
              </div>

              <button
                onClick={handleToggleAlert}
                className={`w-12 h-6 flex items-center rounded-full transition ${
                  form.alertEnabled ? "bg-[#7c4dff]" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transform transition ${
                    form.alertEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-4 sm:p-5 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="flex-1 border cursor-pointer py-2 rounded-lg text-sm hover:bg-white transition"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-[#7c4dff] hover:bg-[#6a3de8] text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FiSave />
              {loading ? "Saving..." : "Save Log"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}