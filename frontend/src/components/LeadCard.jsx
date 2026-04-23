import { useNavigate } from "react-router-dom";
import { Phone, Mail, Calendar, User, FileText } from "lucide-react";
import { motion } from "framer-motion";

const STATUS_COLORS = {
  New: "bg-blue-100 text-blue-700",
  Contacted: "bg-yellow-100 text-yellow-700",
  Interested: "bg-green-100 text-green-700",
  "Not Interested": "bg-red-100 text-red-700",
  "Follow-Up": "bg-purple-100 text-purple-700",
  Converted: "bg-emerald-100 text-emerald-700",
  Lost: "bg-gray-100 text-gray-600",
};

const PRIORITY_COLORS = {
  High: "text-red-500",
  Medium: "text-yellow-500",
  Low: "text-green-500",
};

export default function LeadCard({ lead, onCallClick }) {
  const navigate = useNavigate();

  const isFollowUpDue =
    lead.followUpDate && new Date(lead.followUpDate) <= new Date();

  return (
    <div
      className={`bg-white rounded-2xl shadow-md border p-5 font-[Jost] transition hover:shadow-xl ${
        isFollowUpDue ? "border-purple-400" : "border-gray-200"
      }`}
    >
      {/* Follow-up alert */}
      {isFollowUpDue && (
        <div className="bg-purple-50 text-purple-700 text-xs px-3 py-1.5 rounded-lg mb-4 flex items-center gap-2">
          Follow-up is due!
        </div>
      )}

      {/* Lead Info */}
      <div
        onClick={() => navigate(`/leads/${lead.id}`)}
        className="cursor-pointer"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex gap-2">
              <div className="bg-purple-100 p-2 rounded-lg">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-sm text-gray-900 hover:underline flex items-center gap-2">
                {/* <User size={18} /> {lead.name} */}
                {lead.name}
              </h3>
            </div>

            <p className="text-sm  text-gray-500 flex items-center px-3 gap-4 mt-3">
              <Phone size={14} /> {lead.phone}
            </p>

            {lead.email && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Mail size={14} /> {lead.email}
              </p>
            )}
          </div>

          <span
            className={`text-xs font-bold flex items-center gap-1 ${PRIORITY_COLORS[lead.priority]}`}
          >
            {lead.priority}
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 mb-3 ">
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[lead.status]}`}
          >
            {lead.status}
          </span>
          <span className="text-xs text-gray-800 bg-gray-200 rounded-full px-3 py-1">
            {lead.source}
          </span>
        </div>

        {/* Follow-up */}
        {lead.followUpDate && (
          <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
            <Calendar size={14} />
            {new Date(lead.followUpDate).toLocaleString("en-IN")}
          </p>
        )}

        {/* Notes */}
        {lead.notes && (
          <p className="text-xs flex gap-2 text-gray-500 bg-gray-50 rounded-lg p-3 mb-4 line-clamp-2">
            <FileText className="w-4 h-4" /> {lead.notes}
          </p>
        )}
      </div>

      {/*  Animated Gradient Button */}
      {/* <motion.button
        onClick={() => onCallClick(lead)}
        className="relative overflow-hidden w-full mt-4 px-6 py-3 uppercase text-sm font-semibold tracking-wide text-white rounded-xl
        bg-[#7e61dd] shadow-lg cursor-pointer"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover="hover"
      >
        <motion.span
          className="absolute inset-0 bg-white z-10 origin-center"
          initial={{ rotate: -90, scale: 0 }}
          variants={{
            hover: {
              rotate: 0,
              scale: 1,
            },
          }}
          transition={{ duration: 0.4 }}
        />

      
        <motion.span
          className="relative z-20 flex items-center justify-center gap-2"
          variants={{
            hover: { color: "#6D28D9" },
          }}
        >
          <Phone size={16} />
          Call Now
        </motion.span>
      </motion.button> */}
      <button
        className="relative overflow-hidden w-full mt-4 px-6 py-3  text-sm font-semibold tracking-wide text-white rounded-xl
        bg-[#7e61dd] shadow-lg cursor-pointer"
      >
        Call Now
      </button>
    </div>
  );
}
