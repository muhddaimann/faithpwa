import { create } from 'zustand';
import {
  BookingItem,
  BookingResponse,
  bookRoom as bookRoomApi,
  getMyBookings as getMyBookingsApi,
  cancelBooking as cancelBookingApi,
  getAllRooms as getAllRoomsApi,
  getRoomAvailabilityByDay as getRoomAvailabilityApi,
  ErrorResponse,
  CancelBookingResponse,
  Room,
  Availability,
} from '../api/room';

interface RoomState {
  rooms: Room[];
  myBookings: BookingItem[];
  availability: Record<string, Availability>; // Key: roomId_date
  loading: boolean;
  isInitialized: boolean;
  isRoomsInitialized: boolean;
  error: string | null;

  fetchBookings: (force?: boolean) => Promise<void>;
  fetchRooms: (force?: boolean) => Promise<void>;
  fetchAvailability: (roomId: number, date: string, force?: boolean) => Promise<void>;
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
    roomId: number,
  ) => Promise<BookingResponse | ErrorResponse>;

  cancelBooking: (bookingNumber: string, roomName: string, date: string) => Promise<CancelBookingResponse>;

  clearAvailability: (roomId: number, date: string) => void;
  clear: () => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  rooms: [],
  myBookings: [],
  availability: {},
  loading: false,
  isInitialized: false,
  isRoomsInitialized: false,
  error: null,

  fetchBookings: async (force = false) => {
    set({ loading: true, error: null });
    const res = await getMyBookingsApi();
    if ('error' in res) {
      set({ error: res.error, myBookings: [], loading: false });
    } else {
      set({ myBookings: res, isInitialized: true, loading: false });
    }
  },

  fetchRooms: async (force = false) => {
    set({ loading: true });
    const res = await getAllRoomsApi();
    if ('error' in res) {
      set({ error: res.error, rooms: [], loading: false });
    } else {
      set({ rooms: res, isRoomsInitialized: true, loading: false });
    }
  },

  fetchAvailability: async (roomId: number, date: string, force = false) => {
    const key = `${roomId}_${date}`;
    if (get().availability[key] && !force) return;

    set({ loading: true });
    const res = await getRoomAvailabilityApi(roomId, date);
    if ('error' in res) {
      set({ error: res.error, loading: false });
    } else {
      set((state) => ({
        availability: { ...state.availability, [key]: res.availability },
        loading: false
      }));
    }
  },

  createBooking: async (bookDate, startTime, endTime, room, tower, level, purpose, PIC, email, roomId) => {
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
      set({ error: null });
      get().clearAvailability(roomId, bookDate);
      await get().fetchBookings(true);
    }
    set({ loading: false });
    return res;
  },

  cancelBooking: async (bookingNumber, roomName, date) => {
    set({ loading: true, error: null });
    const res = await cancelBookingApi(bookingNumber);
    if (!res.execute_success) {
      set({ error: 'Failed to cancel booking.', loading: false });
    } else {
      // Find roomId by name since BookingItem doesn't have it
      const room = get().rooms.find(r => r.Room_Name === roomName);
      if (room) {
        get().clearAvailability(room.room_id, date);
      }
      await get().fetchBookings(true);
      set({ error: null });
    }
    set({ loading: false });
    return res;
  },

  clearAvailability: (roomId, date) => {
    const key = `${roomId}_${date}`;
    const newAvail = { ...get().availability };
    delete newAvail[key];
    set({ availability: newAvail });
  },

  clear: () => set({ 
    rooms: [], 
    myBookings: [], 
    availability: {},
    loading: false, 
    isInitialized: false, 
    isRoomsInitialized: false, 
    error: null 
  }),
}));
