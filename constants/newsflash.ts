import { MaterialCommunityIcons } from "@expo/vector-icons";

export const newsflashes = [
  {
    id: 1,
    type: "Security Memo",
    priority: "High",
    title: "No Tailgating Entrance",
    content:
      "Employees are reminded not to allow unauthorized individuals to enter behind them when accessing the office premises.",
    timestamp: "10 mins ago",
  },

  {
    id: 2,
    type: "Maintenance",
    priority: "Medium",
    title: "Water Disruption at Level 12",
    content:
      "Temporary water supply interruption will occur from 2 PM to 4 PM due to scheduled maintenance works.",
    timestamp: "25 mins ago",
  },

  {
    id: 3,
    type: "IT Notice",
    priority: "High",
    title: "VPN Password Reset Required",
    content:
      "All employees must reset their VPN password before Friday to maintain secure remote access connectivity.",
    timestamp: "1 hour ago",
  },

  {
    id: 4,
    type: "HR Announcement",
    priority: "Low",
    title: "Casual Friday This Week",
    content:
      "Employees are allowed to wear smart casual attire this Friday during the internal appreciation event.",
    timestamp: "2 hours ago",
  },

  {
    id: 5,
    type: "Parking Notice",
    priority: "Medium",
    title: "Basement B Closed Tonight",
    content:
      "Basement B parking area will be temporarily closed after 8 PM for cleaning and repainting works.",
    timestamp: "3 hours ago",
  },

  {
    id: 6,
    type: "Safety Reminder",
    priority: "High",
    title: "Fire Drill Tomorrow Morning",
    content:
      "Mandatory fire drill exercise will begin at 10 AM. Please follow evacuation instructions from marshals.",
    timestamp: "Yesterday",
  },
];

export const newsflashPriorities: Record<
  string,
  {
    label: string;
    color: string;
    cardColor: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
  }
> = {
  High: {
    label: "High",
    color: "#F87171",
    cardColor: "#7F1D1D",
    icon: "alert",
  },

  Medium: {
    label: "Medium",
    color: "#FACC15",
    cardColor: "#854D0E",
    icon: "alert-circle",
  },

  Low: {
    label: "Low",
    color: "#4ADE80",
    cardColor: "#166534",
    icon: "information",
  },
};
