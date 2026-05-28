import { create } from 'zustand';
import {
  Attendance,
  getAttendanceDef,
  AttendanceAPIResponse,
  AttendanceError,
} from './attendance';

interface AttendanceState {
  records: Attendance[];
  loading: boolean;
  error: string | null;

  fetchAttendance: () => Promise<void>;
  clear: () => void;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  records: [],
  loading: false,
  error: null,

  fetchAttendance: async () => {
    set({ loading: true, error: null });
    const res = await getAttendanceDef();
    if (res && 'error' in res) {
      set({ error: (res as AttendanceError).error, records: [], loading: false });
    } else {
      set({ records: res as Attendance[], loading: false });
    }
  },

  clear: () => set({ records: [], loading: false, error: null }),
}));
