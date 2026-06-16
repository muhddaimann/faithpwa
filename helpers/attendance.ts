// Attendance date/time helpers live in the shared master file.
export * from "./date";

import { formatTime, formatWorkedHours, toDateKey } from "./date";
import type { Attendance, PublicHoliday } from "../contexts/api/attendance";

export type MetricTone = "positive" | "warning" | "negative" | "neutral";
export type ClockState = "recorded" | "pending" | "missed";

export interface ClockMetric {
  label: string;
  scheduled: string;
  actual: string;
  state: ClockState;
  note: string;
  tone: MetricTone;
}

export interface AttendanceDetail {
  checkIn: ClockMetric;
  checkOut: ClockMetric;
  workedHours: string;
}

// "45 minutes" -> "45 min", "2 hours" -> "2 hr".
const shortenDuration = (value?: string | null): string | null => {
  if (!value) return null;
  const out = value
    .replace(/\bminutes?\b/i, "min")
    .replace(/\bhours?\b/i, "hr")
    .trim();
  return out || null;
};

const cleanTime = (value?: string | null): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

// Where the day sits relative to today (YYYY-MM-DD string compare is safe).
type DayRelation = "past" | "today" | "future";
const relationOf = (scheduleDate?: string | null): DayRelation => {
  const key = toDateKey(scheduleDate);
  const today = toDateKey(new Date());
  if (!key || !today) return "today";
  if (key < today) return "past";
  if (key > today) return "future";
  return "today";
};

// The API marks a clock as finalised only via these statuses. "before"/"false"
// mean the time has not been collected yet (e.g. still on shift).
const LOGIN_COLLECTED = new Set(["exact", "early", "late"]);

const isLoginCollected = (status?: string | null): boolean =>
  !!status && LOGIN_COLLECTED.has(status);

// Logout is finalised on "exact", or on "early"/"late" once a difference is
// reported — a null difference means the logout time is still being collected.
const isLogoutCollected = (status?: string | null, diff?: string | null): boolean => {
  if (status === "exact") return true;
  if (status === "early" || status === "late") return !!cleanTime(diff);
  return false;
};

const loginNote = (status?: string | null, diff?: string | null): { note: string; tone: MetricTone } => {
  const d = shortenDuration(diff);
  switch (status) {
    case "exact":
      return { note: "On time", tone: "positive" };
    case "early":
      return { note: d ? `${d} early` : "Early", tone: "positive" };
    case "late":
      return { note: d ? `${d} late` : "Late", tone: "negative" };
    default:
      return { note: "On time", tone: "neutral" };
  }
};

const logoutNote = (status?: string | null, diff?: string | null): { note: string; tone: MetricTone } => {
  const d = shortenDuration(diff);
  switch (status) {
    case "exact":
      return { note: "On time", tone: "positive" };
    case "early":
      return { note: d ? `${d} early` : "Left early", tone: "warning" };
    case "late":
      return { note: d ? `${d} over` : "Overtime", tone: "positive" };
    default:
      return { note: "On time", tone: "neutral" };
  }
};

export const buildAttendanceDetail = (
  record?: Attendance | null,
): AttendanceDetail => {
  const relation = relationOf(record?.schedule_date);
  const loginCollected = isLoginCollected(record?.login_status) && !!cleanTime(record?.actual_login);
  const logoutCollected =
    isLogoutCollected(record?.logout_status, record?.logout_difference) &&
    !!cleanTime(record?.actual_logout);

  const checkIn: ClockMetric = (() => {
    const scheduled = formatTime(record?.original_login, "--");
    if (loginCollected) {
      const { note, tone } = loginNote(record?.login_status, record?.login_difference);
      return { label: "Check In", scheduled, actual: formatTime(record?.actual_login, "--"), state: "recorded", note, tone };
    }
    if (relation === "future") return { label: "Check In", scheduled, actual: "--", state: "pending", note: "Upcoming", tone: "neutral" };
    if (relation === "today") return { label: "Check In", scheduled, actual: "--", state: "pending", note: "Awaiting check-in", tone: "neutral" };
    return { label: "Check In", scheduled, actual: "--", state: "missed", note: "No check-in", tone: "negative" };
  })();

  const checkOut: ClockMetric = (() => {
    const scheduled = formatTime(record?.original_logout, "--");
    if (logoutCollected) {
      const { note, tone } = logoutNote(record?.logout_status, record?.logout_difference);
      return { label: "Check Out", scheduled, actual: formatTime(record?.actual_logout, "--"), state: "recorded", note, tone };
    }
    if (relation === "future") return { label: "Check Out", scheduled, actual: "--", state: "pending", note: "Upcoming", tone: "neutral" };
    if (loginCollected && relation === "today") return { label: "Check Out", scheduled, actual: "--", state: "pending", note: "In progress", tone: "warning" };
    if (loginCollected) return { label: "Check Out", scheduled, actual: "--", state: "missed", note: "No check-out", tone: "warning" };
    return { label: "Check Out", scheduled, actual: "--", state: "missed", note: "—", tone: "neutral" };
  })();

  return {
    checkIn,
    checkOut,
    workedHours:
      loginCollected && logoutCollected
        ? formatWorkedHours(record?.actual_login, record?.actual_logout, "--")
        : "--",
  };
};

export const findHoliday = (
  holidays: PublicHoliday[],
  scheduleDate?: string | null,
): PublicHoliday | null => {
  const key = toDateKey(scheduleDate);
  if (!key) return null;
  return holidays.find((h) => toDateKey(h.date) === key) ?? null;
};
