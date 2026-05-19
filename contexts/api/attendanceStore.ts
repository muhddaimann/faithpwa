import { create } from "zustand";
import {
  getAttendanceDef,
  getPublicHolidays,
  Attendance,
  PublicHoliday,
  AttendanceError,
  PublicHolidayError,
} from "./attendance";

type AttendanceStore = {
  attendanceRecords: Attendance[];
  attendance: Attendance | null; // Today's or default record
  holidays: PublicHoliday[];
  loading: boolean;
  isInitialized: boolean;
  fetchAttendance: (force?: boolean) => Promise<void>;
  fetchHolidays: (force?: boolean) => Promise<void>;
  clear: () => void;
};

export const useAttendanceStore = create<AttendanceStore>((set, get) => ({
  attendanceRecords: [],
  attendance: null,
  holidays: [],
  loading: false,
  isInitialized: false,

  fetchAttendance: async (force = false) => {
    if (get().loading && !force) return;
    if (get().isInitialized && !force) return;

    set({ loading: true });
    try {
      const res = await getAttendanceDef();
      if (Array.isArray(res)) {
        // Assume the first record is the relevant one for today/main view (current day)
        // Usually the API returns records sorted by date descending or filtered by current month.
        set({ 
          attendanceRecords: res,
          attendance: res[0] || null, 
          isInitialized: true 
        });
      } else {
        set({ attendanceRecords: [], attendance: null, isInitialized: true });
      }
    } catch (e) {
      console.error("Error in fetchAttendance:", e);
      set({ attendanceRecords: [], attendance: null });
    } finally {
      set({ loading: false });
    }
  },

  fetchHolidays: async (force = false) => {
    if (get().holidays.length > 0 && !force) return;

    try {
      const res = await getPublicHolidays();
      if (Array.isArray(res)) {
        set({ holidays: res });
      }
    } catch (e) {
      console.error("Error in fetchHolidays:", e);
    }
  },

  clear: () =>
    set({
      attendanceRecords: [],
      attendance: null,
      holidays: [],
      loading: false,
      isInitialized: false,
    }),
}));
