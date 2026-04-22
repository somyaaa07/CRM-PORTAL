const DISPOSITION_STYLES = {
  'Answered':           'bg-green-100 text-green-700 border-green-200',
  'No Answer':          'bg-red-100 text-red-600 border-red-200',
  'Busy':               'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Voicemail':          'bg-blue-100 text-blue-600 border-blue-200',
  'Wrong Number':       'bg-gray-100 text-gray-600 border-gray-200',
  'Callback Requested': 'bg-purple-100 text-purple-700 border-purple-200',
};

const DISPOSITION_ICONS = {
  'Answered':           '✅',
  'No Answer':          '📵',
  'Busy':               '🔴',
  'Voicemail':          '📬',
  'Wrong Number':       '❌',
  'Callback Requested': '🔔',
};

export default function CallTimeline({ callLogs }) {
  if (callLogs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">📞 Call History</h3>
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-sm">Abhi tak koi call nahi ki gayi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">📞 Call History</h3>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
          {callLogs.length} calls
        </span>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {callLogs.map((log, index) => (
          <div key={log.id} className="flex gap-3">

            {/* Timeline Line */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm shrink-0 ${
                DISPOSITION_STYLES[log.disposition] || 'bg-gray-100 border-gray-200'
              }`}>
                {DISPOSITION_ICONS[log.disposition] || '📞'}
              </div>
              {index < callLogs.length - 1 && (
                <div className="w-0.5 h-full bg-gray-200 mt-1 min-h-4" />
              )}
            </div>

            {/* Call Info */}
            <div className="flex-1 pb-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                  DISPOSITION_STYLES[log.disposition]
                }`}>
                  {log.disposition}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(log.calledAt).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Agent */}
              <p className="text-xs text-gray-500 mt-1">
                🧑‍💼 {log.agent?.name || 'Unknown Agent'}
              </p>

              {/* Duration */}
              {log.callDuration > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">
                  ⏱ {Math.floor(log.callDuration / 60)}m {log.callDuration % 60}s
                </p>
              )}

              {/* Notes */}
              {log.notes && (
                <div className="bg-gray-50 rounded-lg p-2 mt-2">
                  <p className="text-xs text-gray-600">📝 {log.notes}</p>
                </div>
              )}

              {/* Follow-up */}
              {log.followUpDate && (
                <p className={`text-xs mt-1 ${
                  new Date(log.followUpDate) < new Date()
                    ? 'text-red-500'
                    : 'text-purple-600'
                }`}>
                  📅 Follow-up: {new Date(log.followUpDate).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              )}

              {/* Alert */}
              {log.alertEnabled && (
                <span className="text-xs text-orange-500 mt-1 inline-block">
                  🔔 Alert on
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}