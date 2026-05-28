import { MaterialCommunityIcons } from "@expo/vector-icons";

export type AttendanceStatus = "Present" | "Late" | "Absent" | "Leave" | "Weekend";

export const attendanceStatuses: Record<
  string,
  {
    label: string;
    dotColor: string;
    cardColor: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    message?: string;
    showShift: boolean;
  }
> = {
  working: {
    label: "Working",
    dotColor: "#FACC15",
    cardColor: "#A16207",
    icon: "progress-clock",
    showShift: true,
  },

  present: {
    label: "Present",
    dotColor: "#4ADE80",
    cardColor: "#166534",
    icon: "check-circle",
    showShift: true,
  },

  late: {
    label: "Late",
    dotColor: "#FB923C",
    cardColor: "#9A3412",
    icon: "clock-alert",
    showShift: true,
  },

  absent: {
    label: "Absent",
    dotColor: "#F87171",
    cardColor: "#991B1B",
    icon: "close-circle",
    message: "You are marked absent today.",
    showShift: false,
  },

  weekend: {
    label: "Rest Day",
    dotColor: "#94A3B8",
    cardColor: "#334155",
    icon: "calendar-blank",
    message: "It's your rest day. Enjoy your weekend!",
    showShift: false,
  },

  annualLeave: {
    label: "Annual Leave",
    dotColor: "#60A5FA",
    cardColor: "#1D4ED8",
    icon: "beach",
    message: "Enjoy your well deserved break.",
    showShift: false,
  },

  sickLeave: {
    label: "Sick Leave",
    dotColor: "#C084FC",
    cardColor: "#7E22CE",
    icon: "medical-bag",
    message: "Get well soon and rest properly.",
    showShift: false,
  },

  publicHoliday: {
    label: "Public Holiday",
    dotColor: "#FB923C",
    cardColor: "#C2410C",
    icon: "calendar-star",
    message: "Enjoy your public holiday.",
    showShift: false,
  },
};

export const getStatusFromRecord = (record: any) => {
  if (!record) return "working";

  // Map API status codes
  if (record.status === 'RD') return "weekend";
  if (record.status === 'AL') return "annualLeave";
  if (record.status === 'SL' || record.status === 'MC') return "sickLeave";
  if (record.status === 'PH') return "publicHoliday";

  // Check login status for attendance
  if (record.login_status === 'late') return "late";
  if (record.login_status === 'exact' || record.login_status === 'early') return "present";
  
  // If not clocked in but supposed to
  if (record.login_status === 'false' && record.status === 'Re') {
    return "working";
  }

  return "working";
};
