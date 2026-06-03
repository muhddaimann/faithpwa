import React, { useState, useMemo } from "react";
import { View, TouchableOpacity } from "react-native";
import { Text, Button, Divider, useTheme, TextInput, Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDesign } from "../../contexts/designContext";
import { useRoom } from "../../hooks/useRoom";
import { useStaff } from "../../hooks/useStaff";
import { useOverlay } from "../../contexts/overlayContext";
import { Room } from "../../contexts/api/room";

type Props = {
  room: Room;
  timeSlots: {
    label: string;
    isAvailable: boolean;
    pic: string | null;
    eventName: string | null;
  }[];
};

export default function RoomTimeSheet({ room, timeSlots }: Props) {
  const theme = useTheme();
  const tokens = useDesign();
  const { staff } = useStaff();
  const { toast, showLoader, hideLoader, hideSheet } = useOverlay();
  const { 
    selectedSlots, 
    setSelectedSlots,
    purpose, 
    setPurpose, 
    book,
    isBookingValid,
    selectedDate 
  } = useRoom();

  const [step, setStep] = useState(1); // 1: Slots, 2: Purpose

  const handleSlotPress = (index: number) => {
    const slot = timeSlots[index];
    if (!slot.isAvailable) return;

    // If 0 selected or already a full range selected, start new selection
    if (selectedSlots.length === 0 || selectedSlots.length > 1) {
      if (selectedSlots.length === 1 && selectedSlots[0] === slot.label) {
        setSelectedSlots([]);
      } else {
        setSelectedSlots([slot.label]);
      }
      return;
    }

    // If exactly 1 selected
    const startIndex = timeSlots.findIndex(s => s.label === selectedSlots[0]);
    
    if (index === startIndex) {
      setSelectedSlots([]);
      return;
    }

    if (index < startIndex) {
      // New start
      setSelectedSlots([slot.label]);
      return;
    }

    // Attempting to select a range
    const range = timeSlots.slice(startIndex, index + 1);
    const hasOccupied = range.some(s => !s.isAvailable);

    if (hasOccupied) {
      // If there's a gap, reset to the clicked slot as new start
      setSelectedSlots([slot.label]);
    } else {
      setSelectedSlots(range.map(s => s.label));
    }
  };

  const bookingSummary = useMemo(() => {
    if (selectedSlots.length === 0) return null;
    const firstSlot = selectedSlots[0];
    const lastSlot = selectedSlots[selectedSlots.length - 1];
    
    if (!firstSlot || !lastSlot) return null;

    const start = firstSlot.split(' - ')[0];
    const end = lastSlot.split(' - ')[1];
    const duration = selectedSlots.length * 0.5; // Assuming 30min slots
    return { start, end, duration };
  }, [selectedSlots]);

  const handleConfirm = async () => {
    if (!bookingSummary) return;

    showLoader("Securing your room...");
    
    try {
      const res = await book(
        selectedDate,
        bookingSummary.start,
        bookingSummary.end,
        room.Room_Name,
        room.Tower,
        room.Level,
        purpose,
        staff?.first_name || "Staff",
        staff?.email || ""
      );

      if ('error' in res) {
        toast({ message: res.error, variant: 'error' });
      } else {
        toast({ message: "Room booked successfully!", variant: 'success' });
        hideSheet();
      }
    } catch (err: any) {
      toast({ message: err.message || "Failed to book room", variant: 'error' });
    } finally {
      hideLoader();
    }
  };

  if (step === 1) {
    return (
      <View style={{ gap: tokens.spacing.lg }}>
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="titleLarge" style={{ fontWeight: "800", letterSpacing: -0.5 }}>{room.Room_Name}</Text>
            <Chip 
              compact 
              style={{ backgroundColor: theme.colors.primaryContainer }}
              textStyle={{ color: theme.colors.onPrimaryContainer, fontWeight: '700', fontSize: 10 }}
            >
              {room.Capacity} Pax
            </Chip>
          </View>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {selectedDate} • {room.Tower} • {room.Level}
          </Text>
        </View>

        <Divider />

        <View style={{ gap: tokens.spacing.md }}>
          <Text variant="labelMedium" style={{ fontWeight: '700', color: theme.colors.onSurfaceVariant }}>
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
                  disabled={!slot.isAvailable}
                  onPress={() => handleSlotPress(index)}
                  activeOpacity={0.7}
                  style={{
                    width: "23.5%", // 4 columns
                    height: 54,
                    borderRadius: tokens.radii.md,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isSelected 
                      ? isMiddle ? theme.colors.primary + "20" : theme.colors.primary
                      : slot.isAvailable 
                        ? theme.colors.surfaceVariant + "40" 
                        : theme.colors.surfaceVariant + "10",
                    borderWidth: isSelected ? 0 : 1,
                    borderColor: slot.isAvailable ? theme.colors.outline + "20" : "transparent",
                    position: 'relative',
                    // Pill effect logic
                    ...(isStart && selectedSlots.length > 1 && { borderTopRightRadius: 0, borderBottomRightRadius: 0 }),
                    ...(isEnd && selectedSlots.length > 1 && { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }),
                    ...(isMiddle && { borderRadius: 0 }),
                  }}
                >
                  <Text style={{ 
                    fontSize: 10, 
                    fontWeight: isSelected ? "800" : "600",
                    color: isSelected 
                      ? isMiddle ? theme.colors.primary : theme.colors.onPrimary
                      : slot.isAvailable ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
                    opacity: slot.isAvailable ? 1 : 0.5
                  }}>
                    {slot.label.split(' - ')[0].replace(/ AM| PM/g, '')}
                  </Text>
                  
                  {isStart && selectedSlots.length > 1 && (
                    <Text style={{ fontSize: 7, fontWeight: '800', color: theme.colors.onPrimary, marginTop: 2 }}>START</Text>
                  )}
                  {isEnd && selectedSlots.length > 1 && (
                    <Text style={{ fontSize: 7, fontWeight: '800', color: theme.colors.onPrimary, marginTop: 2 }}>END</Text>
                  )}
                  {!slot.isAvailable && (
                    <MaterialCommunityIcons name="lock" size={10} color={theme.colors.onSurfaceVariant} style={{ opacity: 0.5, marginTop: 2 }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Legend */}
        <View style={{ flexDirection: 'row', gap: tokens.spacing.md, marginTop: -tokens.spacing.xs }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: theme.colors.surfaceVariant + "40", borderWidth: 1, borderColor: theme.colors.outline + "20" }} />
                <Text variant="labelSmall" style={{ opacity: 0.6 }}>Available</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: theme.colors.primary }} />
                <Text variant="labelSmall" style={{ opacity: 0.6 }}>Selected</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: theme.colors.surfaceVariant + "10" }} />
                <Text variant="labelSmall" style={{ opacity: 0.6 }}>Occupied</Text>
            </View>
        </View>

        <View style={{ marginTop: tokens.spacing.md }}>
            <Button
                mode="contained"
                disabled={selectedSlots.length === 0}
                onPress={() => setStep(2)}
                contentStyle={{ height: 50 }}
                style={{ borderRadius: tokens.radii.lg }}
            >
                {bookingSummary 
                    ? `Book ${bookingSummary.start} - ${bookingSummary.end} (${bookingSummary.duration}h)`
                    : "Select Time Slots"
                }
            </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={{ gap: tokens.spacing.lg }}>
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="titleMedium" style={{ fontWeight: "800" }}>Booking Details</Text>
            <Button mode="text" onPress={() => setStep(1)} compact labelStyle={{ fontWeight: '700' }}>Change Time</Button>
        </View>
        
        <View style={{ 
            backgroundColor: theme.colors.surfaceVariant + "30", 
            padding: tokens.spacing.md, 
            borderRadius: tokens.radii.lg,
            borderWidth: 1,
            borderColor: theme.colors.outline + "10",
            gap: 4
        }}>
            <Text variant="bodyMedium" style={{ fontWeight: '700' }}>{room.Room_Name}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {selectedDate} • {bookingSummary?.start} - {bookingSummary?.end}
            </Text>
        </View>
      </View>

      <View style={{ gap: tokens.spacing.md }}>
         <TextInput
            mode="outlined"
            label="Purpose of Booking"
            placeholder="e.g. Weekly Sync, Project Discussion"
            value={purpose}
            onChangeText={setPurpose}
            outlineStyle={{ borderRadius: tokens.radii.lg }}
            left={<TextInput.Icon icon="pencil-outline" color={theme.colors.primary} />}
         />
         <TextInput
            mode="outlined"
            label="Person In Charge"
            value={staff?.first_name || ""}
            editable={false}
            outlineStyle={{ borderRadius: tokens.radii.lg }}
            left={<TextInput.Icon icon="account-outline" color={theme.colors.onSurfaceVariant} />}
         />
      </View>

      <Button
        mode="contained"
        disabled={!isBookingValid}
        onPress={handleConfirm}
        contentStyle={{ height: 50 }}
        style={{ borderRadius: tokens.radii.lg, marginTop: tokens.spacing.md }}
      >
        Confirm Reservation
      </Button>
    </View>
  );
}
