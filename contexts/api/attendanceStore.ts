import { create } from 'zustand';
import {
  Attendance,
  AttendanceError,
  AttendanceStatus,
  PublicHoliday,
  getAttendanceDef,
  getPublicHolidays,
  getAttendanceStatusDescription,
} from './attendance';

interface AttendanceState {
  records: Attendance[];
  holidays: PublicHoliday[];
  // Status code -> human description, sourced from the API (attStatus.php).
  statusMap: Record<string, string>;
  loading: boolean;
  error: string | null;

  fetchAttendance: () => Promise<void>;
  clear: () => void;
}

const loadStatusDescriptions = async (
  records: Attendance[],
): Promise<Record<string, string>> => {
  const codes = Array.from(
    new Set(records.map((r) => r.status).filter((c): c is string => !!c)),
  );

  const entries = await Promise.all(
    codes.map(async (code) => {
      const res = await getAttendanceStatusDescription(code);
      if (res && !('error' in res)) {
        return [code, (res as AttendanceStatus).Description] as const;
      }
      // Fall back to the raw code so the UI never renders blank.
      return [code, code] as const;
    }),
  );

  return Object.fromEntries(entries);
};

export const useAttendanceStore = create<AttendanceState>((set) => ({
  records: [],
  holidays: [],
  statusMap: {},
  loading: false,
  error: null,

  fetchAttendance: async () => {
    set({ loading: true, error: null });

    const [recordRes, holidayRes] = await Promise.all([
      getAttendanceDef(),
      getPublicHolidays(),
    ]);

    if (recordRes && 'error' in recordRes) {
      set({
        error: (recordRes as AttendanceError).error,
        records: [],
        holidays: [],
        statusMap: {},
        loading: false,
      });
      return;
    }

    const records = recordRes as Attendance[];
    const holidays = Array.isArray(holidayRes) ? holidayRes : [];
    const statusMap = await loadStatusDescriptions(records);

    set({ records, holidays, statusMap, loading: false });
  },

  clear: () =>
    set({ records: [], holidays: [], statusMap: {}, loading: false, error: null }),
}));
