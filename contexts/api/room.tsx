import api from './api';

export interface Room {
  room_id: number;
  Tower: string;
  Level: string;
  Room_Name: string;
  Department: string;
  Capacity: number;
  Max_Capacity: string;
}

export type RoomListResponse = Room[];

export interface ErrorResponse {
  error: string;
}

export interface Availability {
  [timeSlot: string]: {
    status: 'Available' | 'Booked';
    event_name: string | null;
    PIC: string | null;
  };
}

export interface RoomAvailabilityResponse {
  room_details: Room;
  availability: Availability;
}

export interface BookingResponse {
  success?: string;
  booking_number?: string;
  error?: string;
}

export interface BookingItem {
  booking_id: number;
  Booking_Num: string;
  Tower: string;
  Level: string;
  Room_Name: string;
  Event_Name: string;
  PIC: string;
  Start_Date: string;
  End_Date: string;
  Status: string;
  Status_Remark: string;
  Tag: 'Upcoming' | 'Past' | 'Cancelled';
}

export interface CancelBookingResponse {
  execute_success: boolean;
}

export type BookingListResponse = BookingItem[];

export const getRoomDetails = async (roomId: number): Promise<Room | ErrorResponse> => {
  try {
    const response = await api.get<Room | ErrorResponse>(`/roomBooking.php?room_id=${roomId}`);
    if ('error' in response.data) return { error: response.data.error };
    return response.data;
  } catch {
    return { error: 'Error fetching room details. Please try again later.' };
  }
};

export const getAllRooms = async (): Promise<RoomListResponse | ErrorResponse> => {
  try {
    const response = await api.get<RoomListResponse | ErrorResponse>(
      '/roomBooking.php?allRooms=true',
    );
    if ('error' in response.data) return { error: response.data.error };
    return response.data;
  } catch {
    return { error: 'Error fetching all rooms. Please try again later.' };
  }
};

export const getRoomAvailabilityByDay = async (
  roomId: number,
  date: string,
): Promise<RoomAvailabilityResponse | ErrorResponse> => {
  try {
    const response = await api.get<RoomAvailabilityResponse | ErrorResponse>(
      `/roomAvailability.php?room_id=${roomId}&date=${date}`,
    );
    if ('error' in response.data) return { error: response.data.error };
    return response.data;
  } catch {
    return { error: 'Error fetching room availability. Please try again later.' };
  }
};

export const bookRoom = async (
  bookDate: string,
  startTime: string,
  endTime: string,
  room: string,
  tower: string,
  level: string,
  purpose: string,
  PIC: string,
  email: string,
): Promise<BookingResponse | ErrorResponse> => {
  try {
    const response = await api.post<BookingResponse | ErrorResponse>('/roomBooking.php', {
      bookDate,
      start_time: startTime,
      end_time: endTime,
      room,
      tower,
      level,
      purpose,
      PIC,
      email,
    });
    if ('error' in response.data) return { error: response.data.error };
    return response.data;
  } catch {
    return { error: 'Error booking room. Please try again later.' };
  }
};

export const getMyBookings = async (): Promise<BookingListResponse | ErrorResponse> => {
  try {
    const response = await api.get<BookingListResponse | ErrorResponse>('/roomBooking.php?my=true');
    if ('error' in response.data) return { error: response.data.error };
    return response.data;
  } catch {
    return { error: 'Error fetching your bookings. Please try again later.' };
  }
};

export const cancelBooking = async (bookingNumber: string): Promise<CancelBookingResponse> => {
  try {
    const response = await api.post<CancelBookingResponse>('/roomBooking.php', {
      cancel_booking_number: bookingNumber,
    });
    return response.data;
  } catch {
    return { execute_success: false };
  }
};
