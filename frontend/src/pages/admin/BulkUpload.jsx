import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { useToast } from '../../context/ToastContext';

export default function BulkUpload() {
  const { addToast } = useToast();

  const [agents, setAgents]               = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [file, setFile]                   = useState(null);
  const [dragOver, setDragOver]           = useState(false);
  const [loading, setLoading]             = useState(false);
  const [result, setResult]               = useState(null);

  // ── Agents fetch karo ──────────────────────────────────
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await API.get('/admin/agents');
        setAgents(res.data.agents.filter((a) => a.isActive));
      } catch (err) {
        console.error(err);
      }
    };
    fetchAgents();
  }, []);

  // ── File Validate + Set ────────────────────────────────
  const validateAndSetFile = (selected) => {
    if (!selected) return;
    const ext = selected.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      addToast({
        message: '❌ Only .xlsx, .xls or .csv file is allowed ',
        type: 'error',
      });
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      addToast({
        message: '❌ File size should be less then 10MB ',
        type: 'error',
      });
      return;
    }
    setFile(selected);
    setResult(null);
  };

  const handleFileChange = (e) => validateAndSetFile(e.target.files[0]);

  // ── Drag & Drop ────────────────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  };

  // ── Upload ─────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) {
      addToast({ message: '❌ First Do Select !', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    // ✅ Sirf tab append karo jab agent select ho
    if (selectedAgent && selectedAgent !== '') {
      formData.append('agentId', selectedAgent.toString());
    }

    // Debug
    console.log('🚀 Uploading with agentId:', selectedAgent);
    for (let [key, val] of formData.entries()) {
      console.log(`  ${key}:`, val);
    }

    try {
      setLoading(true);
      setResult(null);

      const res = await API.post('/leads/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(res.data);
      setFile(null);

      addToast({
        message: `✅ ${res.data.summary.inserted} Leads are uploaded to ! ${res.data.summary.assignedTo}`,
        type: 'success',
        duration: 6000,
      });

    } catch (err) {
      addToast({
        message: err.response?.data?.message || '❌ Upload failed!',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Reset ──────────────────────────────────────────────
  const handleReset = () => {
    setFile(null);
    setResult(null);
    setSelectedAgent('');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📤 Bulk Lead Upload</h1>
        <p className="text-gray-500 text-sm mt-1">
        Upload 1000+ data from Excel Sheet
        </p>
      </div>

      {/* Format Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm font-semibold text-blue-800 mb-2">
          📋 Excel File Format:
        </p>
        <div className="overflow-x-auto">
          <table className="text-xs text-blue-700 w-full">
            <thead>
              <tr className="border-b border-blue-200">
                {['name ✅', 'phone ✅', 'email', 'source'].map((h) => (
                  <th key={h} className="text-left py-1 pr-6 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Ramesh Kumar', '9876543210', 'ramesh@gmail.com', 'Website'],
                ['Suresh Singh', '9876543211', '',                 'Facebook'],
                ['Priya Sharma', '9876543212', 'priya@gmail.com',  'Referral'],
              ].map((row, i) => (
                <tr key={i} className="border-b border-blue-100 last:border-0">
                  {row.map((cell, j) => (
                    <td key={j} className="py-1 pr-6">{cell || '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          ✅ = Necessary &nbsp;|&nbsp; Rest are Optionals
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">

        {/* Agent Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            🧑‍💼 Select Agent
            <span className="text-gray-400 font-normal ml-1">(Optional)</span>
          </label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Unassigned (Assign Later) --</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} — {a.email}
              </option>
            ))}
          </select>
          {selectedAgent && (
            <p className="text-xs text-green-600 mt-1">
              ✅ Agent selected — all the lead assign to them
            </p>
          )}
        </div>

        {/* Drag & Drop Zone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            📁 Upload Excel File
          </label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
              dragOver
                ? 'border-blue-500 bg-blue-50'
                : file
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <input
              id="fileInput"
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
            />

            {file ? (
              <div>
                <div className="text-4xl mb-2">📊</div>
                <p className="font-semibold text-green-700">{file.name}</p>
                <p className="text-xs text-green-600 mt-1">
                  Size: {(file.size / 1024).toFixed(1)} KB
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
                >
                  ✕ Remove
                </button>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-2">📂</div>
                <p className="text-gray-600 font-medium">
                   Drag Your File here or click to select
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  .xlsx, .xls, .csv — Max 10MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Uploading...
              </>
            ) : (
              '📤 Upload '
            )}
          </button>

          {(file || result) && (
            <button
              onClick={handleReset}
              className="px-4 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg text-sm transition"
            >
              🔄 Reset
            </button>
          )}
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">

          {/* Result Header */}
          <div className={`px-5 py-4 text-white ${
            result.summary.failed === 0 ? 'bg-green-500' : 'bg-yellow-500'
          }`}>
            <p className="font-bold text-lg">
              {result.summary.failed === 0 ? '✅' : '⚠️'} Upload Complete!
            </p>
            <p className="text-sm opacity-90">
              Agent: <strong>{result.summary.assignedTo}</strong>
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">
                {result.summary.totalRows}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total Rows</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {result.summary.inserted}
              </p>
              <p className="text-xs text-gray-500 mt-1">✅ Inserted</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-red-500">
                {result.summary.failed}
              </p>
              <p className="text-xs text-gray-500 mt-1">❌ Failed</p>
            </div>
          </div>

          {/* Failed Rows */}
          {result.failedRows?.length > 0 && (
            <div className="border-t border-gray-100 p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                ❌ Failed Rows Detail:
              </p>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {result.failedRows.map((f, i) => (
                  <div key={i}
                    className="flex items-center gap-3 text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-lg">
                    <span className="font-medium shrink-0">Row {f.row}:</span>
                    <span>{f.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}