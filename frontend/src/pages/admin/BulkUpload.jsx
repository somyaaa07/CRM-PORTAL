import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { useToast } from '../../context/ToastContext';

/* ── Font injection (idempotent) ─────────────────────────────────────────────── */
if (!document.getElementById('crm-fonts')) {
  const link = document.createElement('link');
  link.id   = 'crm-fonts';
  link.rel  = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700&family=Jost:wght@300;400;500&display=swap';
  document.head.appendChild(link);
}

/* ── Icons ───────────────────────────────────────────────────────────────────── */
const UploadIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const FileIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);
const AgentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <circle cx="8" cy="5.5" r="2.5"/>
    <path d="M3 14c0-2.761 2.239-5 5-5s5 2.239 5 5"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="2 8 6 12 14 4"/>
  </svg>
);
const XIcon = ({ size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M3 3l10 10M13 3L3 13"/>
  </svg>
);
const SpinnerIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    style={{ animation: 'spin .7s linear infinite' }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);
const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="6"/>
    <path d="M8 7v4M8 5.5h.01"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M8 2L1.5 13.5h13z"/>
    <path d="M8 7v3M8 11.5h.01"/>
  </svg>
);
const ResetIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-8.11L1 10"/>
  </svg>
);

/* ── Tokens ──────────────────────────────────────────────────────────────────── */
const T = {
  bg:        '#fefafa',
  card:      '#ffffff',
  border:    '0.5px solid #ede8e8',
  borderMd:  '0.5px solid #e0dcdc',
  radius:    14,
  radiusSm:  8,
  title:     "'Manrope', sans-serif",
  body:      "'Jost', sans-serif",
};

const label = {
  fontFamily: T.title,
  fontSize: 11, fontWeight: 700, color: '#9e9a9a',
  textTransform: 'uppercase', letterSpacing: '0.5px',
  display: 'block', marginBottom: 6,
};

const inputStyle = {
  width: '100%', border: T.borderMd, borderRadius: T.radiusSm,
  padding: '9px 12px', fontSize: 13, fontFamily: T.body,
  color: '#2c2c2c', background: T.bg, outline: 'none',
};

/* ── Sample rows for the format guide ───────────────────────────────────────── */
const SAMPLE_ROWS = [
  ['Ramesh Kumar', '9876543210', 'ramesh@gmail.com', 'Website'],
  ['Suresh Singh', '9876543211', '—',                'Facebook'],
  ['Priya Sharma', '9876543212', 'priya@gmail.com',  'Referral'],
];

