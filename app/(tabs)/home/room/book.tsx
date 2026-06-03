import React from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, Button, TextInput, useTheme, Avatar, Card } from "react-native-paper";
import { useDesign } from "../../../../contexts/designContext";
import Header from "../../../../components/header";
import { useRoom } from "../../../../hooks/useRoom";
import { useStaff } from "../../../../hooks/useStaff";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function BookRoom() {
  const theme = useTheme();
  const tokens = useDesign();
  const { staff } = useStaff();
  
  const {
    selectedRoom,
    selectedSlot,
    selectedDate,
    purpose,
    setPurpose,
    handleConfirmBooking,
    isBookingValid,
  } = useRoom();

  // Use local constants for narrowing and to prevent TS errors
  const room = selectedRoom;
  const slot = selectedSlot;

  if (!room || !slot) {
    return null;
  }

  const getRoomIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("board")) return "briefcase";
    if (n.includes("training")) return "presentation";
    if (n.includes("focus") || n.includes("mother")) return "head-cog";
    if (n.includes("discussion") || n.includes("conference")) return "account-group";
    return "door";
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: tokens.spacing.lg,
            paddingBottom: tokens.spacing["3xl"],
            gap: tokens.spacing.md,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Header
            title="Room Booking"
            subtitle="Finalize your reservation details"
            showBack
          />

          <View style={{ gap: tokens.spacing.md }}>
            {/* Selection Summary */}
            <Card mode="contained" style={{ borderRadius: tokens.radii.xl, backgroundColor: theme.colors.primaryContainer + "30" }}>
              <View style={{ padding: tokens.spacing.lg, gap: tokens.spacing.md }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: tokens.spacing.md }}>
                   <Avatar.Icon 
                    size={48} 
                    icon={getRoomIcon(room.Room_Name)} 
                    style={{ backgroundColor: theme.colors.primary }} 
                    color={theme.colors.onPrimary} 
                  />
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium" style={{ fontWeight: "800" }}>{room.Room_Name}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{room.Tower} • {room.Level}</Text>
                  </View>
                </View>

                <View style={{ flexDirection: "row", gap: tokens.spacing.xl, marginTop: tokens.spacing.xs }}>
                   <View style={{ gap: 4 }}>
                      <Text variant="labelSmall" style={{ opacity: 0.6, fontWeight: "700" }}>DATE</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <MaterialCommunityIcons name="calendar" size={16} color={theme.colors.primary} />
                        <Text variant="bodyMedium" style={{ fontWeight: "700" }}>{selectedDate}</Text>
                      </View>
                   </View>

                   <View style={{ gap: 4 }}>
                      <Text variant="labelSmall" style={{ opacity: 0.6, fontWeight: "700" }}>TIME SLOT</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.primary} />
                        <Text variant="bodyMedium" style={{ fontWeight: "700" }}>{slot}</Text>
                      </View>
                   </View>
                </View>
              </View>
            </Card>

            {/* Input Form */}
            <View style={{ gap: tokens.spacing.md, marginTop: tokens.spacing.sm }}>
              <View style={{ gap: 4 }}>
                <Text variant="labelMedium" style={{ marginLeft: 4, fontWeight: "700", color: theme.colors.onSurfaceVariant }}>
                  Booking Purpose
                </Text>
                <TextInput
                  mode="outlined"
                  placeholder="e.g. Project Sync, Client Meeting..."
                  value={purpose}
                  onChangeText={setPurpose}
                  multiline
                  numberOfLines={4}
                  outlineStyle={{ borderRadius: tokens.radii.lg }}
                />
              </View>

              <View style={{ gap: 4 }}>
                <Text variant="labelMedium" style={{ marginLeft: 4, fontWeight: "700", color: theme.colors.onSurfaceVariant }}>
                  Person In Charge
                </Text>
                <TextInput
                  mode="outlined"
                  value={staff?.first_name || ""}
                  editable={false}
                  left={<TextInput.Icon icon="account" />}
                  outlineStyle={{ borderRadius: tokens.radii.lg }}
                />
              </View>

              <View style={{ gap: 4 }}>
                <Text variant="labelMedium" style={{ marginLeft: 4, fontWeight: "700", color: theme.colors.onSurfaceVariant }}>
                  Contact Email
                </Text>
                <TextInput
                  mode="outlined"
                  value={staff?.email || ""}
                  editable={false}
                  left={<TextInput.Icon icon="email" />}
                  outlineStyle={{ borderRadius: tokens.radii.lg }}
                />
              </View>
            </View>

            <Button
              mode="contained"
              disabled={!isBookingValid}
              onPress={() => handleConfirmBooking(staff?.first_name || "Staff", staff?.email || "")}
              style={{
                borderRadius: tokens.radii.pill,
                marginTop: tokens.spacing.lg,
                paddingVertical: 6,
              }}
              contentStyle={{ height: 48 }}
            >
              Confirm Booking
            </Button>

            <Text variant="bodySmall" style={{ textAlign: "center", opacity: 0.5, fontStyle: "italic" }}>
              By confirming, you agree to follow the meeting room usage guidelines.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
