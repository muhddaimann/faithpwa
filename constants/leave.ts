import { MaterialCommunityIcons } from "@expo/vector-icons";

export type LeaveStatus = "All" | "Pending" | "Approved" | "Rejected" | "Withdraw";

export const leaveFilters: LeaveStatus[] = [
  "All",
  "Pending",
  "Approved",
  "Rejected",
  "Withdraw",
];

export const leaveStatusStyles: Record<
  Exclude<LeaveStatus, "All">,
  {
    label: string;
    color: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
  }
> = {
  Pending: {
    label: "Pending",
    color: "#F59E0B", // Amber
    icon: "clock-outline",
  },
  Approved: {
    label: "Approved",
    color: "#10B981", // Green
    icon: "check-circle-outline",
  },
  Rejected: {
    label: "Rejected",
    color: "#EF4444", // Red
    icon: "close-circle-outline",
  },
  Withdraw: {
    label: "Withdrawn",
    color: "#6B7280", // Gray
    icon: "arrow-u-left-top",
  },
};

export const LEAVE_REASONS = [
  { id: "personal", label: "Personal", icon: "account-outline" },
  { id: "emergency", label: "Emergency", icon: "alert-outline" },
  { id: "medical", label: "Medical", icon: "medical-bag" },
  { id: "family", label: "Family", icon: "home-outline" },
  { id: "others", label: "Others", icon: "dots-horizontal-circle-outline" },
];

export const LEAVE_TYPES = [
  { id: "AL", label: "Annual Leave", icon: "calendar-star" },
  { id: "MC", label: "Medical Leave", icon: "medical-bag" },
  { id: "UL", label: "Unpaid Leave", icon: "cash-remove" },
  { id: "EL", label: "Emergency Leave", icon: "alert-octagon" },
];

export const LEAVE_PERIODS = [
  { id: "full", label: "Full Day", icon: "clock-outline" },
  { id: "morning", label: "First Half", icon: "weather-sunny" },
  { id: "afternoon", label: "Second Half", icon: "weather-night" },
];