export default function BulkUpload() {
  const { addToast } = useToast();

  const [agents, setAgents]               = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [file, setFile]                   = useState(null);
  const [dragOver, setDragOver]           = useState(false);
  const [loading, setLoading]             = useState(false);
  const [result, setResult]               = useState(null);

  useEffect(() => {
    API.get('/admin/agents')
      .then(res => setAgents(res.data.agents.filter(a => a.isActive)))
      .catch(console.error);
  }, []);

  const validateAndSetFile = (selected) => {
    if (!selected) return;
    const ext = selected.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      addToast({ message: 'Only .xlsx, .xls or .csv files are allowed', type: 'error' });
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      addToast({ message: 'File size must be under 10 MB', type: 'error' });
      return;
    }
    setFile(selected);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) { addToast({ message: 'Please select a file first', type: 'error' }); return; }
    const formData = new FormData();
    formData.append('file', file);
    if (selectedAgent) formData.append('agentId', selectedAgent.toString());
    try {
      setLoading(true);
      setResult(null);
      const res = await API.post('/leads/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
      setFile(null);
      addToast({
        message: `${res.data.summary.inserted} leads uploaded to ${res.data.summary.assignedTo}`,
        type: 'success', duration: 6000,
      });
    } catch (err) {
      addToast({ message: err.response?.data?.message || 'Upload failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setFile(null); setResult(null); setSelectedAgent(''); };

  const fileSizeKB = file ? (file.size / 1024).toFixed(1) : null;
  const allSuccess = result && result.summary.failed === 0;

  return (
    <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 20px', fontFamily: T.body }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ maxWidth: 1180, margin: '0 auto' }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: T.title, fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: 0, lineHeight: 1.2 }}>
            Bulk Lead Upload
          </h1>
          <p style={{ fontSize: 13, color: '#9e9a9a', margin: '5px 0 0', fontFamily: T.body }}>
            Import hundreds of leads at once from an Excel or CSV file
          </p>
        </div>

        {/* ── Format guide ── */}
        <div style={{
          background: '#EAF3DE', border: '0.5px solid #C0DD97',
          borderRadius: T.radius, padding: '16px 18px', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
            <span style={{ color: '#3B6D11' }}><InfoIcon /></span>
            <span style={{ fontFamily: T.title, fontSize: 12, fontWeight: 700, color: '#3B6D11', letterSpacing: '0.3px' }}>
              Required File Format
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: T.body }}>
              <thead>
                <tr>
                  {[
                    { label: 'name', req: true },
                    { label: 'phone', req: true },
                    { label: 'email', req: false },
                    { label: 'source', req: false },
                  ].map(col => (
                    <th key={col.label} style={{
                      textAlign: 'left', paddingBottom: 8, paddingRight: 24,
                      fontFamily: T.title, fontWeight: 700, color: '#3B6D11',
                      borderBottom: '0.5px solid #97C459',
                    }}>
                      {col.label}
                      {col.req && (
                        <span style={{
                          marginLeft: 5, fontSize: 10, background: '#3B6D11',
                          color: '#fff', padding: '1px 5px', borderRadius: 20,
                        }}>
                          req
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SAMPLE_ROWS.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} style={{
                        padding: '5px 24px 5px 0', color: '#4a4747',
                        borderBottom: i < SAMPLE_ROWS.length - 1 ? '0.5px solid #C0DD97' : 'none',
                        fontFamily: T.body,
                      }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 11, color: '#639922', marginTop: 10, fontFamily: T.body }}>
            Columns marked <strong>req</strong> are required — all others are optional
          </p>
        </div>

        {/* ── Main form card ── */}
        <div style={{ background: T.card, border: T.border, borderRadius: T.radius, padding: '22px 22px', marginBottom: 20 }}>

          {/* Agent select */}
          <div style={{ marginBottom: 20 }}>
            <label style={label}>
              Assign to Agent
              <span style={{ fontFamily: T.body, fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#b0acac', marginLeft: 6 }}>
                optional
              </span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#b0acac' }}>
                <AgentIcon />
              </span>
              <select
                value={selectedAgent}
                onChange={e => setSelectedAgent(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 32, appearance: 'none', cursor: 'pointer' }}
              >
                <option value="">Unassigned — assign later</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.name} — {a.email}</option>
                ))}
              </select>
            </div>
            {selectedAgent && (
              <p style={{ fontSize: 11, color: '#3B6D11', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4, fontFamily: T.body }}>
                <CheckIcon /> All leads will be assigned to this agent
              </p>
            )}
          </div>

          {/* Divider */}
          <div style={{ borderTop: T.border, marginBottom: 20 }}/>

          {/* Drop zone */}
          <div>
            <label style={label}>Upload File</label>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !file && document.getElementById('bulkFileInput').click()}
              style={{
                border: `2px dashed ${dragOver ? '#378ADD' : file ? '#97C459' : '#d4cfcf'}`,
                borderRadius: 12,
                padding: '32px 20px',
                textAlign: 'center',
                cursor: file ? 'default' : 'pointer',
                background: dragOver ? '#E6F1FB' : file ? '#EAF3DE' : T.bg,
                transition: 'all .18s',
              }}
            >
              <input
                id="bulkFileInput"
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                onChange={e => validateAndSetFile(e.target.files[0])}
              />

              {file ? (
                /* ── File selected state ── */
                <div style={{ animation: 'fadeUp .2s ease-out' }}>
                  <div style={{ color: '#3B6D11', marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
                    <FileIcon />
                  </div>
                  <p style={{ fontFamily: T.title, fontWeight: 700, fontSize: 14, color: '#1a1a1a', margin: '0 0 3px' }}>
                    {file.name}
                  </p>
                  <p style={{ fontSize: 12, color: '#9e9a9a', margin: '0 0 12px', fontFamily: T.body }}>
                    {fileSizeKB} KB
                  </p>
                  <button
                    onClick={e => { e.stopPropagation(); setFile(null); }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 7,
                      background: '#FCEBEB', color: '#A32D2D', border: '0.5px solid #F7C1C1',
                      cursor: 'pointer', fontFamily: T.title,
                    }}
                  >
                    <XIcon size={9}/> Remove file
                  </button>
                </div>
              ) : (
                /* ── Empty state ── */
                <div>
                  <div style={{ color: dragOver ? '#378ADD' : '#b0acac', marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
                    <UploadIcon />
                  </div>
                  <p style={{ fontFamily: T.title, fontWeight: 600, fontSize: 14, color: '#4a4747', margin: '0 0 4px' }}>
                    {dragOver ? 'Drop it here' : 'Drag & drop your file here'}
                  </p>
                  <p style={{ fontSize: 12, color: '#b0acac', margin: '0 0 14px', fontFamily: T.body }}>
                    or click to browse
                  </p>
                  <span style={{
                    display: 'inline-block', fontSize: 11, fontWeight: 500,
                    padding: '4px 12px', borderRadius: 20,
                    background: '#F1EFE8', color: '#5F5E5A', fontFamily: T.body,
                  }}>
                    .xlsx · .xls · .csv &nbsp;·&nbsp; Max 10 MB
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                background: loading || !file ? '#b0acac' : '#185FA5',
                color: '#fff', border: 'none', borderRadius: 10,
                padding: '11px 0', fontSize: 13, fontWeight: 700,
                fontFamily: T.title, letterSpacing: '0.2px', cursor: loading || !file ? 'not-allowed' : 'pointer',
                transition: 'background .15s',
              }}
            >
              {loading ? <><SpinnerIcon /> Uploading…</> : <><UploadIcon style={{ width: 14, height: 14 }}/> Upload Leads</>}
            </button>

            {(file || result) && (
              <button
                onClick={handleReset}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '11px 16px', fontSize: 12, fontWeight: 600,
                  borderRadius: 10, border: T.borderMd, background: T.bg,
                  color: '#6b6868', cursor: 'pointer', fontFamily: T.title,
                  transition: 'all .15s',
                }}
              >
                <ResetIcon /> Reset
              </button>
            )}
          </div>
        </div>

        {/* ── Result card ── */}
        {result && (
          <div style={{
            background: T.card, border: T.border, borderRadius: T.radius,
            overflow: 'hidden', animation: 'fadeUp .25s ease-out',
          }}>

            {/* Result header */}
            <div style={{
              padding: '16px 20px',
              background: allSuccess ? '#EAF3DE' : '#FAEEDA',
              borderBottom: `0.5px solid ${allSuccess ? '#C0DD97' : '#FAC775'}`,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: allSuccess ? '#3B6D11' : '#854F0B',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {allSuccess
                  ? <CheckIcon style={{ color: '#fff' }}/>
                  : <AlertIcon style={{ color: '#fff' }}/>
                }
              </div>
              <div>
                <p style={{ fontFamily: T.title, fontWeight: 700, fontSize: 14, color: allSuccess ? '#3B6D11' : '#854F0B', margin: 0 }}>
                  {allSuccess ? 'Upload successful' : 'Upload completed with errors'}
                </p>
                <p style={{ fontSize: 12, color: allSuccess ? '#639922' : '#BA7517', margin: '2px 0 0', fontFamily: T.body }}>
                  Assigned to: <strong>{result.summary.assignedTo}</strong>
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '0.5px solid #ede8e8' }}>
              {[
                { value: result.summary.totalRows, label: 'Total Rows', color: '#1a1a1a' },
                { value: result.summary.inserted,  label: 'Inserted',   color: '#3B6D11' },
                { value: result.summary.failed,    label: 'Failed',     color: result.summary.failed > 0 ? '#A32D2D' : '#b0acac' },
              ].map((s, i) => (
                <div key={i} style={{
                  padding: '18px 12px', textAlign: 'center',
                  borderRight: i < 2 ? '0.5px solid #ede8e8' : 'none',
                }}>
                  <p style={{ fontFamily: T.title, fontSize: 26, fontWeight: 700, color: s.color, margin: 0, lineHeight: 1 }}>
                    {s.value}
                  </p>
                  <p style={{ fontSize: 11, color: '#9e9a9a', marginTop: 5, fontFamily: T.body }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Failed rows detail */}
            {result.failedRows?.length > 0 && (
              <div style={{ padding: '16px 20px' }}>
                <p style={{ fontFamily: T.title, fontSize: 12, fontWeight: 700, color: '#1a1a1a', marginBottom: 10, letterSpacing: '0.3px' }}>
                  Failed Rows
                </p>
                <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.failedRows.map((f, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      background: '#FCEBEB', borderRadius: 8, padding: '8px 12px',
                      fontSize: 12, fontFamily: T.body,
                    }}>
                      <span style={{ fontFamily: T.title, fontWeight: 700, color: '#A32D2D', flexShrink: 0, minWidth: 48 }}>
                        Row {f.row}
                      </span>
                      <span style={{ color: '#791F1F', lineHeight: 1.4 }}>{f.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}