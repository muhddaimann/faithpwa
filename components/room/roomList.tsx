import React, { useMemo, useState } from "react";
import { View, TouchableOpacity, ScrollView, Image, ImageBackground } from "react-native";
import { Card, Text, Chip, Button, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDesign } from "../../contexts/designContext";
import { useRoom } from "../../hooks/useRoom";
import { useOverlay } from "../../contexts/overlayContext";
import { Room } from "../../contexts/api/room";
import RoomTimeSheet from "./roomSheet";

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
      const localToday = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
      const isToday = selectedDate === localToday;

      const allSlots = Object.entries(res.availability)
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
