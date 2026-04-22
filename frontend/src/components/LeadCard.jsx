import { useNavigate } from "react-router-dom";

const STATUS_COLORS = {
  'New': 'bg-blue-100 text-blue-700',
  'Contacted': 'bg-yellow-100 text-yellow-700',
  'Interested': 'bg-green-100 text-green-700',
  'Not Interested': 'bg-red-100 text-red-700',
  'Follow-Up': 'bg-purple-100 text-purple-700',
  'Converted': 'bg-emerald-100 text-emerald-700',
  'Lost': 'bg-gray-100 text-gray-600',
};

const PRIORITY_COLORS = {
  'High': 'text-red-600',
  'Medium': 'text-yellow-600',
  'Low': 'text-green-600',
};

export default function LeadCard({ lead, onCallClick }) {
  const navigate = useNavigate();

  const isFollowUpDue = lead.followUpDate &&
    new Date(lead.followUpDate) <= new Date();



  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition ${isFollowUpDue ? 'border-orange-400' : 'border-gray-200'
      }`}>

      {/* Follow-up alert banner */}
      {isFollowUpDue && (
        <div className="bg-orange-50 text-orange-700 text-xs px-3 py-1.5 rounded-lg mb-3 flex items-center gap-1">
          ⏰ Follow-up is due!
        </div>
      )}

      {/* Lead Info */}
      <div  onClick={() => navigate(`/leads/${lead.id}`)}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3
            className="font-semibold text-blue-600 hover:underline cursor-pointer"
           
          >
            {lead.name}
          </h3>          <p className="text-sm text-gray-500"> {lead.phone}</p>
          {lead.email && (
            <p className="text-xs text-gray-400"> {lead.email}</p>
          )}
        </div>
        <span className={`text-xs font-bold ${PRIORITY_COLORS[lead.priority]}`}>
          ● {lead.priority}
        </span>
      </div>

      {/* Status + Source */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[lead.status]}`}>
          {lead.status}
        </span>
        <span className="text-xs text-gray-400">{lead.source}</span>
      </div>

      {/* Follow-up date */}
      {lead.followUpDate && (
        <p className="text-xs text-gray-500 mb-3">
          📅 Follow-up: {new Date(lead.followUpDate).toLocaleString('en-IN')}
        </p>
      )}

      {/* Notes preview */}
      {lead.notes && (
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2 mb-3 line-clamp-2">
          📝 {lead.notes}
        </p>
      )}

      {/* Call Button */}
      <button
        onClick={() => onCallClick(lead)}
        className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
      >
        📞 Call Now
      </button>
    </div>
    </div>
  );
}