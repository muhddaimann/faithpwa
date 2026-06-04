import React, { useEffect, useRef } from "react";
import { Pressable, Animated, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { useDesign } from "../contexts/designContext";

export default function ScrollTop({
  visible,
  onPress,
}: {
  visible: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const tokens = useDesign();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 180,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(translateY, {
        toValue: visible ? 0 : -10,
        duration: 180,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [visible]);

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={{
        position: "absolute",
        top: tokens.spacing.lg,
        left: "50%",
        transform: [{ translateX: -22 }, { translateY }],
        opacity,
      }}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          width: 44,
          height: 44,
          borderRadius: tokens.radii.full,
          backgroundColor: theme.colors.primary,
          alignItems: "center",
          justifyContent: "center",
          elevation: 12,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        })}
      >
        <MaterialCommunityIcons
          name="chevron-up"
          size={22}
          color={theme.colors.onPrimary}
        />
      </Pressable>
    </Animated.View>
  );
}
