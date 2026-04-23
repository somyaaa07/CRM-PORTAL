import { useState } from 'react';
import { useAlerts } from '../context/AlertContext';
import { useNavigate } from 'react-router-dom';

export default function AlertBanner() {
  const { alerts, alertStats, dismissAlert, loading } = useAlerts();
  const [expanded, setExpanded]       = useState(true);
  const [dismissing, setDismissing]   = useState(null); // Track karo kaun dismiss ho raha
  const navigate = useNavigate();

  if (loading || alerts.length === 0) return null;

  const handleDismiss = async (leadId) => {
    setDismissing(leadId);
    await dismissAlert(leadId);
    setDismissing(null);
  };

  return (
    <div className="mx-6 mt-4">
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 rounded-t-xl cursor-pointer ${
          alertStats.overdue > 0
            ? 'bg-red-500 text-white'
            : 'bg-orange-400 text-white'
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🔔</span>
          <span className="font-semibold text-sm">
            {alertStats.overdue > 0
              ? `${alertStats.overdue} Overdue Follow-up${alertStats.overdue > 1 ? 's' : ''}!`
              : `${alertStats.total} Follow-up Reminder${alertStats.total > 1 ? 's' : ''}`
            }
          </span>
          {alertStats.upcoming > 0 && alertStats.overdue > 0 && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              +{alertStats.upcoming} upcoming
            </span>
          )}
        </div>
        <span className="text-sm">{expanded ? '▲' : '▼'}</span>
      </div>

      {/* Alert List */}
      {expanded && (
        <div className="bg-white border border-t-0 border-gray-200 rounded-b-xl overflow-hidden">
          {alerts.slice(0, 5).map((alert) => (
            <div
              key={`${alert.type}-${alert.leadId}`}
              className={`flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0 ${
                alert.overdue ? 'bg-red-50' : 'bg-orange-50'
              } ${dismissing === alert.leadId ? 'opacity-50' : ''}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-800">
                    {alert.name}
                  </span>
                  {alert.overdue && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                      Overdue
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  📱 {alert.phone} &nbsp;•&nbsp;
                  📅 {new Date(alert.followUpDate).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="flex items-center gap-2 ml-3">
                <button
                  onClick={() => navigate('/agent/my-leads')}
                  className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition"
                >
                  📞 Call
                </button>
                <button
                  onClick={() => handleDismiss(alert.leadId)}
                  disabled={dismissing === alert.leadId}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1.5 rounded-lg transition disabled:opacity-50"
                  title="Dismiss"
                >
                  {dismissing === alert.leadId ? '...' : '✕'}
                </button>
              </div>
            </div>
          ))}

          {alerts.length > 5 && (
            <div className="px-4 py-2 text-center text-xs text-gray-500">
              +{alerts.length - 5} more follow-ups hain
            </div>
          )}
        </div>
      )}
    </div>
  );
}