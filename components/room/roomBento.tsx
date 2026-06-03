import React, { useState, useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { design } from "../../constants/design";
import { useOverlay } from "../../contexts/overlayContext";
import { DatePickerContent } from "../datePicker";
import { useRoom } from "../../hooks/useRoom";

export default function RoomBento() {
  const theme = useTheme();
  const router = useRouter();
  const { showModal, hideModal, toast } = useOverlay();
  const { stats, selectedDate, setSelectedDate } = useRoom();
  const { spacing, radii } = design;

  // Convert YYYY-MM-DD from store to display format
  const dateValue = useMemo(() => new Date(selectedDate), [selectedDate]);
  const formattedDate = useMemo(() => {
    return dateValue.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, [dateValue]);

  const handleDatePicker = () => {
    showModal({
      content: (
        <DatePickerContent
          variant="single"
          title="Pick a Date"
          subtitle="Select date to check availability"
          value={dateValue}
          onChange={(date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (date < today) {
              toast("Cannot select past date");
              return;
            }

            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            setSelectedDate(`${yyyy}-${mm}-${dd}`);
            
            const formatted = date.toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            toast(`Date changed to ${formatted}`);
          }}
          onConfirm={hideModal}
        />
      ),
    });
  };

  const [weekday, dayMonth, year] = formattedDate.replace(",", "").split(" ");

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        {/* Main Date Selector Card */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleDatePicker}
          style={{
            flex: 1.2,
            minHeight: 220,
            borderRadius: 32,
            backgroundColor: "#10B981",
            padding: spacing.xl,
            justifyContent: "space-between",
            overflow: "hidden",
            elevation: 4,
          }}
        >
          {/* Background Decorative Icons */}
          <View style={{ position: "absolute", top: -20, right: -15, opacity: 0.12, transform: [{ rotate: "-15deg" }] }}>
            <MaterialCommunityIcons name="calendar-month" size={160} color="#FFF" />
          </View>

          <View>
            <Text style={{ fontSize: 12, fontWeight: "800", color: "rgba(255,255,255,0.7)", letterSpacing: 1.5 }}>
              PICK DATE
            </Text>
            
            <View style={{ marginTop: spacing.md }}>
              <Text style={{ fontSize: 38, fontWeight: "900", color: "#FFF", lineHeight: 42 }}>
                {weekday} {dayMonth}
              </Text>
              <Text style={{ fontSize: 16, fontWeight: "600", color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
                {year} • Availability
              </Text>
            </View>
          </View>

          <View style={{ 
            backgroundColor: "rgba(255,255,255,0.2)", 
            paddingHorizontal: 16, 
            paddingVertical: 10, 
            borderRadius: radii.full,
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-start",
            gap: 8
          }}>
            <MaterialCommunityIcons name="calendar-edit" size={16} color="#FFF" />
            <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 13 }}>Change</Text>
          </View>
        </TouchableOpacity>

        {/* Right Column Stack */}
        <View style={{ flex: 1, gap: spacing.sm }}>
          {/* Active Bookings Card */}
          <View
            style={{
              flex: 1,
              borderRadius: 24,
              backgroundColor: "#6366F1",
              padding: spacing.md,
              justifyContent: "space-between",
              overflow: "hidden",
            }}
          >
            <View style={{ position: "absolute", top: -10, right: -10, opacity: 0.1, transform: [{ rotate: "-15deg" }] }}>
              <MaterialCommunityIcons name="bookmark-check" size={100} color="#FFF" />
            </View>
            
            <Text style={{ fontSize: 10, fontWeight: "800", color: "rgba(255,255,255,0.8)", letterSpacing: 0.5 }}>ACTIVE</Text>
            
            <View>
              <Text style={{ fontSize: 32, fontWeight: "900", color: "#FFF" }}>{stats.activeBookings}</Text>
              <Text style={{ fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.7)", marginTop: 2 }}>Current Bookings</Text>
            </View>
          </View>

          {/* Booking History Card */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("home/room/bookings")}
            style={{
              flex: 1,
              borderRadius: 24,
              backgroundColor: theme.colors.surface,
              padding: spacing.md,
              justifyContent: "space-between",
              borderWidth: 1,
              borderColor: theme.colors.outline + "15",
              overflow: "hidden",
            }}
          >
             <View style={{ position: "absolute", top: -10, right: -10, opacity: 0.04, transform: [{ rotate: "15deg" }] }}>
              <MaterialCommunityIcons name="history" size={100} color={theme.colors.onSurface} />
            </View>

            <Text style={{ fontSize: 10, fontWeight: "800", color: theme.colors.onSurfaceVariant, letterSpacing: 0.5 }}>HISTORY</Text>
            
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 16, fontWeight: "800", color: theme.colors.onSurface }}>View All</Text>
              <View style={{ backgroundColor: theme.colors.surfaceVariant, padding: 6, borderRadius: 8 }}>
                <MaterialCommunityIcons name="arrow-right" size={16} color={theme.colors.onSurface} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
