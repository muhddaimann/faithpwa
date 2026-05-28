import React, { useMemo } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { design } from "../../constants/design";
import { useAttendance } from "../../hooks/useAttendance";

export default function AttendanceInsight() {
  const { spacing, radii, typography } = design;
  const { records, stats, noRecords } = useAttendance();

  const insightData = useMemo(() => {
    if (records.length === 0) return null;

    const rate = Math.round((stats.presentCount / records.filter(r => r.status !== 'RD').length) * 100);
    
    // Calculate streak
    let streak = 0;
    const sorted = [...records].sort((a, b) => new Date(b.schedule_date).getTime() - new Date(a.schedule_date).getTime());
    for (const r of sorted) {
      if (r.login_status !== 'false' && r.status !== 'RD') {
        streak++;
      } else if (r.status === 'RD') {
        continue;
      } else {
        break;
      }
    }

    return {
      rate: isNaN(rate) ? 0 : rate,
      lateCount: stats.lateCount,
      streak,
    };
  }, [records, stats]);

  if (noRecords) {
    return (
      <View style={{ gap: spacing.md, opacity: 0.8 }}>
        <Text style={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, opacity: 0.5, letterSpacing: 1 }}>
          ATTENDANCE INSIGHTS
        </Text>
        <View style={{ padding: 24, borderRadius: 28, backgroundColor: '#6366F108', borderWidth: 1, borderColor: '#6366F115', alignItems: 'center', gap: 12 }}>
          <MaterialCommunityIcons name="chart-box-outline" size={48} color="#6366F140" />
          <Text style={{ textAlign: 'center', opacity: 0.6 }}>Insights will appear once attendance logs are available for your account.</Text>
        </View>
      </View>
    );
  }

  if (!insightData) return null;

  const recommendation = {
    title: "Smart Recommendation",
    description: insightData.lateCount > 0 
      ? `Punctuality improvement needed. You have been late ${insightData.lateCount} days this month. Consider earlier commute timing.`
      : "Excellent consistency! Maintain your current commute schedule to keep your streak going.",
    icon: "creation-outline",
    color: insightData.lateCount > 2 ? "#EF4444" : "#8B5CF6",
  };

  return (
    <View
      style={{
        gap: spacing.md,
      }}
    >
      <Text
        style={{
          fontSize: typography.sizes.xs,
          fontWeight: typography.weights.semibold,
          opacity: typography.opacities.muted,
          letterSpacing: 1,
        }}
      >
        ATTENDANCE INSIGHTS
      </Text>

      <View
        style={{
          flexDirection: "row",
          gap: spacing.sm,
        }}
      >
        <View
          style={{
            flex: 1.2,
            borderRadius: radii["2xl"],
            padding: spacing.lg,
            backgroundColor: "#6366F110",
            borderWidth: 1,
            borderColor: "#6366F120",
            justifyContent: "space-between",
            minHeight: 220,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              position: "absolute",
              right: -20,
              top: -20,
              opacity: 0.08,
            }}
          >
            <MaterialCommunityIcons name="orbit" size={120} color="#6366F1" />
          </View>

          <View>
            <Text
              style={{
                fontSize: typography.sizes.xs,
                opacity: typography.opacities.muted,
                letterSpacing: 0.5,
              }}
            >
              Attendance Rate
            </Text>

            <Text
              style={{
                marginTop: spacing.sm,
                fontSize: 56,
                lineHeight: 62,
                fontWeight: typography.weights.bold,
                color: "#6366F1",
              }}
            >
              {insightData.rate}%
            </Text>
          </View>

          <Text
            style={{
              fontSize: typography.sizes.sm,
              opacity: 0.72,
              lineHeight: 22,
            }}
          >
            {insightData.rate > 90 
              ? "Excellent monthly consistency and punctuality trend." 
              : "Consider improving your daily check-in consistency."}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            gap: spacing.sm,
          }}
        >
          <View
            style={{
              flex: 1,
              borderRadius: radii.xl,
              padding: spacing.md,
              backgroundColor: "#F59E0B10",
              borderWidth: 1,
              borderColor: "#F59E0B20",
              justifyContent: "space-between",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                position: "absolute",
                right: -10,
                top: -10,
                opacity: 0.08,
              }}
            >
              <MaterialCommunityIcons
                name="vector-polyline"
                size={90}
                color="#F59E0B"
              />
            </View>

            <Text
              style={{
                fontSize: typography.sizes.xs,
                opacity: typography.opacities.muted,
                letterSpacing: 0.5,
              }}
            >
              Late Trend
            </Text>

            <Text
              style={{
                fontSize: 34,
                lineHeight: 38,
                fontWeight: typography.weights.bold,
                color: "#F59E0B",
              }}
            >
              {insightData.lateCount}
            </Text>

            <Text
              style={{
                fontSize: typography.sizes.xs,
                opacity: 0.72,
              }}
            >
              Days this month
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              borderRadius: radii.xl,
              padding: spacing.md,
              backgroundColor: "#22C55E10",
              borderWidth: 1,
              borderColor: "#22C55E20",
              justifyContent: "space-between",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                position: "absolute",
                right: -10,
                top: -10,
                opacity: 0.08,
              }}
            >
              <MaterialCommunityIcons
                name="creation"
                size={90}
                color="#22C55E"
              />
            </View>

            <Text
              style={{
                fontSize: typography.sizes.xs,
                opacity: typography.opacities.muted,
                letterSpacing: 0.5,
              }}
            >
              Current Streak
            </Text>

            <Text
              style={{
                fontSize: 34,
                lineHeight: 38,
                fontWeight: typography.weights.bold,
                color: "#22C55E",
              }}
            >
              {insightData.streak}
            </Text>

            <Text
              style={{
                fontSize: typography.sizes.xs,
                opacity: 0.72,
              }}
            >
              Consecutive days
            </Text>
          </View>
        </View>
      </View>
      <View
        style={{
          borderRadius: radii["2xl"],
          padding: spacing.lg,
          backgroundColor: `${recommendation.color}10`,
          borderWidth: 1,
          borderColor: `${recommendation.color}20`,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            position: "absolute",
            right: -20,
            bottom: -20,
            opacity: 0.08,
          }}
        >
          <MaterialCommunityIcons
            name="creation"
            size={120}
            color={recommendation.color}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: spacing.lg,
          }}
        >
          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              style={{
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.semibold,
                color: recommendation.color,
                opacity: typography.opacities.muted,
                letterSpacing: 0.8,
              }}
            >
              SMART RECOMMENDATION
            </Text>

            <Text
              style={{
                marginTop: spacing.sm,
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.bold,
                lineHeight: 30,
              }}
            >
              {insightData.lateCount > 0 ? "Improve punctuality with earlier commute." : "Keep up the excellent punctuality!"}
            </Text>

            <Text
              style={{
                marginTop: spacing.sm,
                fontSize: typography.sizes.sm,
                lineHeight: 22,
                opacity: 0.78,
              }}
            >
              {recommendation.description}
            </Text>
          </View>

          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: radii.full,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: `${recommendation.color}16`,
            }}
          >
            <MaterialCommunityIcons
              name={recommendation.icon as any}
              size={24}
              color={recommendation.color}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
