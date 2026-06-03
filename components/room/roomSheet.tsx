import React, { useState, useMemo } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Text, Button, Divider, useTheme, TextInput, Chip } from "react-native-paper";
import { useDesign } from "../../contexts/designContext";
import { useRoom } from "../../hooks/useRoom";
import { useOverlay } from "../../contexts/overlayContext";
import { Room } from "../../contexts/api/room";

type Props = {
  room: Room;
  timeSlots: {
    label: string;
    isAvailable: boolean;
    pic: string | null;
    eventName: string | null;
    isPast?: boolean;
  }[];
};

export default function RoomTimeSheet({ room, timeSlots }: Props) {
  const theme = useTheme();
  const tokens = useDesign();
  const { hideSheet, toast } = useOverlay();
  const { 
    staff,
    selectedSlots, 
    setSelectedSlots,
    purpose, 
    setPurpose, 
    confirmBooking,
    isBookingValid,
    selectedDate,
    loading
  } = useRoom();

  const [step, setStep] = useState(1); // 1: Slots, 2: Purpose
  const [viewingSlot, setViewingSlot] = useState<typeof timeSlots[0] | null>(null);

  const handleSlotPress = (index: number) => {
    const slot = timeSlots[index];
    
    if (slot.isPast) {
      toast("Cannot select past time slots");
      setSelectedSlots([]);
      return;
    }

    if (!slot.isAvailable) {
      setViewingSlot(slot);
      setSelectedSlots([]);
      return;
    }

    setViewingSlot(null);

    // If tapping an already selected slot, clear everything
    if (selectedSlots.includes(slot.label)) {
      setSelectedSlots([]);
      return;
    }

    if (selectedSlots.length === 0) {
      setSelectedSlots([slot.label]);
      return;
    }

    const startIndex = timeSlots.findIndex(s => s.label === selectedSlots[0]);
    const startIdx = Math.min(startIndex, index);
    const endIdx = Math.max(startIndex, index);
    const range = timeSlots.slice(startIdx, endIdx + 1);

    // Check if the range contains any unavailable slots
    if (range.some(s => !s.isAvailable || s.isPast)) {
      setSelectedSlots([]);
      toast("Range contains unavailable slots");
      return;
    }

    setSelectedSlots(range.map(s => s.label));
  };

  const bookingSummary = useMemo(() => {
    if (selectedSlots.length === 0) return null;
    const firstSlot = selectedSlots[0];
    const lastSlot = selectedSlots[selectedSlots.length - 1];
    
    if (!firstSlot || !lastSlot) return null;

    const start = firstSlot.split(' - ')[0];
    const end = lastSlot.split(' - ')[1];
    const duration = selectedSlots.length * 0.5;
    return { start, end, duration };
  }, [selectedSlots]);

  const handleConfirm = async () => {
    await confirmBooking(hideSheet);
  };

  if (step === 1) {
    return (
      <View style={{ maxHeight: 580 }}>
        {/* Header - Sticky */}
        <View style={{ paddingBottom: tokens.spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text variant="titleLarge" style={{ fontWeight: "900", letterSpacing: -0.5 }}>{room.Room_Name}</Text>
            <Chip 
              compact 
              style={{ backgroundColor: theme.colors.primaryContainer }}
              textStyle={{ color: theme.colors.onPrimaryContainer, fontWeight: '800', fontSize: 10 }}
            >
              {room.Capacity} Pax
            </Chip>
          </View>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '600' }}>
            {selectedDate} • {room.Tower} • {room.Level}
          </Text>
          <Divider style={{ marginTop: tokens.spacing.md }} />
        </View>

        {/* Scrollable Slots */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ paddingVertical: tokens.spacing.xs }}
        >
          <Text variant="labelLarge" style={{ fontWeight: '800', color: theme.colors.onSurface, marginBottom: tokens.spacing.sm }}>
            Select Time Range
          </Text>
          
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing.xs }}>
            {timeSlots.map((slot, index) => {
              const isSelected = selectedSlots.includes(slot.label);
              const isStart = isSelected && selectedSlots[0] === slot.label;
              const isEnd = isSelected && selectedSlots[selectedSlots.length - 1] === slot.label;
              const isMiddle = isSelected && !isStart && !isEnd;

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSlotPress(index)}
                  activeOpacity={0.7}
                  style={{
                    width: "48.5%", // 2 columns (1 hour per row)
                    height: 52,
                    borderRadius: tokens.radii.md,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isSelected 
                      ? isMiddle ? theme.colors.primary + "15" : theme.colors.primary
                      : !slot.isAvailable && !slot.isPast
                        ? theme.colors.errorContainer + "30" // Distinct color for booked
                        : slot.isAvailable && !slot.isPast
                          ? theme.colors.surfaceVariant + "40" 
                          : theme.colors.surfaceVariant + "10",
                    borderWidth: 1,
                    borderColor: isSelected 
                        ? "transparent"
                        : !slot.isAvailable && !slot.isPast
                            ? theme.colors.error + "20"
                            : slot.isAvailable && !slot.isPast 
                                ? theme.colors.outline + "15" 
                                : "transparent",
                    opacity: slot.isPast ? 0.5 : 1,
                    ...(isStart && selectedSlots.length > 1 && { borderTopRightRadius: 0, borderBottomRightRadius: 0 }),
                    ...(isEnd && selectedSlots.length > 1 && { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }),
                    ...(isMiddle && { borderRadius: 0 }),
                  }}
                >
                  <Text style={{ 
                    fontSize: 10, 
                    fontWeight: isSelected ? "900" : "700",
                    color: isSelected 
                      ? isMiddle ? theme.colors.primary : theme.colors.onPrimary
                      : !slot.isAvailable && !slot.isPast
                        ? theme.colors.error
                        : slot.isAvailable && !slot.isPast 
                            ? theme.colors.onSurface 
                            : theme.colors.onSurfaceVariant,
                  }}>
                    {slot.label.replace(' - ', ' - ')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Footer - Sticky */}
        <View style={{ paddingTop: tokens.spacing.md, gap: tokens.spacing.md }}>
          <View style={{ flexDirection: 'row', gap: tokens.spacing.sm, justifyContent: 'center', flexWrap: 'wrap' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: theme.colors.surfaceVariant + "40", borderWidth: 1, borderColor: theme.colors.outline + "20" }} />
                  <Text style={{ fontSize: 9, fontWeight: '700', color: theme.colors.onSurfaceVariant }}>Available</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: theme.colors.primary }} />
                  <Text style={{ fontSize: 9, fontWeight: '700', color: theme.colors.onSurfaceVariant }}>Selected</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: theme.colors.errorContainer + "30", borderWidth: 1, borderColor: theme.colors.error + "20" }} />
                  <Text style={{ fontSize: 9, fontWeight: '700', color: theme.colors.onSurfaceVariant }}>Booked</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: theme.colors.surfaceVariant + "10" }} />
                  <Text style={{ fontSize: 9, fontWeight: '700', color: theme.colors.onSurfaceVariant }}>Past</Text>
              </View>
          </View>

          <Button
            mode="contained"
            disabled={selectedSlots.length === 0}
            onPress={() => setStep(2)}
            contentStyle={{ height: 54 }}
            style={{ 
              borderRadius: tokens.radii.xl,
            }}
            buttonColor={viewingSlot ? theme.colors.surfaceVariant : theme.colors.primary}
            labelStyle={{ 
              fontWeight: '900', 
              fontSize: viewingSlot ? 13 : 15,
              color: viewingSlot ? theme.colors.onSurfaceVariant : theme.colors.onPrimary
            }}
          >
            {viewingSlot 
              ? `${viewingSlot.eventName || "Private Event"}`
              : bookingSummary 
                ? `Selected: ${bookingSummary.start} - ${bookingSummary.end}`
                : "Select Time Range"
            }
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={{ maxHeight: 580 }}>
      {/* Header - Sticky */}
      <View style={{ paddingBottom: tokens.spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="titleLarge" style={{ fontWeight: "900", letterSpacing: -0.5 }}>Booking Details</Text>
            <Button 
                mode="text" 
                onPress={() => setStep(1)} 
                compact 
                labelStyle={{ fontWeight: '800', fontSize: 13 }}
            >
                Edit Time
            </Button>
        </View>
        
        <View style={{ 
            backgroundColor: theme.colors.primaryContainer + "15", 
            padding: tokens.spacing.md, 
            borderRadius: tokens.radii.xl,
            borderWidth: 1,
            borderColor: theme.colors.primary + "10",
            marginTop: tokens.spacing.sm,
            gap: 2
        }}>
            <Text variant="bodyLarge" style={{ fontWeight: '900', color: theme.colors.primary }}>{room.Room_Name}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '700' }}>
                {selectedDate} • {bookingSummary?.start} - {bookingSummary?.end}
            </Text>
        </View>
      </View>

      {/* Scrollable Form */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingVertical: tokens.spacing.sm, gap: tokens.spacing.lg }}
      >
         <View style={{ gap: 6 }}>
            <Text variant="labelLarge" style={{ fontWeight: '800', marginLeft: 4 }}>Purpose of Use</Text>
            <TextInput
                mode="outlined"
                placeholder="e.g. Project Discussion, Team Meeting"
                value={purpose}
                onChangeText={setPurpose}
                outlineStyle={{ borderRadius: tokens.radii.xl }}
                left={<TextInput.Icon icon="pencil-outline" color={theme.colors.primary} />}
            />
         </View>

         <View style={{ gap: 6 }}>
            <Text variant="labelLarge" style={{ fontWeight: '800', marginLeft: 4 }}>Person In Charge</Text>
            <TextInput
                mode="outlined"
                value={staff?.first_name || ""}
                editable={false}
                outlineStyle={{ borderRadius: tokens.radii.xl }}
                left={<TextInput.Icon icon="account-outline" color={theme.colors.onSurfaceVariant} />}
            />
         </View>
      </ScrollView>

      {/* Footer - Sticky */}
      <View style={{ paddingTop: tokens.spacing.xl }}>
        <Button
            mode="contained"
            disabled={!isBookingValid || loading}
            onPress={handleConfirm}
            contentStyle={{ height: 56 }}
            style={{ borderRadius: tokens.radii.pill }}
            labelStyle={{ fontWeight: '900', fontSize: 16 }}
            loading={loading}
        >
            Confirm Reservation
        </Button>
      </View>
    </View>
  );
}
