import { useState, useEffect } from 'react';
import API from '../../api/axios';

const DISPOSITION_COLORS = {
  'Answered': 'bg-green-100 text-green-700',
  'No Answer': 'bg-red-100 text-red-700',
  'Busy': 'bg-yellow-100 text-yellow-700',
  'Voicemail': 'bg-blue-100 text-blue-700',
  'Wrong Number': 'bg-gray-100 text-gray-600',
  'Callback Requested': 'bg-purple-100 text-purple-700',
};

export default function CallHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/call-logs/my-logs');
        setLogs(res.data.logs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📞 Call History</h1>

      {loading ? (
        <div className="text-center py-16 text-gray-400">⏳ Loading...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-2">📭</div>
          <p>No call history Till </p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Lead Info */}
              <div className="flex-1">
                <p className="font-semibold text-gray-800">
                  {log.lead?.name}
                </p>
                <p className="text-sm text-gray-500">📱 {log.lead?.phone}</p>
                {log.notes && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                    📝 {log.notes}
                  </p>
                )}
              </div>

              {/* Disposition */}
              <div className="flex flex-col items-end gap-1">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  DISPOSITION_COLORS[log.disposition]
                }`}>
                  {log.disposition}
                </span>
                <span className="text-xs text-gray-400">
                  🕐 {new Date(log.calledAt).toLocaleString('en-IN')}
                </span>
                {log.callDuration > 0 && (
                  <span className="text-xs text-gray-400">
                    ⏱ {Math.floor(log.callDuration / 60)}m {log.callDuration % 60}s
                  </span>
                )}
                {log.followUpDate && (
                  <span className="text-xs text-purple-600">
                    📅 {new Date(log.followUpDate).toLocaleDateString('en-IN')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}