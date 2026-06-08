import React, { useMemo, useState } from "react";
import { View, TouchableOpacity, ScrollView, ImageBackground } from "react-native";
import { Card, Text, Chip, useTheme, IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDesign } from "../../contexts/designContext";
import { Room } from "../../contexts/api/room";

type RoomListProps = {
  rooms: Room[];
  onRoomPress: (room: Room) => void;
};

export default function RoomList({ rooms, onRoomPress }: RoomListProps) {
  const theme = useTheme();
  const tokens = useDesign();

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
    <View style={{ gap: tokens.spacing.md }}>
      <View style={{ gap: tokens.spacing.sm }}>
        {renderFilterRow(towers, selectedTower, (value) => {
          setSelectedTower(value);
          setSelectedLevel("all");
        })}

        {selectedTower !== "all" &&
          renderFilterRow(levels, selectedLevel, setSelectedLevel)}
      </View>

      <View style={{ gap: tokens.spacing.sm }}>
        {filteredRooms.map((room) => {
          const imageUrl = `https://endpoint.daythree.ai/faithMobile/room/${room.room_id}.jpeg`;

          return (
            <Card
              key={room.room_id}
              mode="contained"
              onPress={() => onRoomPress(room)}
              style={{
                borderRadius: tokens.radii.xl,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.outlineVariant,
              }}
            >
              <View style={{ flexDirection: 'row', padding: tokens.spacing.sm, gap: tokens.spacing.md }}>
                <ImageBackground
                  source={{ uri: imageUrl }}
                  style={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: tokens.radii.lg, 
                    overflow: 'hidden',
                    backgroundColor: theme.colors.surfaceVariant
                  }}
                />

                <View style={{ flex: 1, justifyContent: 'center', gap: 4 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text variant="titleMedium" style={{ fontWeight: "800", flex: 1 }} numberOfLines={1}>
                      {room.Room_Name}
                    </Text>
                    <View style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      gap: 2,
                      backgroundColor: theme.colors.primaryContainer,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: tokens.radii.sm
                    }}>
                      <MaterialCommunityIcons name="account-group" size={12} color={theme.colors.onPrimaryContainer} />
                      <Text style={{ fontSize: 10, fontWeight: '800', color: theme.colors.onPrimaryContainer }}>
                        {room.Capacity}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MaterialCommunityIcons name="map-marker-outline" size={14} color={theme.colors.onSurfaceVariant} />
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '600' }}>
                      {room.Tower} • {room.Level}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                    <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: '800' }}>
                      TAP TO BOOK
                    </Text>
                    <IconButton 
                      icon="chevron-right" 
                      size={20} 
                      style={{ margin: -8 }}
                      onPress={() => onRoomPress(room)}
                    />
                  </View>
                </View>
              </View>
            </Card>
          );
        })}
      </View>
    </View>
  );
}
