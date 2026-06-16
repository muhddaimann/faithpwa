const toDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const d = new Date(value.trim());
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatNewsDate = (value?: string | null, fallback = "—"): string => {
  if (!value) return fallback;
  const trimmed = value.trim();
  const d = toDate(trimmed);
  if (!d) return trimmed;

  // Month-year only inputs (e.g. "June 2026") should not invent a day.
  if (/^[A-Za-z]+\s+\d{4}$/.test(trimmed)) {
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }

  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatNewsRelative = (value?: string | null): string | null => {
  const d = toDate(value);
  if (!d) return null;
  const diff = Date.now() - d.getTime();
  if (diff < 0) return null;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return null;
};
