import React, { useEffect, useMemo, useState } from "react";
import { Pressable, View, ActivityIndicator } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { design } from "../../constants/design";
import { useAttendance } from "../../hooks/useAttendance";
import { getStatusFromRecord, attendanceStatuses } from "../../constants/attendance";
import {
  getDateParts,
  isToday,
  formatMonthYear,
  getMonthMeta,
  getWeekDates,
  toDateKey,
  buildAttendanceDetail,
  type ClockMetric,
  type MetricTone,
} from "../../helpers/attendance";
import NoData from "../noData";

const toneColor = (tone: MetricTone): string => {
  switch (tone) {
    case "positive":
      return "#4ADE80";
    case "warning":
      return "#FBBF24";
    case "negative":
      return "#F87171";
    default:
      return "rgba(255,255,255,0.6)";
  }
};

export default function AttendanceOverview({ view }: { view: "Weekly" | "Monthly" }) {
  const theme = useTheme();
  const { records, loading, noRecords, describeStatus, getHoliday } = useAttendance();
  const { spacing, radii, elevation } = design;

  const data = useMemo(() => {
    // Map API records to UI format
    return records.map(record => {
      const parts = getDateParts(record.schedule_date);
      const holiday = getHoliday(record.schedule_date);
      const statusKey = holiday ? "publicHoliday" : getStatusFromRecord(record);
      const statusInfo = attendanceStatuses[statusKey];

      return {
        ...record,
        date: parts?.day ?? 0,
        month: parts?.month ?? "",
        day: parts?.weekday ?? "",
        displayStatus: describeStatus(record),
        color: statusInfo.dotColor,
        cardColor: statusInfo.cardColor,
        icon: statusInfo.icon,
        showShift: statusInfo.showShift,
        message: holiday ? holiday.description : statusInfo.message,
        detail: buildAttendanceDetail(record),
      };
    }).sort((a, b) => new Date(a.schedule_date).getTime() - new Date(b.schedule_date).getTime());
  }, [records, describeStatus, getHoliday]);

  const recordByDate = useMemo(() => {
    const map = new Map<string, (typeof data)[number]>();
    data.forEach((item) => {
      const key = toDateKey(item.schedule_date);
      if (key) map.set(key, item);
    });
    return map;
  }, [data]);

  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    if (data.length > 0 && !selected) {
      const todayItem = data.find((item) => isToday(item.schedule_date));
      setSelected(todayItem || data[data.length - 1]);
    }
  }, [data, selected]);

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

  const today = new Date();
  const weekDates = getWeekDates(today);
  const { year, month, daysInMonth, leadingOffset } = getMonthMeta(today);

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

        {selected.showShift ? (
          <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              {[selected.detail.checkIn, selected.detail.checkOut].map(
                (metric: ClockMetric, idx: number) => (
                  <View
                    key={idx}
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(255,255,255,0.1)",
                      borderRadius: radii.xl,
                      padding: spacing.md,
                      gap: 6,
                    }}
                  >
                    <Text variant="bodySmall" style={{ color: "rgba(255,255,255,0.7)" }}>
                      {metric.label}
                    </Text>
                    <Text
                      variant="headlineSmall"
                      style={{ color: "#FFF", fontWeight: "900" }}
                    >
                      {metric.actual}
                    </Text>
                    <Text variant="bodySmall" style={{ color: "rgba(255,255,255,0.55)" }}>
                      Scheduled · {metric.scheduled}
                    </Text>
                    <View
                      style={{
                        alignSelf: "flex-start",
                        marginTop: 2,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: radii.full,
                        backgroundColor:
                          metric.tone === "neutral"
                            ? "rgba(255,255,255,0.08)"
                            : `${toneColor(metric.tone)}26`,
                      }}
                    >
                      <Text
                        variant="labelSmall"
                        style={{ color: toneColor(metric.tone), fontWeight: "800" }}
                      >
                        {metric.note}
                      </Text>
                    </View>
                  </View>
                ),
              )}
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: radii.xl,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <MaterialCommunityIcons name="timer-sand" size={16} color="#FFF" />
                <Text variant="bodyMedium" style={{ color: "rgba(255,255,255,0.8)", fontWeight: "600" }}>
                  Worked Hours
                </Text>
              </View>
              <Text variant="titleMedium" style={{ color: "#FFF", fontWeight: "900" }}>
                {selected.detail.workedHours}
              </Text>
            </View>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: radii.xl,
              padding: spacing.lg,
              marginTop: spacing.xs,
            }}
          >
            <Text variant="bodyLarge" style={{ color: "#FFF", lineHeight: 24 }}>
              {selected.message || "No shift scheduled for this day."}
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Section - Selection */}
      <View style={{ padding: spacing.md }}>
        {view === "Weekly" ? (
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.sm }}>
            {weekDates.map((d) => {
              const item = recordByDate.get(toDateKey(d) ?? "");
              const active = !!item && selected.attendance_id === item.attendance_id;
              const todayFlag = isToday(d);
              const initial = d
                .toLocaleDateString("en-US", { weekday: "short" })
                .charAt(0);
              return (
                <View key={d.toISOString()} style={{ flex: 1, alignItems: "center", gap: spacing.xs }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: todayFlag ? "900" : "700",
                      color: todayFlag ? theme.colors.primary : theme.colors.onSurfaceVariant,
                      opacity: todayFlag ? 1 : 0.6,
                    }}
                  >
                    {initial}
                  </Text>
                  <Pressable
                    disabled={!item}
                    onPress={() => item && setSelected(item)}
                    style={{
                      width: "100%",
                      alignItems: "center",
                      paddingVertical: spacing.md,
                      borderRadius: radii.xl,
                      backgroundColor: active
                        ? theme.colors.primary
                        : item
                        ? theme.colors.background
                        : "transparent",
                      borderWidth: todayFlag ? 2 : 0,
                      borderColor: active ? "rgba(255,255,255,0.5)" : theme.colors.primary,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "800",
                        color: active ? theme.colors.onPrimary : theme.colors.onSurface,
                        opacity: item ? 1 : 0.3,
                      }}
                    >
                      {d.getDate()}
                    </Text>
                    {item && (
                      <View
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          marginTop: 8,
                          backgroundColor: active ? theme.colors.onPrimary : item.color,
                        }}
                      />
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={{ gap: spacing.md }}>
            <Text
              variant="titleSmall"
              style={{
                fontWeight: "800",
                color: theme.colors.onSurface,
                textAlign: "center",
              }}
            >
              {formatMonthYear(today)}
            </Text>
            <View style={{ flexDirection: "row" }}>
              {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                <View key={i} style={{ width: `${100 / 7}%`, alignItems: "center" }}>
                  <Text variant="labelSmall" style={{ opacity: 0.5, fontWeight: "700" }}>{day}</Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {Array.from({ length: leadingOffset }).map((_, i) => (
                <View key={`empty-${i}`} style={{ width: `${100 / 7}%`, padding: 2, aspectRatio: 1 }} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const cellDate = new Date(year, month, dayNum);
                const item = recordByDate.get(toDateKey(cellDate) ?? "");
                const active = !!item && selected.attendance_id === item.attendance_id;
                const todayFlag = isToday(cellDate);

                return (
                  <View key={`day-${dayNum}`} style={{ width: `${100 / 7}%`, padding: 2 }}>
                    <Pressable
                      disabled={!item}
                      onPress={() => item && setSelected(item)}
                      style={{
                        aspectRatio: 1,
                        borderRadius: radii.lg,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: active
                          ? theme.colors.primary
                          : item
                          ? theme.colors.background
                          : "transparent",
                        borderWidth: todayFlag ? 2 : 0,
                        borderColor: active ? "rgba(255,255,255,0.5)" : theme.colors.primary,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: active
                            ? theme.colors.onPrimary
                            : theme.colors.onSurface,
                          opacity: item ? 1 : 0.3,
                        }}
                      >
                        {dayNum}
                      </Text>
                      {item && (
                        <View
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: 2,
                            marginTop: 4,
                            backgroundColor: active ? theme.colors.onPrimary : item.color,
                          }}
                        />
                      )}
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
