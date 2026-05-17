import React from "react";
import { View, Pressable } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDesign } from "../contexts/designContext";

type SectionHeaderProps = {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionRoute?: string;
};

export default function SectionHeader({
  icon,
  title,
  subtitle,
  actionLabel,
  actionRoute,
}: SectionHeaderProps) {
  const { colors } = useTheme();
  const tokens = useDesign();
  const router = useRouter();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: tokens.spacing.md,
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          gap: tokens.spacing.md,
        }}
      >
        {icon && (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: tokens.radii.full,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={colors.onPrimary}
            />
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text variant="titleMedium">{title}</Text>

          {subtitle && (
            <Text
              variant="bodySmall"
              style={{ color: colors.onSurfaceVariant }}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {actionLabel && actionRoute && (
        <Pressable
          onPress={() => router.push(actionRoute as never)}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text
            variant="labelLarge"
            style={{
              color: colors.primary,
              fontWeight: "600",
            }}
          >
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}