import React, { useEffect, useRef, useState } from "react";
import { View, Animated, Pressable } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDesign } from "../../contexts/designContext";

type Props = {
  onAcknowledge: () => void;
  acknowledged?: boolean;
  duration?: number;
};

export default function AcknowledgeButton({
  onAcknowledge,
  acknowledged = false,
  duration = 3000,
}: Props) {
  const theme = useTheme();
  const { spacing, radii } = useDesign();
  const totalSeconds = Math.ceil(duration / 1000);
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [ready, setReady] = useState(acknowledged);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (acknowledged) {
      setReady(true);
      return;
    }

    Animated.timing(progress, {
      toValue: 1,
      duration,
      useNativeDriver: false,
    }).start();

    const start = Date.now();
    const interval = setInterval(() => {
      const remaining = Math.ceil((duration - (Date.now() - start)) / 1000);
      if (remaining <= 0) {
        setSecondsLeft(0);
        setReady(true);
        clearInterval(interval);
      } else {
        setSecondsLeft(remaining);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [acknowledged, duration, progress]);

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const counting = !acknowledged && !ready;

  const background = acknowledged
    ? theme.colors.secondaryContainer
    : ready
    ? theme.colors.primary
    : theme.colors.surfaceVariant;

  const foreground = acknowledged
    ? theme.colors.onSecondaryContainer
    : ready
    ? theme.colors.onPrimary
    : theme.colors.onSurfaceVariant;

  const label = acknowledged
    ? "ACKNOWLEDGED"
    : ready
    ? "ACKNOWLEDGE MEMO"
    : `READING • ${secondsLeft}s`;

  const icon = acknowledged
    ? "check-bold"
    : ready
    ? "check-circle"
    : "timer-sand";

  return (
    <Pressable
      disabled={counting || acknowledged}
      onPress={onAcknowledge}
      style={{
        height: 52,
        marginTop: spacing.xs,
        borderRadius: radii.md,
        backgroundColor: background,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {counting && (
        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: fillWidth,
            backgroundColor: theme.colors.primary + "30",
          }}
        />
      )}

      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
        <MaterialCommunityIcons name={icon as any} size={18} color={foreground} />
        <Text style={{ color: foreground, fontWeight: "800", letterSpacing: 0.5 }}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
