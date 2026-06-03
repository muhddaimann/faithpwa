import { create } from 'zustand';
import {
  Room,
  BookingItem,
  BookingResponse,
  getAllRooms as getAllRoomsApi,
  bookRoom as bookRoomApi,
  getMyBookings as getMyBookingsApi,
  cancelBooking as cancelBookingApi,
  ErrorResponse,
  CancelBookingResponse,
} from './room';

interface RoomState {
  rooms: Room[];
  myBookings: BookingItem[];
  selectedDate: string;
  loading: boolean;
  error: string | null;

  // Booking Flow State
  selectedRoom: Room | null;
  selectedSlots: string[];
  purpose: string;

  fetchRooms: () => Promise<void>;
  fetchBookings: () => Promise<void>;
  setSelectedDate: (date: string) => void;
  
  // State Setters
  setSelectedRoom: (room: Room | null) => void;
  setSelectedSlots: (slots: string[]) => void;
  setPurpose: (purpose: string) => void;
  toggleSlot: (slot: string) => void;

  createBooking: (
    bookDate: string,
    startTime: string,
    endTime: string,
    room: string,
    tower: string,
    level: string,
    purpose: string,
    PIC: string,
    email: string,
  ) => Promise<BookingResponse | ErrorResponse>;

  cancelBooking: (bookingNumber: string) => Promise<CancelBookingResponse>;
  clear: () => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  rooms: [],
  myBookings: [],
  selectedDate: new Date().toLocaleDateString('en-CA'),
  loading: false,
  error: null,

  selectedRoom: null,
  selectedSlots: [],
  purpose: "",

  fetchRooms: async () => {
    set({ loading: true, error: null });
    const res = await getAllRoomsApi();
    if ('error' in res) {
      set({ error: res.error, rooms: [], loading: false });
    } else {
      set({ rooms: res, loading: false });
    }
  },

  fetchBookings: async () => {
    set({ loading: true, error: null });
    const res = await getMyBookingsApi();
    if ('error' in res) {
      set({ error: res.error, myBookings: [], loading: false });
    } else {
      set({ myBookings: res, loading: false });
    }
  },

  setSelectedDate: (date: string) => set({ selectedDate: date }),

  setSelectedRoom: (room) => set({ selectedRoom: room }),
  setSelectedSlots: (slots) => set({ selectedSlots: slots }),
  setPurpose: (purpose) => set({ purpose }),
  
  toggleSlot: (slot) => {
    const { selectedSlots } = get();
    if (selectedSlots.includes(slot)) {
      set({ selectedSlots: selectedSlots.filter(s => s !== slot) });
    } else {
      const newSlots = [...selectedSlots, slot].sort((a, b) => {
        const timeToMinutes = (t: string) => {
          // Extract start time part from range "09:00 AM - 09:30 AM"
          const startPart = t.split(' - ')[0] || t;
          const [time, ampm] = startPart.split(' ');
          let [h, m] = time.split(':').map(Number);
          if (ampm === 'PM' && h < 12) h += 12;
          if (ampm === 'AM' && h === 12) h = 0;
          return h * 60 + m;
        };
        return timeToMinutes(a) - timeToMinutes(b);
      });
      set({ selectedSlots: newSlots });
    }
  },

  createBooking: async (bookDate, startTime, endTime, room, tower, level, purpose, PIC, email) => {
    set({ loading: true, error: null });
    const res = await bookRoomApi(
      bookDate,
      startTime,
      endTime,
      room,
      tower,
      level,
      purpose,
      PIC,
      email,
    );
    if ('error' in res) {
      set({ error: res.error, loading: false });
    } else {
      set({ error: null, selectedSlots: [], purpose: "", selectedRoom: null });
      await get().fetchBookings();
    }
    set({ loading: false });
    return res;
  },

  cancelBooking: async (bookingNumber) => {
    set({ loading: true, error: null });
    const res = await cancelBookingApi(bookingNumber);
    if (!res.execute_success) {
      set({ error: 'Failed to cancel booking.', loading: false });
    } else {
      await get().fetchBookings();
      set({ error: null });
    }
    set({ loading: false });
    return res;
  },

  clear: () => set({ rooms: [], myBookings: [], loading: false, error: null, selectedSlots: [], purpose: "", selectedRoom: null }),
}));
