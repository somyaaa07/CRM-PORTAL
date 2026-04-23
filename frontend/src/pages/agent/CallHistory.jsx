import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Phone, Clock, User, FileText, Calendar } from "lucide-react";
import API from "../../api/axios";

const DISPOSITION_COLORS = {
  Answered: "bg-green-100 text-green-700",
  "No Answer": "bg-red-100 text-red-700",
  Busy: "bg-yellow-100 text-yellow-700",
  Voicemail: "bg-blue-100 text-blue-700",
  "Wrong Number": "bg-gray-100 text-gray-600",
  "Callback Requested": "bg-purple-100 text-purple-700",
};

export default function CallHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get("/call-logs/my-logs");
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
    <div className="p-6 bg-gradient-to-br from-purple-50 via-gray-50 to-white min-h-screen">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        {/* <Phone className="w-6 h-6 text-purple-600" /> */}
        Call History
      </h1>

      {loading ? (
        <div className="text-center py-16 text-gray-400"> Loading...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>No call history yet</p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="space-y-4 "
        >
          {logs.map((log) => (
            <motion.div
              key={log.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.25 }}
              className="bg-white/70 backdrop-blur-lg  hover:bg-[#f5f4fa] border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between gap-4 shadow-sm hover:shadow-lg transition-all"
            >
              {/* LEFT */}
              <div className="flex items-start gap-2">
                <div className="bg-[#7c4dff] p-2 rounded-full">
                  <User className="w-6 h-6 text-white" />
                </div>

                <div>
                  <p className="font-semibold text-gray-900">
                    {log.lead?.name || "Unknown"}
                  </p>

                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Phone className="w-4 h-4" />
                    {log.lead?.phone}
                  </p>

                  {log.notes && (
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-1 line-clamp-1">
                      <FileText className="w-4 h-4" />
                      {log.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col items-end gap-1 text-right">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    DISPOSITION_COLORS[log.disposition]
                  }`}
                >
                  {log.disposition}
                </span>

                <div className="text-sm text-gray-400 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(log.calledAt).toLocaleString("en-IN")}
                </div>

                {log.callDuration > 0 && (
                  <div className="text-sm text-gray-400">
                    {Math.floor(log.callDuration / 60)}m {log.callDuration % 60}
                    s
                  </div>
                )}

                {log.followUpDate && (
                  <div className="text-sm text-purple-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(log.followUpDate).toLocaleDateString("en-IN")}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
