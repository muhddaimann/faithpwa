import { MaterialCommunityIcons } from "@expo/vector-icons";

export type NewsflashPriority = "Critical" | "Important" | "Normal";

export type NewsflashItem = {
  id: number;
  type: string;
  priority: NewsflashPriority;
  title: string;
  content: string;
  timestamp: string;
};

// Mock data remains for initial development, but priorities are updated
export const newsflashes: NewsflashItem[] = [
  {
    id: 1,
    type: "Security Memo",
    priority: "Critical",
    title: "No Tailgating Entrance",
    content:
      "Employees are reminded not to allow unauthorized individuals to enter behind them when accessing the office premises.",
    timestamp: "10 mins ago",
  },

  {
    id: 2,
    type: "Maintenance",
    priority: "Important",
    title: "Water Disruption at Level 12",
    content:
      "Temporary water supply interruption will occur from 2 PM to 4 PM due to scheduled maintenance works.",
    timestamp: "25 mins ago",
  },

  {
    id: 3,
    type: "IT Notice",
    priority: "Critical",
    title: "VPN Password Reset Required",
    content:
      "All employees must reset their VPN password before Friday to maintain secure remote access connectivity.",
    timestamp: "1 hour ago",
  },

  {
    id: 4,
    type: "HR Announcement",
    priority: "Normal",
    title: "Casual Friday This Week",
    content:
      "Employees are allowed to wear smart casual attire this Friday during the internal appreciation event.",
    timestamp: "2 hours ago",
  },

  {
    id: 5,
    type: "Parking Notice",
    priority: "Important",
    title: "Basement B Closed Tonight",
    content:
      "Basement B parking area will be temporarily closed after 8 PM for cleaning and repainting works.",
    timestamp: "3 hours ago",
  },

  {
    id: 6,
    type: "Safety Reminder",
    priority: "Critical",
    title: "Fire Drill Tomorrow Morning",
    content:
      "Mandatory fire drill exercise will begin at 10 AM. Please follow evacuation instructions from marshals.",
    timestamp: "Yesterday",
  },
];

export const newsflashFilters: (NewsflashPriority | "All")[] = [
  "All",
  "Critical",
  "Important",
  "Normal",
];

export const newsflashPriorities: Record<
  NewsflashPriority,
  {
    label: string;
    color: string;
    cardColor: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
  }
> = {
  Critical: {
    label: "Critical",
    color: "#F87171", // Red
    cardColor: "#7F1D1D",
    icon: "alert",
  },

  Important: {
    label: "Important",
    color: "#FACC15", // Yellow
    cardColor: "#854D0E",
    icon: "alert-circle",
  },

  Normal: {
    label: "Normal",
    color: "#4ADE80", // Green
    cardColor: "#166534",
    icon: "information",
  },
};
