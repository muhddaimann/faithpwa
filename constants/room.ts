export type RoomType = "meeting" | "discussion" | "training" | "focus" | "board" | "huddle";

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  meeting: "Meeting Room",
  discussion: "Discussion Room",
  training: "Training Room",
  focus: "Focus Pod",
  board: "Board Room",
  huddle: "Huddle Space",
};

export const roomFilters = [
  { label: "All Rooms", value: "all" },
  { label: "Emerald Tower", value: "Emerald Tower" },
  { label: "Sapphire Tower", value: "Sapphire Tower" },
  { label: "Ruby Tower", value: "Ruby Tower" },
];

export const levelFilters = [
  { label: "All Levels", value: "all" },
  { label: "Level 5", value: "Level 5" },
  { label: "Level 8", value: "Level 8" },
  { label: "Level 10", value: "Level 10" },
  { label: "Level 12", value: "Level 12" },
  { label: "Level 15", value: "Level 15" },
];
