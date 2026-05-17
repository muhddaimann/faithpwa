import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDesign } from "../../contexts/designContext";
import { newsflashPriorities } from "../../constants/newsflash";

type NewsflashCardProps = {
  newsflash: {
    id: number;
    type: string;
    priority: string;
    title: string;
    content: string;
    timestamp: string;
  };
};

export default function NewsflashCard({ newsflash }: NewsflashCardProps) {
  const { colors } = useTheme();
  const tokens = useDesign();

  const [acknowledged, setAcknowledged] = useState(false);

  const priority = newsflashPriorities[newsflash.priority];

  return (
    <Pressable
      onPress={() => setAcknowledged(true)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 28,
          overflow: "hidden",
          opacity: acknowledged ? 0.82 : 1,
          width: "100%"
        }}
      >
        <View
          style={{
            backgroundColor: priority.cardColor,
            padding: tokens.spacing.lg,
            gap: tokens.spacing.md,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              position: "absolute",
              top: -24,
              right: -10,
              opacity: 0.08,
              transform: [{ rotate: "-10deg" }],
            }}
          >
            <MaterialCommunityIcons
              name={priority.icon}
              size={140}
              color={colors.onPrimary}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <View
              style={{
                paddingHorizontal: tokens.spacing.sm,
                paddingVertical: 6,
                borderRadius: tokens.radii.full,
                backgroundColor: "#2563EB",
              }}
            >
              <Text
                variant="labelSmall"
                style={{
                  color: "#FFFFFF",
                  fontWeight: "700",
                }}
              >
                {newsflash.type}
              </Text>
            </View>

            <View
              style={{
                paddingHorizontal: tokens.spacing.sm,
                paddingVertical: 6,
                borderRadius: tokens.radii.full,
                backgroundColor: priority.color,
              }}
            >
              <Text
                variant="labelSmall"
                style={{
                  color: "#FFFFFF",
                  fontWeight: "700",
                }}
              >
                {priority.label}
              </Text>
            </View>

            {acknowledged && (
              <View
                style={{
                  paddingHorizontal: tokens.spacing.sm,
                  paddingVertical: 6,
                  borderRadius: tokens.radii.full,
                  backgroundColor: "#16A34A",
                }}
              >
                <Text
                  variant="labelSmall"
                  style={{
                    color: "#FFFFFF",
                    fontWeight: "700",
                  }}
                >
                  Acknowledged
                </Text>
              </View>
            )}
          </View>

          <Text
            variant="titleLarge"
            style={{
              color: colors.onPrimary,
              fontWeight: "800",
            }}
          >
            {newsflash.title}
          </Text>
        </View>

        <View
          style={{
            padding: tokens.spacing.lg,
            gap: tokens.spacing.md,
          }}
        >
          <Text
            variant="bodyMedium"
            numberOfLines={2}
            ellipsizeMode="tail"
            style={{
              color: colors.onSurfaceVariant,
              lineHeight: 24,
            }}
          >
            {newsflash.content}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              variant="bodySmall"
              style={{
                color: colors.onSurfaceVariant,
              }}
            >
              {acknowledged ? "Acknowledged just now" : newsflash.timestamp}
            </Text>

            <MaterialCommunityIcons
              name={acknowledged ? "check-all" : "gesture-tap"}
              size={18}
              color={acknowledged ? "#16A34A" : colors.primary}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
