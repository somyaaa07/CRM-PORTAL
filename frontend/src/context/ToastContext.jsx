import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

// ─── Toast Styles ──────────────────────────────────────────
const TOAST_STYLES = {
  success:  'bg-green-500 text-white',
  error:    'bg-red-500 text-white',
  warning:  'bg-orange-400 text-white',
  info:     'bg-blue-500 text-white',
  followup: 'bg-purple-500 text-white',
};

const TOAST_ICONS = {
  success:  '✅',
  error:    '❌',
  warning:  '⚠️',
  info:     'ℹ️',
  followup: '🔔',
};

// ─── Toast Container (UI) ──────────────────────────────────
const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg
            ${TOAST_STYLES[toast.type] || TOAST_STYLES.info}
            animate-slide-in
          `}
        >
          <span className="text-lg mt-0.5 shrink-0">
            {TOAST_ICONS[toast.type]}
          </span>
          <p className="text-sm flex-1 leading-snug">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/70 hover:text-white text-lg leading-none shrink-0"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

// ─── Toast Provider ────────────────────────────────────────
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ message, type = 'info', duration = 5000 }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// ─── Hook ──────────────────────────────────────────────────
export const useToast = () => useContext(ToastContext);