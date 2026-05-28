import { useEffect, useMemo } from 'react';
import { useRoomStore } from '../contexts/api/roomStore';
import { getRoomAvailabilityByDay } from '../contexts/api/room';

export const useRoom = () => {
  const {
    rooms,
    myBookings,
    loading,
    error,
    fetchRooms,
    fetchBookings,
    createBooking,
    cancelBooking,
    clear,
  } = useRoomStore();

  // Initial fetch of rooms and bookings
  useEffect(() => {
    if (rooms.length === 0 && !loading && !error) {
      fetchRooms();
    }
    if (myBookings.length === 0 && !loading && !error) {
      fetchBookings();
    }
  }, [rooms.length, myBookings.length, loading, error, fetchRooms, fetchBookings]);

  // Statistics for dashboard
  const stats = useMemo(() => {
    const upcoming = myBookings.filter(b => b.Tag === 'Upcoming');
    return {
      activeBookings: upcoming.length,
      totalRooms: rooms.length,
      upcomingBooking: upcoming[0] || null, // For quick access to the next one
    };
  }, [myBookings, rooms]);

  return {
    rooms,
    myBookings,
    loading,
    error,
    stats,
    refreshRooms: fetchRooms,
    refreshBookings: fetchBookings,
    book: createBooking,
    cancel: cancelBooking,
    getAvailability: getRoomAvailabilityByDay,
    clearRoomData: clear,
  };
};
