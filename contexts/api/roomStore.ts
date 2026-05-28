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
  loading: boolean;
  error: string | null;

  fetchRooms: () => Promise<void>;
  fetchBookings: () => Promise<void>;
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
  loading: false,
  error: null,

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
      set({ error: null });
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

  clear: () => set({ rooms: [], myBookings: [], loading: false, error: null }),
}));
