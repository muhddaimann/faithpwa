import { useEffect, useMemo, useCallback } from 'react';
import { View } from 'react-native';
import { Text, Divider, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoomStore } from '../contexts/api/roomStore';
import { getRoomAvailabilityByDay, type BookingItem } from '../contexts/api/room';
import { useOverlay } from '../contexts/overlayContext';
import { useStaff } from './useStaff';

export const useRoom = () => {
  const theme = useTheme();
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
    cancelBooking: apiCancelBooking,
    clear,
  } = useRoomStore();

  const { staff } = useStaff();
  const { toast, showLoader, hideLoader, showSheet, hideSheet, confirm } = useOverlay();

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

  const confirmBooking = async (onSuccess?: () => void) => {
    const payload = getBookingPayload();
    if (!payload) return;

    showLoader("Securing your room...");

    try {
      const res = await createBooking(
        payload.bookDate,
        payload.startTime,
        payload.endTime,
        payload.room,
        payload.tower,
        payload.level,
        payload.purpose,
        staff?.first_name || "Staff",
        staff?.email || ""
      );

      // We wait for the store's loading state to settle
      hideLoader();

      if ('error' in res) {
        toast({ message: res.error, variant: 'error' });
        return res;
      } else {
        // Delay slightly to allow loader to dismiss before closing sheet and showing toast
        setTimeout(() => {
          onSuccess?.();
          toast({ message: "Room booked successfully!", variant: 'success' });
        }, 300);
        return res;
      }
    } catch (err: any) {
      hideLoader();
      toast({ message: err.message || "Failed to book room", variant: 'error' });
      return { error: err.message };
    }
  };

  const handleCancel = useCallback((booking: BookingItem) => {
    confirm({
      title: 'Cancel Reservation',
      message: 'Are you sure you want to cancel this room booking?',
      confirmText: 'Cancel Booking',
      isDestructive: true,
      onConfirm: async () => {
        showLoader("Cancelling reservation...");
        try {
          const res = await apiCancelBooking(booking.Booking_Num);
          hideLoader();
          if (res.execute_success) {
            hideSheet();
            setTimeout(() => {
                toast({
                    message: "Booking cancelled successfully",
                    variant: "success"
                });
            }, 300);
          } else {
            toast({
                message: "Failed to cancel booking",
                variant: "error"
            });
          }
        } catch (err) {
          hideLoader();
          toast({
            message: "An unexpected error occurred",
            variant: "error"
          });
        }
      }
    });
  }, [apiCancelBooking, confirm, showLoader, hideLoader, hideSheet, toast]);

  const showBookingDetails = useCallback((booking: BookingItem) => {
    const isUpcoming = booking.Tag === 'Upcoming';
    
    showSheet({
      content: (
        <View style={{ gap: 20, paddingBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ 
              backgroundColor: booking.Tag === 'Upcoming' ? '#3B82F620' : booking.Tag === 'Cancelled' ? '#EF444420' : '#10B98120', 
              padding: 12, 
              borderRadius: 16 
            }}>
              <MaterialCommunityIcons 
                name={booking.Tag === 'Upcoming' ? "calendar-clock" : booking.Tag === 'Cancelled' ? "calendar-remove" : "calendar-check"} 
                size={32} 
                color={booking.Tag === 'Upcoming' ? '#3B82F6' : booking.Tag === 'Cancelled' ? '#EF4444' : '#10B981'} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="titleLarge" style={{ fontWeight: "800" }}>{booking.Room_Name}</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{booking.Booking_Num} • {booking.Tag}</Text>
            </View>
          </View>

          <Divider />

          <View style={{ gap: 8 }}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, fontWeight: "700" }}>TIME & LOCATION</Text>
            <Text variant="titleMedium" style={{ fontWeight: "700" }}>
                {new Date(booking.Start_Date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
            <Text variant="bodyLarge">
                {new Date(booking.Start_Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.End_Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {booking.Tower} • {booking.Level}
            </Text>
          </View>

          <View style={{ gap: 8 }}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, fontWeight: "700" }}>PURPOSE</Text>
            <View style={{ backgroundColor: theme.colors.surfaceVariant + "40", padding: 16, borderRadius: 12 }}>
              <Text variant="bodyMedium" style={{ lineHeight: 22 }}>{booking.Event_Name}</Text>
            </View>
          </View>

          {isUpcoming && (
            <Button 
              mode="contained-tonal" 
              onPress={() => handleCancel(booking)}
              style={{ marginTop: 8, borderRadius: 12 }}
              buttonColor={theme.colors.errorContainer}
              textColor={theme.colors.onErrorContainer}
              contentStyle={{ height: 48 }}
            >
              CANCEL RESERVATION
            </Button>
          )}
        </View>
      )
    });
  }, [showSheet, theme, handleCancel]);

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
    confirmBooking,
    cancel: handleCancel,
    showBookingDetails,
    getAvailability: getRoomAvailabilityByDay,
    clearRoomData: clear,

    // Booking Flow State
    staff,
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
