import React, { useMemo, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { design } from "../../constants/design";
import {
  NewsflashPriority,
  newsflashFilters,
  newsflashPriorities,
} from "../../constants/newsflash";
import { useNewsflash } from "../../hooks/useNewsflash";
import { formatNewsDate } from "../../helpers/newsflash";

export default function NewsflashList() {
  const theme = useTheme();
  const { spacing, radii, typography } = design;
  const { broadcasts, loading, showDetails, isAcknowledged } = useNewsflash();

  const [activeFilter, setActiveFilter] = useState<NewsflashPriority | "All">(
    "All"
  );

  const normalizePriority = (p?: string): NewsflashPriority => {
    if (!p) return "Normal";
    const normalized = p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
    if (normalized === "Critical" || normalized === "Important" || normalized === "Normal") {
      return normalized as NewsflashPriority;
    }
    return "Normal";
  };

  const filteredNews = useMemo(() => {
    if (activeFilter === "All") return broadcasts;
    return broadcasts.filter((item) => normalizePriority(item.BroadcastPriority) === activeFilter);
  }, [activeFilter, broadcasts]);

  if (loading && broadcasts.length === 0) {
    return (
      <View style={{ padding: spacing.xl, alignItems: "center" }}>
        <Text>Loading announcements...</Text>
      </View>
    );
  }

  return (
    <View style={{ gap: spacing.md }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.sm, paddingVertical: 2 }}
      >
        {newsflashFilters.map((item) => {
          const active = activeFilter === item;
          const statusColor =
            item === "All"
              ? theme.colors.primary
              : newsflashPriorities[item].color;

          return (
            <TouchableOpacity
              key={item}
              activeOpacity={0.8}
              onPress={() => setActiveFilter(item)}
              style={{
                paddingHorizontal: spacing.md,
                height: 36,
                borderRadius: radii.full,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: active
                  ? statusColor
                  : theme.colors.surfaceVariant,
                borderWidth: active ? 0 : 1,
                borderColor: `${theme.colors.outline}15`,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: active ? "800" : "600",
                  color: active ? "#FFF" : theme.colors.onSurfaceVariant,
                }}
              >
                {item.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={{ gap: spacing.sm }}>
        {filteredNews.map((item, index) => {
          const priorityKey = normalizePriority(item.BroadcastPriority);
          const priority = newsflashPriorities[priorityKey];
          const acknowledged = isAcknowledged(item);

          return (
            <TouchableOpacity
              key={`${item.ID}-${index}`}
              activeOpacity={0.7}
              onPress={() => showDetails(item)}
              style={{
                flexDirection: "row",
                borderRadius: radii.xl,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: `${theme.colors.outline}1A`,
                overflow: "hidden",
              }}
            >
              {/* Priority accent rail */}
              <View style={{ width: 4, backgroundColor: priority.color }} />

              <View style={{ flex: 1, padding: spacing.md, gap: spacing.xs }}>
                {/* Header: priority + meta */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={priority.icon as any}
                      size={14}
                      color={priority.color}
                    />
                    <Text
                      style={{
                        fontSize: typography.sizes.xs,
                        fontWeight: "800",
                        color: priority.color,
                        letterSpacing: 0.5,
                      }}
                    >
                      {priority.label.toUpperCase()}
                    </Text>
                  </View>

                  <Text
                    style={{
                      fontSize: typography.sizes.xs,
                      color: theme.colors.onSurfaceVariant,
                      fontWeight: "600",
                    }}
                  >
                    {formatNewsDate(item.CreatedDateTime)}
                  </Text>
                </View>

                {/* Title */}
                <Text
                  numberOfLines={2}
                  style={{
                    fontSize: typography.sizes.sm,
                    fontWeight: "700",
                    lineHeight: 20,
                    color: theme.colors.onSurface,
                  }}
                >
                  {item.NewsName}
                </Text>

                {/* Footer: type + acknowledge indicator */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 2,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      flex: 1,
                      fontSize: typography.sizes.xs,
                      color: theme.colors.onSurfaceVariant,
                      fontWeight: "600",
                    }}
                  >
                    {item.BroadcastType}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: radii.full,
                      backgroundColor: acknowledged
                        ? "#22C55E18"
                        : `${priority.color}14`,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={acknowledged ? "check-circle" : "circle-medium"}
                      size={13}
                      color={acknowledged ? "#22C55E" : priority.color}
                    />
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "800",
                        letterSpacing: 0.4,
                        color: acknowledged ? "#22C55E" : priority.color,
                      }}
                    >
                      {acknowledged ? "ACKNOWLEDGED" : "UNREAD"}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
