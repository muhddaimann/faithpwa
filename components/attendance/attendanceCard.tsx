import React from "react";
import { View } from "react-native";
import { Text, useTheme, ActivityIndicator } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDesign } from "../../contexts/designContext";
import {
  attendanceStatuses,
  getStatusFromRecord,
} from "../../constants/attendance";
import { useAttendance } from "../../hooks/useAttendance";
import { useStaff } from "../../hooks/useStaff";
import { formatFullDate, buildAttendanceDetail } from "../../helpers/attendance";

export default function AttendanceCard() {
  const { colors } = useTheme();
  const tokens = useDesign();
  const { records, stats, loading, noRecords, describeStatus, getHoliday } = useAttendance();
  const { staff } = useStaff();

  const dateStr = formatFullDate(new Date());

  if (loading && records.length === 0) {
    return (
      <View
        style={{
          height: 220,
          backgroundColor: colors.surfaceVariant + "40",
          borderRadius: 28,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (noRecords) {
    return (
      <View
        style={{
          backgroundColor: colors.surfaceVariant,
          borderRadius: 28,
          padding: tokens.spacing.lg,
          gap: tokens.spacing.md,
          overflow: "hidden",
          minHeight: 180,
          justifyContent: "center",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: -20,
            right: -10,
            opacity: 0.05,
            transform: [{ rotate: "-15deg" }],
          }}
        >
          <MaterialCommunityIcons
            name="shield-check"
            size={160}
            color={colors.primary}
          />
        </View>

        <View style={{ flex: 1, zIndex: 1 }}>
          <Text
            variant="titleLarge"
            style={{ fontWeight: "800", color: colors.onSurface }}
          >
            {dateStr}
          </Text>
          <Text
            variant="bodyLarge"
            style={{ color: colors.onSurfaceVariant, marginTop: 4 }}
          >
            {"Management"}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: colors.surface + "90",
            padding: 16,
            borderRadius: 20,
            zIndex: 1,
            borderWidth: 1,
            borderColor: colors.outline + "20",
          }}
        >
          <Text
            variant="bodyMedium"
            style={{
              color: colors.onSurface,
              fontWeight: "600",
              lineHeight: 20,
            }}
          >
            Attendance tracking is not required. Enjoy your day!
          </Text>
        </View>
      </View>
    );
  }

  const todayRecord = stats.todayRecord;
  const holiday = getHoliday(todayRecord?.schedule_date);
  const statusKey = holiday ? "publicHoliday" : getStatusFromRecord(todayRecord);
  const status = attendanceStatuses[statusKey];
  const detail = buildAttendanceDetail(todayRecord);
  const statusLabel = describeStatus(todayRecord) || status.label;
  const statusMessage = holiday ? holiday.description : status.message;

  return (
    <View
      style={{
        backgroundColor: status.cardColor,
        borderRadius: 28,
        padding: tokens.spacing.lg,
        gap: tokens.spacing.md,
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
        <MaterialCommunityIcons
          name={status.icon}
          size={140}
          color={colors.onPrimary}
        />
      </View>

      <View
        style={{
          position: "absolute",
          bottom: -20,
          left: -20,
          opacity: 0.05,
          transform: [{ rotate: "8deg" }],
        }}
      >
        <MaterialCommunityIcons
          name="clock-outline"
          size={120}
          color={colors.onPrimary}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: tokens.spacing.md,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            variant="titleLarge"
            style={{
              color: colors.onPrimary,
              fontWeight: "800",
            }}
          >
            {dateStr}
          </Text>

          <Text
            variant="bodyLarge"
            style={{
              color: "rgba(255,255,255,0.72)",
              marginTop: 4,
            }}
          >
            {staff?.designation_name || "Digital Project"}
          </Text>
        </View>

        <View
          style={{
            paddingHorizontal: tokens.spacing.sm,
            paddingVertical: 6,
            borderRadius: tokens.radii.full,
            backgroundColor: "rgba(255,255,255,0.12)",
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
          <MaterialCommunityIcons
            name={status.icon}
            size={13}
            color={status.dotColor}
          />

          <Text
            variant="labelMedium"
            style={{
              color: colors.onPrimary,
              fontWeight: "700",
            }}
          >
            {statusLabel}
          </Text>
        </View>
      </View>

      {status.showShift ? (
        <View
          style={{
            flexDirection: "row",
            gap: tokens.spacing.md,
          }}
        >
          {[detail.checkIn, detail.checkOut].map((metric, idx) => (
            <View
              key={idx}
              style={{
                flex: 1,
                backgroundColor: "rgba(255,255,255,0.08)",
                borderRadius: tokens.radii.xl,
                padding: tokens.spacing.md,
                gap: 4,
              }}
            >
              <Text
                variant="bodySmall"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                {metric.label}
              </Text>

              <Text
                variant="titleMedium"
                style={{ color: colors.onPrimary, fontWeight: "800" }}
              >
                {metric.actual}
              </Text>

              <Text
                variant="bodySmall"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                {metric.state === "recorded" ? metric.note : `Scheduled · ${metric.scheduled}`}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.08)",
            borderRadius: tokens.radii.xl,
            padding: tokens.spacing.lg,
          }}
        >
          <Text
            variant="bodyLarge"
            style={{
              color: colors.onPrimary,
              lineHeight: 24,
            }}
          >
            {statusMessage || "No shift scheduled for today."}
          </Text>
        </View>
      )}
    </View>
  );
}
