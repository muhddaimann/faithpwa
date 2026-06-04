import React, { useEffect, useRef } from "react";
import { Animated, View, Pressable, Easing, Platform } from "react-native";
import { Surface, Text, useTheme, Icon, Portal } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDesign } from "../../contexts/designContext";

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

type Props = {
  visible: boolean;
  message: string;
  onDismiss: () => void;
  duration?: number;
  variant?: ToastVariant;
  icon?: string;
};

export function OverlayToast({
  visible,
  message,
  onDismiss,
  duration = 3000,
  variant = "default",
  icon,
}: Props) {
  const theme = useTheme();
  const tokens = useDesign();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  const variantConfig = {
    default: {
      bg: theme.colors.surface,
      text: theme.colors.onSurfaceVariant,
      icon: icon ?? "information",
      accent: theme.colors.onSurfaceVariant,
    },
    success: {
      bg: theme.colors.surface,
      text: theme.colors.onSurface,
      icon: icon ?? "check-circle",
      accent: theme.colors.tertiary,
    },
    error: {
      bg: theme.colors.surface,
      text: theme.colors.onSurface,
      icon: icon ?? "alert-circle",
      accent: theme.colors.error,
    },
    warning: {
      bg: theme.colors.surface,
      text: theme.colors.onSurface,
      icon: icon ?? "alert",
      accent: theme.colors.secondary,
    },
    info: {
      bg: theme.colors.surface,
      text: theme.colors.onSurface,
      icon: icon ?? "information",
      accent: theme.colors.primary,
    },
  }[variant];

  useEffect(() => {
    if (!visible) return;

    // Reset progress
    progress.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(progress, {
        toValue: 1,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ]).start();

    const timer = setTimeout(hide, duration);

    return () => clearTimeout(timer);
  }, [visible, duration]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(onDismiss);
  };

  if (!visible) return null;

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Portal>
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          alignItems: "center",
          paddingHorizontal: tokens.spacing.md,
          paddingTop: insets.top + tokens.spacing.xs,
        }}
      >
        <Animated.View
          renderToHardwareTextureAndroid
          style={{
            width: "100%",
            maxWidth: 500,
            alignSelf: "center",
            opacity,
            transform: [{ translateY }],
          }}
        >
          <Pressable onPress={hide}>
            {({ pressed }) => (
              <Surface
                style={{
                  borderRadius: tokens.radii.lg,
                  backgroundColor: variantConfig.bg,
                }}
              >
                <View
                  style={{
                    minHeight: 56,
                    borderRadius: tokens.radii.lg,
                    overflow: "hidden", // Clip progress bar here
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: tokens.spacing.sm,
                      paddingHorizontal: tokens.spacing.lg,
                      flex: 1,
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Icon
                        source={variantConfig.icon}
                        size={20}
                        color={variantConfig.accent}
                      />
                    </View>

                    <Text
                      variant="bodyMedium"
                      style={{
                        flex: 1,
                        marginLeft: tokens.spacing.md,
                        color: variantConfig.text,
                        fontWeight: "500",
                      }}
                    >
                      {message}
                    </Text>
                  </View>

                  {/* Progress Indicator */}
                  <View
                    style={{
                      height: 3,
                      width: "100%",
                      position: "absolute",
                      bottom: 0,
                    }}
                  >
                    <Animated.View
                      style={{
                        height: "100%",
                        width: progressWidth,
                        backgroundColor: variantConfig.accent,
                        opacity: 0.9,
                      }}
                    />
                  </View>
                </View>
              </Surface>
            )}
          </Pressable>
        </Animated.View>
      </View>
    </Portal>
  );
}
