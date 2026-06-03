import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { Text, Button, Divider, useTheme, TextInput } from "react-native-paper";
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
    toggleSlot, 
    purpose, 
    setPurpose, 
    book,
    isBookingValid,
    selectedDate 
  } = useRoom();

  const [step, setStep] = useState(1); // 1: Slots, 2: Purpose

  const handleConfirm = async () => {
    if (selectedSlots.length === 0) return;

    showLoader("Securing your room...");
    
    // Calculate full range
    const firstRange = selectedSlots[0];
    const lastRange = selectedSlots[selectedSlots.length - 1];
    const startTime = firstRange.split(' - ')[0];
    const endTime = lastRange.split(' - ')[1];

    try {
      const res = await book(
        selectedDate,
        startTime,
        endTime,
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
        <View style={{ gap: 2 }}>
          <Text variant="titleMedium" style={{ fontWeight: "700" }}>{room.Room_Name}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {selectedDate} • {room.Tower} • {room.Level}
          </Text>
        </View>

        <Divider />

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing.sm }}>
          {timeSlots.map((slot, index) => {
            const isSelected = selectedSlots.includes(slot.label);
            return (
              <TouchableOpacity
                key={index}
                disabled={!slot.isAvailable}
                onPress={() => toggleSlot(slot.label)}
                style={{
                  width: "31%",
                  paddingVertical: tokens.spacing.md,
                  borderRadius: tokens.radii.lg,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isSelected 
                    ? theme.colors.primary
                    : slot.isAvailable 
                      ? theme.colors.surfaceVariant + "60" 
                      : theme.colors.surfaceVariant + "20",
                  borderWidth: 1,
                  borderColor: isSelected 
                    ? theme.colors.primary
                    : slot.isAvailable 
                      ? theme.colors.outline + "30" 
                      : "transparent",
                  opacity: slot.isAvailable ? 1 : 0.4
                }}
              >
                <Text style={{ 
                  fontSize: 10, 
                  fontWeight: "700",
                  color: isSelected 
                    ? theme.colors.onPrimary
                    : slot.isAvailable ? theme.colors.onSurface : theme.colors.onSurfaceVariant
                }}>
                  {slot.label.replace(/ AM| PM/g, '')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          mode="contained"
          disabled={selectedSlots.length === 0}
          onPress={() => setStep(2)}
          style={{ borderRadius: tokens.radii.full, marginTop: tokens.spacing.md }}
        >
          Next ({selectedSlots.length} selected)
        </Button>
      </View>
    );
  }

  return (
    <View style={{ gap: tokens.spacing.lg }}>
      <View style={{ gap: 2 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="titleMedium" style={{ fontWeight: "700" }}>Booking Details</Text>
            <Button mode="text" onPress={() => setStep(1)} compact>Change Slots</Button>
        </View>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {room.Room_Name} • {selectedSlots[0].split(' - ')[0]} - {selectedSlots[selectedSlots.length-1].split(' - ')[1]}
        </Text>
      </View>

      <Divider />

      <View style={{ gap: tokens.spacing.md }}>
         <TextInput
            mode="outlined"
            label="Purpose"
            placeholder="e.g. Project Discussion"
            value={purpose}
            onChangeText={setPurpose}
            outlineStyle={{ borderRadius: tokens.radii.lg }}
         />
         <TextInput
            mode="outlined"
            label="PIC"
            value={staff?.first_name || ""}
            editable={false}
            outlineStyle={{ borderRadius: tokens.radii.lg }}
         />
      </View>

      <Button
        mode="contained"
        disabled={!isBookingValid}
        onPress={handleConfirm}
        style={{ borderRadius: tokens.radii.full, marginTop: tokens.spacing.md }}
      >
        Confirm Booking
      </Button>
    </View>
  );
}
