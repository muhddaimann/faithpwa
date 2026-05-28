import React, { useEffect, useMemo, useState } from "react";
import { Pressable, View, ActivityIndicator } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { design } from "../../constants/design";
import { useAttendance } from "../../hooks/useAttendance";
import { getStatusFromRecord, attendanceStatuses } from "../../constants/attendance";
import NoData from "../noData";

export default function AttendanceOverview({ view }: { view: "Weekly" | "Monthly" }) {
  const theme = useTheme();
  const { records, loading, noRecords } = useAttendance();
  const { spacing, radii, elevation } = design;

  const today = new Date();
  const todayDate = today.getDate();

  const data = useMemo(() => {
    // Map API records to UI format
    return records.map(record => {
      const d = new Date(record.schedule_date);
      const statusKey = getStatusFromRecord(record);
      const statusInfo = attendanceStatuses[statusKey];
      
      return {
        ...record,
        date: d.getDate(),
        month: d.toLocaleString('default', { month: 'short' }),
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        displayStatus: statusInfo.label,
        color: statusInfo.dotColor,
        cardColor: statusInfo.cardColor,
        icon: statusInfo.icon,
        checkIn: record.actual_login || record.original_login || "--",
        checkOut: record.actual_logout || record.original_logout || "--",
        workingHours: record.login_difference || "--", // Or calculate from login/logout
      };
    }).sort((a, b) => new Date(a.schedule_date).getTime() - new Date(b.schedule_date).getTime());
  }, [records]);

  const displayedData = useMemo(() => {
    if (view === "Weekly") {
      // Show last 7 days or current week
      return data.slice(-7);
    }
    return data;
  }, [data, view]);

  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    if (data.length > 0 && !selected) {
      const todayItem = data.find((item) => item.date === todayDate);
      setSelected(todayItem || data[data.length - 1]);
    }
  }, [data, todayDate, selected]);

  if (loading && records.length === 0) {
    return (
      <View style={{ height: 300, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (noRecords) {
    return (
      <Card style={{ borderRadius: 28, padding: 24, backgroundColor: theme.colors.surface }}>
        <NoData 
          title="No Logs Found" 
          description="We couldn't find any attendance logs for your account. This is normal for management and non-shift roles."
          icon="calendar-blank"
        />
      </Card>
    );
  }

  if (!selected) return null;

  const firstDayOffset = data.length > 0 ? new Date(data[0].schedule_date).getDay() - 1 : 0;

  return (
    <Card
      style={{
        borderRadius: 28,
        overflow: "hidden",
        elevation: elevation.level1,
        backgroundColor: theme.colors.surface,
      }}
    >
      {/* Top Section - Status Detail */}
      <View
        style={{
          backgroundColor: selected.cardColor,
          padding: spacing.lg,
          gap: spacing.md,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: -30,
            right: -10,
            opacity: 0.08,
            transform: [{ rotate: "-12deg" }],
          }}
        >
          <MaterialCommunityIcons name={selected.icon} size={140} color="#FFF" />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            variant="titleLarge"
            style={{ color: "#FFF", fontWeight: "800" }}
          >
            {selected.day}, {selected.date} {selected.month}
          </Text>

          <View
            style={{
              alignSelf: "flex-start",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: radii.full,
              backgroundColor: "rgba(255,255,255,0.15)",
              marginTop: 8,
            }}
          >
            <Text
              variant="labelSmall"
              style={{ color: "#FFF", fontWeight: "700" }}
            >
              {selected.displayStatus.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs }}>
          {[
            { label: "Check In", value: selected.checkIn },
            { label: "Check Out", value: selected.checkOut },
            { label: "Diff", value: selected.login_difference || "--" },
          ].map((item, idx) => (
            <View
              key={idx}
              style={{
                flex: 1,
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: radii.xl,
                padding: spacing.md,
                gap: 4,
              }}
            >
              <Text variant="bodySmall" style={{ color: "rgba(255,255,255,0.7)" }}>
                {item.label}
              </Text>
              <Text variant="titleSmall" style={{ color: "#FFF", fontWeight: "800" }}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bottom Section - Selection */}
      <View style={{ padding: spacing.md }}>
        {view === "Weekly" ? (
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.sm }}>
            {displayedData.map((item) => {
              const active = selected.attendance_id === item.attendance_id;
              const isToday = item.date === todayDate;
              return (
                <View key={item.attendance_id} style={{ flex: 1, alignItems: "center", gap: spacing.xs }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: isToday ? "900" : "700",
                      color: isToday ? theme.colors.primary : theme.colors.onSurfaceVariant,
                      opacity: isToday ? 1 : 0.6,
                    }}
                  >
                    {item.day.charAt(0).toUpperCase()}
                  </Text>
                  <Pressable
                    onPress={() => setSelected(item)}
                    style={{
                      width: "100%",
                      alignItems: "center",
                      paddingVertical: spacing.md,
                      borderRadius: radii.xl,
                      backgroundColor: active ? theme.colors.primary : theme.colors.background,
                      borderWidth: isToday ? 2 : 0,
                      borderColor: active ? "rgba(255,255,255,0.5)" : theme.colors.primary,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "800",
                        color: active ? theme.colors.onPrimary : theme.colors.onSurface,
                      }}
                    >
                      {item.date}
                    </Text>
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        marginTop: 8,
                        backgroundColor: active ? theme.colors.onPrimary : item.color,
                      }}
                    />
                  </Pressable>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={{ gap: spacing.md }}>
            <View style={{ flexDirection: "row" }}>
              {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                <View key={i} style={{ width: `${100 / 7}%`, alignItems: "center" }}>
                  <Text variant="labelSmall" style={{ opacity: 0.5, fontWeight: "700" }}>{day}</Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <View key={`empty-${i}`} style={{ width: `${100 / 7}%`, padding: 2, aspectRatio: 1 }} />
              ))}
              {data.map((item) => {
                const isToday = item.date === todayDate;
                const active = selected.attendance_id === item.attendance_id;

                return (
                  <View key={item.attendance_id} style={{ width: `${100 / 7}%`, padding: 2 }}>
                    <Pressable
                      onPress={() => setSelected(item)}
                      style={{
                        aspectRatio: 1,
                        borderRadius: radii.lg,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: active ? theme.colors.primary : theme.colors.background,
                        borderWidth: isToday ? 2 : 0,
                        borderColor: active ? "rgba(255,255,255,0.5)" : theme.colors.primary,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: active ? theme.colors.onPrimary : theme.colors.onSurface,
                        }}
                      >
                        {item.date}
                      </Text>
                      <View
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: 2,
                          marginTop: 4,
                          backgroundColor: active ? theme.colors.onPrimary : item.color,
                        }}
                      />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </Card>
  );
}
