// ── Follow-up date display karo — IST mein ────────────────
export const formatFollowUpDate = (dateString) => {
  if (!dateString) return null;

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day:      '2-digit',
    month:    'short',
    year:     'numeric',
    hour:     '2-digit',
    minute:   '2-digit',
    hour12:   true,
  });
};

// ── Short format — sirf date ───────────────────────────────
export const formatDate = (dateString) => {
  if (!dateString) return null;

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  return date.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day:      '2-digit',
    month:    'short',
    year:     'numeric',
  });
};

// ── datetime-local input ke liye IST value ─────────────────
export const toLocalDateTimeInput = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  // IST = UTC + 5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate   = new Date(date.getTime() + istOffset);

  // "2026-04-25T10:00" format
  return istDate.toISOString().slice(0, 16);
};

// ── Overdue check ──────────────────────────────────────────
export const isOverdue = (dateString) => {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
};