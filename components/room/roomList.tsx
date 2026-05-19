import React, { useMemo, useState } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Card, Text, Chip, Button, Avatar, useTheme, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDesign } from "../../contexts/designContext";
import { ROOMS } from "../../constants/room";
import { useOverlay } from "../../contexts/overlayContext";

export default function RoomList() {
  const theme = useTheme();
  const tokens = useDesign();
  const { showSheet, toast } = useOverlay();

  const [selectedTower, setSelectedTower] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const towers = useMemo(() => {
    return ["all", ...Array.from(new Set(ROOMS.map((room) => room.tower)))];
  }, []);

  const levels = useMemo(() => {
    if (selectedTower === "all") return [];

    return [
      "all",
      ...Array.from(
        new Set(
          ROOMS.filter((room) => room.tower === selectedTower).map(
            (room) => room.level,
          ),
        ),
      ),
    ];
  }, [selectedTower]);

  const filteredRooms = useMemo(() => {
    return ROOMS.filter((room) => {
      const towerMatch =
        selectedTower === "all" || room.tower === selectedTower;

      const levelMatch =
        selectedLevel === "all" || room.level === selectedLevel;

      return towerMatch && levelMatch;
    });
  }, [selectedTower, selectedLevel]);

  const handleBooking = (room: any) => {
    const timeSlots = [];
    const startHour = 9;
    const endHour = 18;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let min of [0, 30]) {
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm = hour >= 12 ? "PM" : "AM";
        timeSlots.push({
          id: `${hour}-${min}`,
          label: `${displayHour}:${min.toString().padStart(2, "0")} ${ampm}`,
          isAvailable: Math.random() > 0.3, // Mock availability
        });
      }
    }

    showSheet({
      title: "Select Time Slot",
      content: (
        <View style={{ gap: tokens.spacing.lg }}>
          <View style={{ gap: 2 }}>
            <Text variant="titleMedium" style={{ fontWeight: "700" }}>{room.name}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {room.tower} • {room.level}
            </Text>
          </View>

          <Divider />

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing.sm }}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                disabled={!slot.isAvailable}
                onPress={() => {
                  toast(`Slot ${slot.label} selected for ${room.name}`);
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
                  fontSize: 12, 
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return theme.colors.primary;

      case "occupied":
        return theme.colors.error;

      case "reserved":
        return "#D97706";

      case "maintenance":
        return theme.colors.outline;

      default:
        return theme.colors.primary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return "Available";

      case "occupied":
        return "Occupied";

      case "reserved":
        return "Reserved";

      case "maintenance":
        return "Maintenance";

      default:
        return status;
    }
  };

  const getRoomIcon = (type: string) => {
    switch (type) {
      case "board":
        return "briefcase";

      case "training":
        return "presentation";

      case "focus":
        return "head-cog";

      case "discussion":
        return "account-group";

      case "huddle":
        return "google-circles-communities";

      default:
        return "door";
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
                  {item}
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
          const statusColor = getStatusColor(room.status);

          return (
            <TouchableOpacity key={room.id} activeOpacity={0.9}>
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
                        icon={getRoomIcon(room.type)}
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
                          {room.name}
                        </Text>

                        <Text
                          variant="bodyMedium"
                          style={{
                            color: theme.colors.onSurfaceVariant,
                          }}
                        >
                          {room.tower}
                        </Text>

                        <Text
                          variant="bodySmall"
                          style={{
                            color: theme.colors.onSurfaceVariant,
                          }}
                        >
                          {room.level} • {room.capacity} Pax • {room.code}
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
                      {getStatusLabel(room.status)}
                    </Chip>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: tokens.spacing.sm,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={18}
                      color={theme.colors.onSurfaceVariant}
                    />

                    <Text
                      variant="bodyMedium"
                      style={{
                        color: theme.colors.onSurfaceVariant,
                      }}
                    >
                      {room.availability}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: tokens.spacing.xs,
                    }}
                  >
                    {room.amenities.map((item) => (
                      <Chip
                        key={item}
                        compact
                        style={{
                          backgroundColor: theme.colors.surfaceVariant,
                        }}
                      >
                        {item}
                      </Chip>
                    ))}
                  </View>

                  <Button
                    mode={
                      room.status === "available" ? "contained" : "outlined"
                    }
                    disabled={room.status === "maintenance"}
                    onPress={() => {
                      if (room.status === "available") {
                        handleBooking(room);
                      } else if (room.status === "occupied") {
                        toast("Viewing schedule...");
                      }
                    }}
                    style={{
                      borderRadius: tokens.radii.full,
                      marginTop: tokens.spacing.xs,
                    }}
                  >
                    {room.status === "available"
                      ? "Book Now"
                      : room.status === "occupied"
                        ? "View Schedule"
                        : room.status === "reserved"
                          ? "Manage Booking"
                          : "Unavailable"}
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
