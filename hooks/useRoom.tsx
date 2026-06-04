import { useEffect, useMemo, useCallback } from 'react';
import { View } from 'react-native';
import { Text, Divider, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRoomStore } from '../contexts/api/roomStore';
import { getRoomAvailabilityByDay, type BookingItem, type Room } from '../contexts/api/room';
import { useOverlay } from '../contexts/overlayContext';
import { useStaff } from './useStaff';

export type TimeSlot = {
  label: string;
  isAvailable: boolean;
  pic: string | null;
  eventName: string | null;
  isPast?: boolean;
};

export const useRoom = () => {
  const theme = useTheme();
  const router = useRouter();
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
  const getBookingPayload = useCallback(() => {
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
  }, [selectedRoom, selectedSlots, selectedDate, purpose]);

  const confirmBooking = useCallback(async (onSuccess?: () => void) => {
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
        // Close sheet immediately
        onSuccess?.();
        
        // Delay toast slightly to allow loader to dismiss and navigate
        setTimeout(() => {
          toast({ message: "Room booked successfully!", variant: 'success' });
          router.replace('/home/room/bookings');
        }, 300);
        return res;
      }
    } catch (err: any) {
      hideLoader();
      toast({ message: err.message || "Failed to book room", variant: 'error' });
      return { error: err.message };
    }
  }, [getBookingPayload, showLoader, createBooking, staff, hideLoader, toast, router]);

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

  const prepareBooking = useCallback(async (room: Room) => {
    showLoader(`Checking availability for ${room.Room_Name}...`);
    
    try {
      const res = await getRoomAvailabilityByDay(room.room_id, selectedDate);
      hideLoader();

      if ('error' in res) {
        toast({ message: res.error, variant: 'error' });
        return null;
      }

      // Reset flow state
      setSelectedRoom(room);
      setSelectedSlots([]);
      setPurpose("");

      const now = new Date();
      const localToday = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
      const isToday = selectedDate === localToday;

      const allSlots: TimeSlot[] = Object.entries(res.availability)
        .map(([timeRange, data]) => {
          let isPast = false;
          const startTimeStr = timeRange.split(' - ')[0];

          if (isToday && startTimeStr) {
            const [timePart, ampm] = startTimeStr.split(' ');
            let [hours, minutes] = timePart.split(':').map(Number);
            
            if (ampm === 'PM' && hours < 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
            
            const slotStartTime = new Date();
            slotStartTime.setHours(hours, minutes, 0, 0);
            
            if (now >= slotStartTime) {
              isPast = true;
            }
          }

          return {
            label: timeRange,
            isAvailable: data.status === 'Available',
            pic: data.PIC,
            eventName: data.event_name,
            isPast
          };
        });

      // Filter: Keep a slot if it's not past, OR if its row partner (same hour) is not past
      const timeSlots = allSlots.filter((slot, index) => {
        if (!slot.isPast) return true;
        
        // Check partner in the same 2-column row
        const isEven = index % 2 === 0;
        const partnerIndex = isEven ? index + 1 : index - 1;
        const partner = allSlots[partnerIndex];
        
        return partner && !partner.isPast;
      });

      if (timeSlots.length === 0) {
        toast({ message: "No more available slots for today.", variant: 'info' });
        return null;
      }

      return timeSlots;
    } catch (error: any) {
      hideLoader();
      toast({ message: "Failed to fetch availability", variant: 'error' });
      return null;
    }
  }, [selectedDate, setSelectedRoom, setSelectedSlots, setPurpose, showLoader, hideLoader, toast]);

  const proceedToBooking = useCallback(() => {
    hideSheet();
    // Allow sheet animation to complete before navigation
    setTimeout(() => {
      router.push('/home/room/book');
    }, 250);
  }, [hideSheet, router]);

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
    prepareBooking,
    proceedToBooking,
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
    router,
  };
};
