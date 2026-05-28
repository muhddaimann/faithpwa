import React, { useMemo, useState } from "react";
import { View, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { Card, Text, Chip, Button, Avatar, useTheme, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDesign } from "../../contexts/designContext";
import { useRoom } from "../../hooks/useRoom";
import { useOverlay } from "../../contexts/overlayContext";
import { Room } from "../../contexts/api/room";

export default function RoomList() {
  const theme = useTheme();
  const tokens = useDesign();
  const { showSheet, toast } = useOverlay();
  const { rooms, loading, refreshRooms, getAvailability } = useRoom();

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
    toast(`Fetching availability for ${room.Room_Name}...`);
    
    // For now, using a fixed date for availability check (can be expanded to use a date picker)
    const today = new Date().toISOString().split('T')[0];
    const res = await getAvailability(room.room_id, today);

    if ('error' in res) {
      toast(res.error);
      return;
    }

    const timeSlots = Object.entries(res.availability).map(([time, data]) => ({
      label: time,
      isAvailable: data.status === 'Available',
      pic: data.PIC,
      eventName: data.event_name
    }));

    showSheet({
      title: "Select Time Slot",
      content: (
        <View style={{ gap: tokens.spacing.lg }}>
          <View style={{ gap: 2 }}>
            <Text variant="titleMedium" style={{ fontWeight: "700" }}>{room.Room_Name}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {room.Tower} • {room.Level}
            </Text>
          </View>

          <Divider />

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing.sm }}>
            {timeSlots.map((slot, index) => (
              <TouchableOpacity
                key={index}
                disabled={!slot.isAvailable}
                onPress={() => {
                  toast(`Slot ${slot.label} selected for ${room.Room_Name}`);
                  // Here you would navigate to a booking confirmation or open another sheet
                }}
                style={{
                  width: "31%",
                  paddingVertical: tokens.spacing.md,
                  borderRadius: tokens.radii.lg,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: slot.isAvailable 
                    ? theme.colors.surfaceVariant + "60" 
                    : theme.colors.surfaceVariant + "20",
                  borderWidth: 1,
                  borderColor: slot.isAvailable 
                    ? theme.colors.outline + "30" 
                    : "transparent",
                  opacity: slot.isAvailable ? 1 : 0.4
                }}
              >
                <Text style={{ 
                  fontSize: 11, 
                  fontWeight: "700",
                  color: slot.isAvailable ? theme.colors.onSurface : theme.colors.onSurfaceVariant
                }}>
                  {slot.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text variant="bodySmall" style={{ opacity: 0.6, fontStyle: "italic", textAlign: "center" }}>
            * Greyed out slots are already booked
          </Text>
        </View>
      ),
    });
  };

  const getRoomIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("board")) return "briefcase";
    if (n.includes("training")) return "presentation";
    if (n.includes("focus") || n.includes("mother")) return "head-cog";
    if (n.includes("discussion") || n.includes("conference")) return "account-group";
    if (n.includes("huddle")) return "google-circles-communities";
    return "door";
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

      <View style={{ gap: tokens.spacing.md }}>
        {filteredRooms.map((room) => {
          const statusColor = theme.colors.primary;

          return (
            <TouchableOpacity key={room.room_id} activeOpacity={0.9}>
              <Card
                mode="contained"
                style={{
                  borderRadius: tokens.radii.xl,
                  backgroundColor: theme.colors.surface,
                }}
              >
                <View
                  style={{
                    padding: tokens.spacing.lg,
                    gap: tokens.spacing.md,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: tokens.spacing.md,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        gap: tokens.spacing.md,
                        flex: 1,
                      }}
                    >
                      <Avatar.Icon
                        size={54}
                        icon={getRoomIcon(room.Room_Name)}
                        style={{
                          backgroundColor: `${statusColor}16`,
                        }}
                        color={statusColor}
                      />

                      <View style={{ flex: 1, gap: 2 }}>
                        <Text
                          variant="titleMedium"
                          style={{
                            fontWeight: "700",
                          }}
                        >
                          {room.Room_Name}
                        </Text>

                        <Text
                          variant="bodyMedium"
                          style={{
                            color: theme.colors.onSurfaceVariant,
                          }}
                        >
                          {room.Tower}
                        </Text>

                        <Text
                          variant="bodySmall"
                          style={{
                            color: theme.colors.onSurfaceVariant,
                          }}
                        >
                          {room.Level} • {room.Capacity} Pax
                        </Text>
                      </View>
                    </View>

                    <Chip
                      compact
                      style={{
                        backgroundColor: `${statusColor}16`,
                      }}
                      textStyle={{
                        color: statusColor,
                        fontWeight: "700",
                      }}
                    >
                      Available
                    </Chip>
                  </View>

                  <Button
                    mode="contained"
                    onPress={() => handleBooking(room)}
                    style={{
                      borderRadius: tokens.radii.full,
                      marginTop: tokens.spacing.xs,
                    }}
                  >
                    Book Now
                  </Button>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
