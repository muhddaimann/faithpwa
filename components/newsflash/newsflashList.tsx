import React, { useMemo, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Text, useTheme, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { design } from "../../constants/design";
import { useOverlay } from "../../contexts/overlayContext";
import {
  NewsflashItem,
  NewsflashPriority,
  newsflashFilters,
  newsflashes,
  newsflashPriorities,
} from "../../constants/newsflash";

export default function NewsflashList() {
  const theme = useTheme();
  const { showSheet } = useOverlay();
  const { spacing, radii } = design;

  const [activeFilter, setActiveFilter] = useState<NewsflashPriority | "All">(
    "All"
  );

  const filteredNews = useMemo(() => {
    if (activeFilter === "All") return newsflashes;
    return newsflashes.filter((item) => item.priority === activeFilter);
  }, [activeFilter]);

  const handleShowDetails = (item: NewsflashItem) => {
    const priority = newsflashPriorities[item.priority];

    showSheet({
      title: "Announcement Details",
      content: (
        <View style={{ gap: spacing.lg, paddingBottom: spacing.lg }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.md,
            }}
          >
            <View
              style={{
                backgroundColor: priority.color + "15",
                padding: spacing.md,
                borderRadius: 16,
              }}
            >
              <MaterialCommunityIcons
                name={priority.icon as any}
                size={32}
                color={priority.color}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="titleLarge" style={{ fontWeight: "800" }}>
                {item.title}
              </Text>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {item.type} • {item.priority} Priority
              </Text>
            </View>
          </View>

          <Divider />

          <View style={{ gap: spacing.sm }}>
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.onSurfaceVariant, fontWeight: "700" }}
            >
              MESSAGE
            </Text>
            <View
              style={{
                backgroundColor: theme.colors.surfaceVariant + "40",
                padding: spacing.md,
                borderRadius: radii.lg,
              }}
            >
              <Text variant="bodyMedium" style={{ lineHeight: 22 }}>
                {item.content}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ gap: 4 }}>
              <Text
                variant="labelSmall"
                style={{
                  color: theme.colors.onSurfaceVariant,
                  fontWeight: "700",
                }}
              >
                POSTED
              </Text>
              <Text variant="bodyMedium">{item.timestamp}</Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: 4 }}>
              <Text
                variant="labelSmall"
                style={{
                  color: theme.colors.onSurfaceVariant,
                  fontWeight: "700",
                }}
              >
                REFERENCE ID
              </Text>
              <Text variant="bodyMedium">#NF-{item.id.toString().padStart(4, "0")}</Text>
            </View>
          </View>
        </View>
      ),
    });
  };

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
        {filteredNews.map((item) => {
          const priority = newsflashPriorities[item.priority];

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={() => handleShowDetails(item)}
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
                    {item.priority.toUpperCase()}
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: 11,
                    color: theme.colors.onSurfaceVariant,
                    fontWeight: "600",
                  }}
                >
                  {item.timestamp}
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
                  {item.title}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: theme.colors.onSurfaceVariant,
                    marginTop: 2,
                    fontWeight: "600",
                  }}
                >
                  {item.type}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
