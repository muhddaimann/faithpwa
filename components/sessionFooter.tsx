import React from "react";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDesign } from "../contexts/designContext";
import { useSession } from "../hooks/useSession";

// Subtle end-of-scroll footer on Home: a small "last sign-in + client IP" line.
export default function SessionFooter() {
  const theme = useTheme();
  const tokens = useDesign();
  const { lastLogin, clientIp, platform } = useSession();

  return (
    <View
      style={{
        alignItems: "center",
        paddingTop: tokens.spacing.xl,
        paddingBottom: tokens.spacing.md,
        gap: 6,
      }}
    >
      <View
        style={{
          width: 32,
          height: 4,
          borderRadius: 2,
          backgroundColor: theme.colors.outlineVariant,
          marginBottom: 4,
        }}
      />

      <MaterialCommunityIcons
        name="shield-check-outline"
        size={16}
        color={theme.colors.onSurfaceVariant}
      />

      {lastLogin ? (
        <>
          <Text
            variant="labelSmall"
            style={{ color: theme.colors.onSurfaceVariant, opacity: 0.7 }}
          >
            Last sign-in · {lastLogin}
          </Text>
          {clientIp && (
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.onSurfaceVariant, opacity: 0.5 }}
            >
              IP {clientIp}
              {platform ? ` · ${platform}` : ""}
            </Text>
          )}
        </>
      ) : (
        <Text
          variant="labelSmall"
          style={{ color: theme.colors.onSurfaceVariant, opacity: 0.6 }}
        >
          You're all caught up
        </Text>
      )}
    </View>
  );
}
