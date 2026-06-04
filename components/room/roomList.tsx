import React, { useMemo, useState } from "react";
import { View, TouchableOpacity, ScrollView, ImageBackground } from "react-native";
import { Card, Text, Chip, Button, useTheme, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDesign } from "../../contexts/designContext";
import { useRoom, type TimeSlot } from "../../hooks/useRoom";
import { useOverlay } from "../../contexts/overlayContext";
import { Room } from "../../contexts/api/room";

type SheetProps = {
  room: Room;
  timeSlots: TimeSlot[];
};

function RoomBookingSheet({ room, timeSlots }: SheetProps) {
  const theme = useTheme();
  const tokens = useDesign();
  const { toast } = useOverlay();
  const { 
    selectedSlots, 
    setSelectedSlots,
    selectedDate,
    proceedToBooking,
  } = useRoom();

  const [viewingSlot, setViewingSlot] = useState<TimeSlot | null>(null);

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

  return (
    <View style={{ maxHeight: 580 }}>
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
                  width: "48.5%",
                  height: 52,
                  borderRadius: tokens.radii.md,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isSelected 
                    ? isMiddle ? theme.colors.primary + "15" : theme.colors.primary
                    : !slot.isAvailable && !slot.isPast
                      ? theme.colors.errorContainer + "30"
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
          onPress={proceedToBooking}
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
              ? `Select Purpose: ${bookingSummary.start} - ${bookingSummary.end}`
              : "Select Time Range"
          }
        </Button>
      </View>
    </View>
  );
}

export default function RoomList() {
  const theme = useTheme();
  const tokens = useDesign();
  const { showSheet } = useOverlay();
  const { rooms, prepareBooking } = useRoom();

  const [selectedTower, setSelectedTower] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const towers = useMemo(() => {
    return ["all", ...Array.from(new Set(rooms.map((room) => room.Tower)))];
  }, [rooms]);

  const levels = useMemo(() => {
    if (selectedTower === "all") return [];

    return [
      "all",
      ...Array.from(
        new Set(
          rooms
            .filter((room) => room.Tower === selectedTower)
            .map((room) => room.Level),
        ),
      ),
    ];
  }, [selectedTower, rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const towerMatch =
        selectedTower === "all" || room.Tower === selectedTower;

      const levelMatch =
        selectedLevel === "all" || room.Level === selectedLevel;

      return towerMatch && levelMatch;
    });
  }, [selectedTower, selectedLevel, rooms]);

  const handleBooking = async (room: Room) => {
    const timeSlots = await prepareBooking(room);
    if (timeSlots) {
      showSheet({
        content: <RoomBookingSheet room={room} timeSlots={timeSlots} />,
      });
    }
  };

  const renderFilterRow = (
    data: string[],
    selected: string,
    onSelect: (value: string) => void,
  ) => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: tokens.spacing.xs,
          paddingRight: tokens.spacing.lg,
        }}
      >
        {data.map((item) => {
          const active = selected === item;

          return (
            <TouchableOpacity
              key={item}
              activeOpacity={0.9}
              onPress={() => onSelect(item)}
            >
              <View
                style={{
                  paddingHorizontal: tokens.spacing.md,
                  height: 38,
                  borderRadius: tokens.radii.full,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: active
                    ? theme.colors.primary
                    : theme.colors.surfaceVariant,
                }}
              >
                <Text
                  style={{
                    color: active
                      ? theme.colors.onPrimary
                      : theme.colors.onSurface,
                    fontWeight: "700",
                    textTransform: "capitalize",
                  }}
                >
                  {item === "all" ? "All" : item}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View style={{ gap: tokens.spacing.lg }}>
      <View style={{ gap: tokens.spacing.sm }}>
        {renderFilterRow(towers, selectedTower, (value) => {
          setSelectedTower(value);
          setSelectedLevel("all");
        })}

        {selectedTower !== "all" &&
          renderFilterRow(levels, selectedLevel, setSelectedLevel)}
      </View>

      <View style={{ gap: tokens.spacing.xl }}>
        {filteredRooms.map((room) => {
          const imageUrl = `https://endpoint.daythree.ai/faithMobile/room/${room.room_id}.jpeg`;

          return (
            <Card
              key={room.room_id}
              mode="contained"
              style={{
                borderRadius: tokens.radii["2xl"],
                backgroundColor: theme.colors.surface,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: theme.colors.outlineVariant,
              }}
            >
              <ImageBackground
                source={{ uri: imageUrl }}
                style={{ height: 200, justifyContent: 'flex-end' }}
              >
                <View style={{
                    padding: tokens.spacing.md,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                }}>
                    <Chip 
                        compact 
                        style={{ backgroundColor: theme.colors.primary }}
                        textStyle={{ color: theme.colors.onPrimary, fontWeight: '800', fontSize: 10 }}
                    >
                        AVAILABLE
                    </Chip>
                    <View style={{ 
                        backgroundColor: 'rgba(255,255,255,0.9)', 
                        paddingHorizontal: 10, 
                        paddingVertical: 4, 
                        borderRadius: tokens.radii.full,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4
                    }}>
                        <MaterialCommunityIcons name="account-group" size={14} color={theme.colors.primary} />
                        <Text style={{ fontSize: 12, fontWeight: '800', color: theme.colors.primary }}>
                            {room.Capacity} Pax
                        </Text>
                    </View>
                </View>
              </ImageBackground>

              <View style={{ padding: tokens.spacing.lg, gap: tokens.spacing.md }}>
                <View style={{ gap: 2 }}>
                  <Text variant="headlineSmall" style={{ fontWeight: "900", letterSpacing: -0.5 }}>
                    {room.Room_Name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MaterialCommunityIcons name="map-marker-outline" size={14} color={theme.colors.onSurfaceVariant} />
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '600' }}>
                      {room.Tower} • {room.Level}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: tokens.spacing.sm }}>
                    <Button
                        mode="contained"
                        onPress={() => handleBooking(room)}
                        style={{ flex: 1, borderRadius: tokens.radii.lg }}
                        contentStyle={{ height: 48 }}
                        labelStyle={{ fontWeight: '800', fontSize: 14 }}
                    >
                        Check Availability
                    </Button>
                    <TouchableOpacity 
                        style={{ 
                            width: 48, 
                            height: 48, 
                            borderRadius: tokens.radii.lg, 
                            backgroundColor: theme.colors.surfaceVariant,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <MaterialCommunityIcons name="information-outline" size={24} color={theme.colors.onSurfaceVariant} />
                    </TouchableOpacity>
                </View>
              </View>
            </Card>
          );
        })}
      </View>
    </View>
  );
}
