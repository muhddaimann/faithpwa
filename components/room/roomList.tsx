import React, { useMemo, useState } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Card, Text, Chip, Button, Avatar, useTheme } from "react-native-paper";
import { useDesign } from "../../contexts/designContext";
import { useRoom } from "../../hooks/useRoom";
import { useOverlay } from "../../contexts/overlayContext";
import { Room } from "../../contexts/api/room";
import RoomTimeSheet from "./roomTimeSheet";

export default function RoomList() {
  const theme = useTheme();
  const tokens = useDesign();
  const { showSheet, toast, showLoader, hideLoader } = useOverlay();
  const { rooms, getAvailability, selectedDate, setSelectedRoom, setSelectedSlots, setPurpose } = useRoom();

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
    showLoader(`Checking availability for ${room.Room_Name}...`);
    
    try {
      const res = await getAvailability(room.room_id, selectedDate);
      hideLoader();

      if ('error' in res) {
        toast(res.error);
        return;
      }

      // Reset flow state
      setSelectedRoom(room);
      setSelectedSlots([]);
      setPurpose("");

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const isToday = selectedDate === today;

      const timeSlots = Object.entries(res.availability)
        .map(([timeRange, data]) => {
          let isPast = false;
          const startTimeStr = timeRange.split(' - ')[0];

          if (isToday && startTimeStr) {
            const [timePart, ampm] = startTimeStr.split(' ');
            let [hours, minutes] = timePart.split(':').map(Number);
            
            if (ampm === 'PM' && hours < 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
            
            const slotTime = new Date();
            slotTime.setHours(hours, minutes, 0, 0);
            
            if (now >= slotTime) {
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
        })
        .filter(slot => !slot.isPast);

      if (timeSlots.length === 0) {
        toast("No more available slots for today.");
        return;
      }

      showSheet({
        content: <RoomTimeSheet room={room} timeSlots={timeSlots} />,
      });
    } catch (error) {
      hideLoader();
      toast("Failed to fetch availability. Please try again.");
    }
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
                    Check Availability
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
