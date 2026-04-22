import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LeadInfo from '../components/LeadDetail/LeadInfo';
import CallTimeline from '../components/LeadDetail/CallTimeline';
import CallModal from '../components/CallModal';

export default function LeadDetail() {
  const { leadId }   = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();

  const [lead, setLead]         = useState(null);
  const [callLogs, setCallLogs] = useState([]);
  const [agents, setAgents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showCallModal, setShowCallModal] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/leads/${leadId}/detail`);
      setLead(res.data.lead);
      setCallLogs(res.data.callLogs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    if (user.role !== 'admin') return;
    try {
      const res = await API.get('/admin/agents');
      setAgents(res.data.agents.filter((a) => a.isActive));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDetail();
    fetchAgents();
  }, [leadId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">⏳</div>
          <p>Loading lead detail...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">❌</div>
          <p>Lead nahi mili</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-3 text-blue-600 text-sm underline"
          >
            Wapas jao
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Back Button + Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm transition"
        >
          ← Wapas
        </button>

        {/* Call Button — Agent ke liye */}
        {(user.role === 'agent' || user.role === 'admin') && (
          <button
            onClick={() => setShowCallModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            📞 Call Now
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left — Lead Info (2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <LeadInfo
            lead={lead}
            agents={agents}
            onUpdate={fetchDetail}
          />

          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-3">📊 Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {callLogs.length}
                </p>
                <p className="text-xs text-blue-500 mt-0.5">Total Calls</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {callLogs.filter((l) => l.disposition === 'Answered').length}
                </p>
                <p className="text-xs text-green-500 mt-0.5">Answered</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {callLogs.reduce((sum, l) => sum + (l.callDuration || 0), 0) > 0
                    ? `${Math.floor(callLogs.reduce((s, l) => s + (l.callDuration || 0), 0) / 60)}m`
                    : '0m'
                  }
                </p>
                <p className="text-xs text-purple-500 mt-0.5">Total Duration</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {callLogs.filter((l) => l.disposition === 'Callback Requested').length}
                </p>
                <p className="text-xs text-orange-500 mt-0.5">Callbacks</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Call Timeline (3 columns) */}
        <div className="lg:col-span-3">
          <CallTimeline callLogs={callLogs} />
        </div>
      </div>

      {/* Call Modal */}
      {showCallModal && (
        <CallModal
          lead={lead}
          onClose={() => setShowCallModal(false)}
          onSaved={fetchDetail}
        />
      )}
    </div>
  );
}