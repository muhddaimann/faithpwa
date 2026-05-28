import React, { useMemo, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Text, useTheme, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { design } from "../../constants/design";
import { useOverlay } from "../../contexts/overlayContext";
import {
  NewsflashPriority,
  newsflashFilters,
  newsflashPriorities,
} from "../../constants/newsflash";
import { useNewsflash } from "../../hooks/useNewsflash";
import { type Broadcast } from "../../contexts/api/broadcast";

export default function NewsflashList() {
  const theme = useTheme();
  const { spacing, radii } = design;
  const { broadcasts, loading, showDetails } = useNewsflash();

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

          return (
            <TouchableOpacity
              key={`${item.broadcast_id}-${index}`}
              activeOpacity={0.7}
              onPress={() => showDetails(item)}
              style={{
                borderRadius: 28,
                padding: spacing.lg,
                backgroundColor: theme.colors.surface,
                elevation: 1,
                overflow: "hidden",
                gap: spacing.xs,
              }}
            >
              {/* Background Decorative Icon */}
              <View
                style={{
                  position: "absolute",
                  right: -15,
                  top: -15,
                  opacity: 0.06,
                  transform: [{ rotate: "-15deg" }],
                }}
              >
                <MaterialCommunityIcons
                  name={priority.icon as any}
                  size={110}
                  color={priority.color}
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: radii.full,
                    backgroundColor: priority.color + "15",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: priority.color,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "800",
                      color: priority.color,
                      letterSpacing: 0.5,
                    }}
                  >
                    {item.BroadcastPriority.toUpperCase()}
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: 11,
                    color: theme.colors.onSurfaceVariant,
                    fontWeight: "600",
                  }}
                >
                  {new Date(item.CreatedDateTime).toLocaleDateString()}
                </Text>
              </View>

              <View style={{ marginTop: spacing.xs }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "800",
                    color: theme.colors.onSurface,
                  }}
                >
                  {item.NewsName}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: theme.colors.onSurfaceVariant,
                    marginTop: 2,
                    fontWeight: "600",
                  }}
                >
                  {item.BroadcastType}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
