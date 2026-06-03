import { useEffect, useMemo } from 'react';
import { useRoomStore } from '../contexts/api/roomStore';
import { getRoomAvailabilityByDay } from '../contexts/api/room';

export const useRoom = () => {
  const {
    rooms,
    myBookings,
    selectedDate,
    loading,
    error,
    fetchRooms,
    fetchBookings,
    setSelectedDate,
    
    selectedRoom,
    setSelectedRoom,
    selectedSlots,
    setSelectedSlots,
    toggleSlot,
    purpose,
    setPurpose,
    
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
      upcomingBooking: upcoming[0] || null,
    };
  }, [myBookings, rooms]);

  const isBookingValid = useMemo(() => {
    return selectedRoom !== null && selectedSlots.length > 0 && purpose.trim().length >= 3;
  }, [selectedRoom, selectedSlots, purpose]);

  // Return a prepared booking payload and calculation
  const getBookingPayload = () => {
    if (!selectedRoom || selectedSlots.length === 0) return null;

    const firstRange = selectedSlots[0];
    const lastRange = selectedSlots[selectedSlots.length - 1];

    const startTime = firstRange.split(' - ')[0];
    const endTime = lastRange.split(' - ')[1];

    return {
      bookDate: selectedDate,
      startTime,
      endTime,
      room: selectedRoom.Room_Name,
      tower: selectedRoom.Tower,
      level: selectedRoom.Level,
      purpose,
    };
  };

  return {
    rooms,
    myBookings,
    selectedDate,
    loading,
    error,
    stats,
    setSelectedDate,
    refreshRooms: fetchRooms,
    refreshBookings: fetchBookings,
    book: createBooking,
    cancel: cancelBooking,
    getAvailability: getRoomAvailabilityByDay,
    clearRoomData: clear,

    // Booking Flow State
    selectedRoom,
    setSelectedRoom,
    selectedSlots,
    setSelectedSlots,
    toggleSlot,
    purpose,
    setPurpose,
    isBookingValid,
    getBookingPayload,
  };
};
